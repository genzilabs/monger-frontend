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
  import { booksStore, categoriesStore } from "$lib/stores"; // privacyStore removed
  import {
    transactionsApi,
    type ListByBookOptions,
  } from "$lib/api/transactions";
  import type { Transaction } from "$lib/types/transaction";
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
  let selectedCategoryId = $state<string | null>(null);
  let searchQuery = $state("");
  let startDate = $state("");
  let endDate = $state("");
  let showFilterModal = $state(false);

  // Cursor pagination state
  let nextCursor = $state<string | undefined>(undefined);
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
      nextCursor = undefined;
      transactions = [];
      hasMore = true;
    }

    isLoading = true;
    error = null;

    try {
      const options: ListByBookOptions = {
        limit,
        cursor: reset ? undefined : nextCursor,
        search: searchQuery || undefined,
        type: selectedType !== "all" ? selectedType : undefined,
        categoryId: selectedCategoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      let result;

      if (selectedPocketId) {
        result = await transactionsApi.listByPocket(selectedPocketId, options);
      } else {
        result = await transactionsApi.listByBook(activeBook.id, options);
      }

      if (result.data) {
        const response = result.data;
        const newTxs = response.transactions || [];

        if (reset) {
          transactions = newTxs;
        } else {
          transactions = [...transactions, ...newTxs];
        }
        
        // Update cursor and hasMore from response
        nextCursor = response.next_cursor;
        hasMore = response.has_more;
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
    categoryId: string | null;
    search: string;
    startDate: string;
    endDate: string;
  }) {
    selectedPocketId = filters.pocketId;
    selectedType = filters.type;
    selectedCategoryId = filters.categoryId;
    searchQuery = filters.search;
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
      selectedCategoryId !== null ||
      searchQuery !== "" ||
      startDate !== "" ||
      endDate !== "",
  );

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
        untrack(() => loadTransactions(true));
      }
    }
  });

  // Auto-load more transactions when switching to monthly/total tabs
  // These views need all transactions for proper aggregation
  $effect(() => {
    // Track the active tab
    const tab = activeTab;
    
    // If we're on monthly or total tab and there are more transactions to load
    if ((tab === "monthly" || tab === "total" || tab === "calendar") && hasMore && !isLoading) {
      // Automatically load all remaining transactions
      untrack(() => loadAllTransactions());
    }
  });

  // Function to load all remaining transactions
  async function loadAllTransactions() {
    while (hasMore && !isLoading) {
      await loadTransactions(false);
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

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
      onPeriodChange={(start, end) => {
        // Update date filters when period navigation changes
        startDate = start;
        endDate = end;
        // Store period dates for calendar view - parse as local dates
        // Format is "YYYY-MM-DD", split and create local date
        const [startYear, startMonth, startDay] = start.split('-').map(Number);
        const [endYear, endMonth, endDay] = end.split('-').map(Number);
        currentPeriodStart = new Date(startYear, startMonth - 1, startDay);
        currentPeriodEnd = new Date(endYear, endMonth - 1, endDay);
        periodInitialized = true;
        loadTransactions(true);
      }}
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
      {:else if activeTab === "calendar"}
        <CalendarView
          {transactions}
          currency={booksStore.activeBook?.base_currency}
          loading={isLoading}
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
  {selectedPocketId}
  {selectedType}
  {selectedCategoryId}
  {searchQuery}
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
