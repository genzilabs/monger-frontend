<script lang="ts">
  import { Card, EmptyState, PrivacyToggle } from "$lib/components/ui";
  import {
    TransactionDetailSheet,
    EditTransactionModal,
    TransactionFilterModal,
  } from "$lib/components/modals";
  import { booksStore, privacyStore } from "$lib/stores";
  import {
    transactionsApi,
    type ListByBookOptions,
  } from "$lib/api/transactions";
  import type { Transaction } from "$lib/types/transaction";
  import DailyTransactionList from "$lib/components/transactions/DailyTransactionList.svelte";
  import MonthlyTransactionSummary from "$lib/components/transactions/MonthlyTransactionSummary.svelte";
  import TransactionTotalSummary from "$lib/components/transactions/TransactionTotalSummary.svelte";
  import PeriodSummary from "$lib/components/transactions/PeriodSummary.svelte";
  import { untrack } from "svelte";
  import { SlidersIcon } from "$lib/icons";

  // Tab state
  type TabType = "daily" | "monthly" | "total";
  let activeTab = $state<TabType>("daily");

  // State
  let transactions = $state<Transaction[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let hasMore = $state(true);

  // Filter state
  let selectedPocketId = $state<string | null>(null);
  let selectedType = $state<"all" | "income" | "expense" | "transfer">("all");
  let startDate = $state("");
  let endDate = $state("");
  let showFilterModal = $state(false);

  let offset = $state(0);
  const limit = 50; // Load more for grouping purposes

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
    loadTransactions(true);
  }

  function handleTransactionDeleted() {
    loadTransactions(true);
  }

  async function loadTransactions(reset = false) {
    const activeBook = booksStore.activeBook;
    if (!activeBook) return;

    if (reset) {
      offset = 0;
      transactions = [];
      hasMore = true;
    }

    isLoading = true;
    error = null;

    try {
      const options: ListByBookOptions = {
        limit,
        offset,
        type: selectedType !== "all" ? selectedType : undefined,
      };

      let result;

      if (selectedPocketId) {
        result = await transactionsApi.listByPocket(selectedPocketId, options);
      } else {
        result = await transactionsApi.listByBook(activeBook.id, options);
      }

      if (result.data) {
        const newTxs = result.data || [];
        // Filter by date range if specified
        let filtered = newTxs;
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          filtered = filtered.filter((tx) => new Date(tx.date) >= start);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filtered = filtered.filter((tx) => new Date(tx.date) <= end);
        }

        if (reset) {
          transactions = filtered;
        } else {
          transactions = [...transactions, ...filtered];
        }
        hasMore = newTxs.length === limit;
        offset += newTxs.length;
      } else if (result.error) {
        error = result.error.error;
      }
    } catch (e: any) {
      error = e.message || "Gagal memuat transaksi";
    } finally {
      isLoading = false;
    }
  }

  function handleFilterApply(filters: {
    pocketId: string | null;
    type: "all" | "income" | "expense" | "transfer";
    startDate: string;
    endDate: string;
  }) {
    selectedPocketId = filters.pocketId;
    selectedType = filters.type;
    startDate = filters.startDate;
    endDate = filters.endDate;
    loadTransactions(true);
  }

  function loadMore() {
    if (!isLoading && hasMore) {
      loadTransactions(false);
    }
  }

  // Check if any filters are active
  const hasActiveFilters = $derived(
    selectedPocketId !== null ||
      selectedType !== "all" ||
      startDate !== "" ||
      endDate !== "",
  );

  // Load when active book changes (only when book ID actually changes)
  $effect(() => {
    const currentBookId = booksStore.activeBook?.id ?? null;

    // Only reload if the book ID changed
    if (currentBookId !== untrack(() => loadedBookId)) {
      loadedBookId = currentBookId;
      if (currentBookId) {
        untrack(() => loadTransactions(true));
      }
    }
  });

  const tabs = [
    { id: "daily" as TabType, label: "Harian" },
    { id: "monthly" as TabType, label: "Bulanan" },
    { id: "total" as TabType, label: "Total" },
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
        class="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-secondary hover:text-foreground hover:border-primary/50 transition-all {hasActiveFilters
          ? 'border-primary text-primary'
          : ''}"
      >
        <SlidersIcon size={16} />
        <span>Filter</span>
        {#if hasActiveFilters}
          <span class="w-2 h-2 rounded-full bg-primary"></span>
        {/if}
      </button>
    </div>
    <p class="text-secondary text-sm mt-1">
      {#if booksStore.activeBook}
        {#if selectedPocketId}
          {booksStore.pockets.find((p) => p.id === selectedPocketId)?.name ||
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
    <PeriodSummary
      {transactions}
      currency={booksStore.activeBook?.base_currency}
      loading={isLoading}
    />

    <!-- Tab Content -->
    <div class="min-h-[200px]">
      {#if activeTab === "daily"}
        <DailyTransactionList
          {transactions}
          currency={booksStore.activeBook?.base_currency}
          loading={isLoading}
          onTransactionClick={openDetail}
        />

        <!-- Load More for Daily -->
        {#if hasMore && transactions.length > 0}
          <div class="pt-4 text-center">
            <button
              onclick={loadMore}
              disabled={isLoading}
              class="px-6 py-2 text-sm font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {#if isLoading}
                Memuat...
              {:else}
                Muat Lebih Banyak
              {/if}
            </button>
          </div>
        {/if}
      {:else if activeTab === "monthly"}
        <MonthlyTransactionSummary
          {transactions}
          currency={booksStore.activeBook?.base_currency}
          loading={isLoading}
        />
      {:else if activeTab === "total"}
        <TransactionTotalSummary
          {transactions}
          currency={booksStore.activeBook?.base_currency}
          loading={isLoading}
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
  {selectedPocketId}
  {selectedType}
  {startDate}
  {endDate}
  onApply={handleFilterApply}
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
