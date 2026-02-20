<script lang="ts">
  import { Card, EmptyState, PrivacyToggle } from "$lib/components/ui";
  import {
    DailyTransactionList,
    MonthlyTransactionSummary,
    TransactionTotalSummary,
    CalendarView,
    PeriodSummary,
  } from "$lib/components/transactions";
  import {
    TransactionDetailSheet,
    EditTransactionModal,
    TransactionFilterModal,
  } from "$lib/components/modals";
  import { booksStore, categoriesStore, uiStore } from "$lib/stores";
  import {
    transactionsApi,
    type ListByBookOptions,
  } from "$lib/api/transactions";
  import type { Transaction } from "$lib/types/transaction";
  import { untrack } from "svelte";
  import { SlidersIcon } from "$lib/icons";

  import { createTransactionListState } from "./transactionListState.svelte";

  // Tab state
  type TabType = "daily" | "monthly" | "total" | "calendar";
  let activeTab = $state<TabType>("daily");

  const listState = createTransactionListState();

  let showFilterModal = $state(false);

  // Track loaded book to prevent duplicate fetches
  let loadedBookId = $state<string | null>(null);

  // Transaction detail sheet
  let selectedTransaction = $state<Transaction | null>(null);
  let showDetailSheet = $state(false);

  // Edit modal
  let showEditModal = $state(false);

  function openDetail(tx: Transaction) {
    selectedTransaction = tx;
    showDetailSheet = true;
  }

  function closeDetail() {
    showDetailSheet = false;
  }

  function handleEdit(tx: Transaction) {
    selectedTransaction = tx;
    showDetailSheet = false;
    showEditModal = true;
  }

  function handleTransactionUpdated() {
    listState.load(true);
  }

  function handleTransactionDeleted() {
    listState.load(true);
  }

  function loadMore() {
    if (!listState.isLoading && listState.hasMore) {
      listState.load(false);
    }
  }

  // Track if period has been initialized
  let periodInitialized = $state(false);

  // Track period dates for calendar view
  let currentPeriodStart = $state<Date>(new Date());
  let currentPeriodEnd = $state<Date>(new Date());

  // Load when active book changes (only when book ID actually changes)
  $effect(() => {
    const currentBookId = booksStore.activeBook?.id ?? null;

    // Only reload if the book ID changed
    if (currentBookId !== untrack(() => loadedBookId)) {
      loadedBookId = currentBookId;
      if (currentBookId) {
        // Load categories for the filter modal
        untrack(() => categoriesStore.load(currentBookId));
        // Load transactions - PeriodSummary will set dates and reload if needed
        untrack(() => listState.load(true));
      }
    }
  });

  // Refresh when a transaction is created from the global modal
  let lastRefreshTrigger = $state(0);
  $effect(() => {
    const trigger = uiStore.transactionRefreshTrigger;
    if (trigger > untrack(() => lastRefreshTrigger)) {
      lastRefreshTrigger = trigger;
      // Reload transactions
      untrack(() => listState.load(true));
    }
  });

  // Auto-load more transactions when switching to monthly/total tabs
  // These views need all transactions for proper aggregation
  $effect(() => {
    const tab = activeTab;
    const hasError = listState.error;

    if (
      (tab === "monthly" || tab === "total" || tab === "calendar") &&
      listState.hasMore &&
      !listState.isLoading &&
      !hasError
    ) {
      untrack(() => listState.loadAllRemaining());
    }
  });

  const tabs = [
    { id: "daily" as TabType, label: "Harian" },
    { id: "monthly" as TabType, label: "Bulanan" },
    { id: "total" as TabType, label: "Total" },
    { id: "calendar" as TabType, label: "Kalender" },
  ];
</script>

<svelte:head>
  <title>Transaksi - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-4 pb-24">
  <!-- Header -->
  <div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold text-foreground">Riwayat Transaksi</h1>
        <PrivacyToggle />
      </div>

      <!-- Filter Button -->
      <button
        onclick={() => (showFilterModal = true)}
        class="relative flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-secondary hover:text-foreground hover:border-primary/50 transition-all {listState.hasActiveFilters
          ? 'border-primary text-primary'
          : ''}"
      >
        <SlidersIcon size={16} />
        <span>Filter</span>
        {#if listState.hasActiveFilters}
          <span
            class="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary"
          ></span>
        {/if}
      </button>
    </div>

    <!-- Period Filter (Current Selected Book / Pocket / Filter) -->
    <p class="text-xs text-muted mt-2">
      {#if booksStore.activeBook}
        {#if listState.selectedPocketId}
          {booksStore.pockets.find((p) => p.id === listState.selectedPocketId)?.name ||
            "Kantong"}
        {:else}
          {booksStore.activeBook.name}
        {/if}
      {:else}
        <span class="text-muted">Pilih buku dulu</span>
      {/if}
    </p>
  </div>

  {#if booksStore.activeBook}
    <!-- Top-Level Tabs -->
    <div class="flex p-1 bg-surface rounded-xl border border-border">
      {#each tabs as tab}
        <button
          onclick={() => (activeTab = tab.id)}
          class="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all {activeTab ===
          tab.id
            ? 'bg-primary text-white shadow-sm'
            : 'text-secondary hover:text-foreground'}"
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <!-- Period Summary Section -->
    {#if activeTab === "daily"}
      <PeriodSummary
        transactions={listState.transactions}
        currency={booksStore.activeBook?.base_currency}
        loading={listState.isLoading}
        onPeriodChange={(startStr, endStr) => {
          currentPeriodStart = new Date(startStr);
          currentPeriodEnd = new Date(endStr);
          periodInitialized = true;
          listState.load(true);
        }}
      />
    {:else}
      <PeriodSummary
        transactions={listState.transactions}
        currency={booksStore.activeBook?.base_currency}
        loading={listState.isLoading}
        onPeriodChange={(startStr, endStr) => {
          currentPeriodStart = new Date(startStr);
          currentPeriodEnd = new Date(endStr);
          periodInitialized = true;
          listState.load(true);
        }}
      />
    {/if}

    <!-- Tab Content -->
    <div class="min-h-[200px]">
      {#if activeTab === "daily"}
        <DailyTransactionList
          transactions={listState.transactions}
          currency={booksStore.activeBook?.base_currency}
          loading={listState.isLoading}
          onTransactionClick={openDetail}
          {loadMore}
          hasMore={listState.hasMore}
        />
      {:else if activeTab === "monthly"}
        <MonthlyTransactionSummary
          transactions={listState.transactions}
          currency={booksStore.activeBook?.base_currency}
          loading={listState.isLoading}
        />
      {:else if activeTab === "total"}
        <TransactionTotalSummary
          transactions={listState.transactions}
          currency={booksStore.activeBook?.base_currency}
          loading={listState.isLoading}
        />
      {:else if activeTab === "calendar"}
        <CalendarView
          transactions={listState.transactions}
          currency={booksStore.activeBook?.base_currency}
          loading={listState.isLoading}
          periodStart={currentPeriodStart}
          periodEnd={currentPeriodEnd}
        />
      {/if}
    </div>
  {:else}
    <!-- Loading Skeleton when books not yet initialized -->
    <EmptyState title="Pilih Buku" description="Pilih buku di sidebar dulu ya.">
      {#snippet icon()}
        <svg
          class="w-8 h-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      {/snippet}
    </EmptyState>
  {/if}
</div>

<!-- Filter Modal -->
<TransactionFilterModal
  open={showFilterModal}
  onClose={() => (showFilterModal = false)}
  pockets={booksStore.pockets}
  selectedPocketId={listState.selectedPocketId}
  selectedType={listState.selectedType}
  selectedCategoryId={listState.selectedCategoryId}
  searchQuery={listState.searchQuery}
  startDate={listState.startDate}
  endDate={listState.endDate}
  onApply={listState.applyFilters}
  onReset={() => {
    listState.resetFilters();
    listState.load(true);
  }}
/>

<!-- Transaction Detail Sheet -->
<TransactionDetailSheet
  transaction={selectedTransaction}
  currency={booksStore.activeBook?.base_currency}
  open={showDetailSheet}
  onClose={closeDetail}
  onEdit={handleEdit}
  onDeleted={handleTransactionDeleted}
/>

<!-- Edit Transaction Modal -->
<EditTransactionModal
  transaction={selectedTransaction}
  open={showEditModal}
  onClose={() => (showEditModal = false)}
  onSaved={handleTransactionUpdated}
/>
