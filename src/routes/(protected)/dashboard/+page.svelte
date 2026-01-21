<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { booksStore, uiStore, transactionsStore } from "$lib/stores";
  import {
    UserHeader,
    BalanceHeroCard,
    PendingTransfers,
    PendingInvitations,
    RecentTransactions,
    CategoryPieChart,
  } from "$lib/components/dashboard";
  import PocketListItem from "$lib/components/pockets/PocketListItem.svelte";
  import { PlusIcon } from "$lib/icons";
  import { CreatePocketModal } from "$lib/components/modals";
  import { EmptyState, PrivacyToggle } from "$lib/components/ui";
  import {
    transactionsApi,
    type DailyBreakdown,
    type CategoryBreakdown,
  } from "$lib/api/transactions";

  // Modal state
  let showCreatePocketModal = $state(false);

  // Monthly summary state
  let monthlyIncome = $state(0);
  let monthlyExpense = $state(0);
  let summaryLoading = $state(true);

  // Chart state
  type ChartTab = "income" | "expense";
  let activeTab = $state<ChartTab>("expense");
  let incomeBreakdown = $state<CategoryBreakdown[]>([]);
  let expenseBreakdown = $state<CategoryBreakdown[]>([]);
  let chartLoading = $state(true);

  // Computed values
  let totalBalance = $derived(
    booksStore.pockets.reduce((sum, p) => sum + p.balance_cents, 0),
  );

  let currentBreakdown = $derived(
    activeTab === "income" ? incomeBreakdown : expenseBreakdown,
  );

  async function loadDashboardData() {
    if (!booksStore.activeBook) return;

    summaryLoading = true;
    chartLoading = true;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      // Parallel requests for summary and breakdown
      const [summaryRes, incomeRes, expenseRes] = await Promise.all([
        transactionsApi.getMonthlySummary(
          booksStore.activeBook.id,
          month,
          year,
        ),
        transactionsApi.getCategoryBreakdown(
          booksStore.activeBook.id,
          "income",
          month,
          year,
        ),
        transactionsApi.getCategoryBreakdown(
          booksStore.activeBook.id,
          "expense",
          month,
          year,
        ),
      ]);

      if (summaryRes.data) {
        monthlyIncome = summaryRes.data.summary.total_income;
        monthlyExpense = summaryRes.data.summary.total_expense;
      }

      if (incomeRes.data) incomeBreakdown = incomeRes.data;
      if (expenseRes.data) expenseBreakdown = expenseRes.data;
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      summaryLoading = false;
      chartLoading = false;
    }
  }

  // Re-fetch when activeBook changes
  $effect(() => {
    if (booksStore.activeBook?.id) {
      loadDashboardData();
    }
  });
</script>

<svelte:head>
  <title>Dashboard - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-6">
  {#if !booksStore.isInitialized || (booksStore.isLoading && booksStore.books.length === 0)}
    <!-- Loading Skeleton -->
    <div class="space-y-4">
      <div class="flex items-center gap-3 animate-pulse">
        <div class="h-10 w-10 rounded-full bg-border"></div>
        <div class="space-y-1">
          <div class="h-3 w-16 bg-border rounded"></div>
          <div class="h-4 w-24 bg-border rounded"></div>
        </div>
      </div>
      <div class="rounded-2xl bg-surface p-6 animate-pulse">
        <div class="h-4 w-24 bg-border rounded mb-2"></div>
        <div class="h-10 w-40 bg-border rounded mb-4"></div>
        <div class="h-16 w-full bg-border rounded"></div>
      </div>
    </div>
  {:else if booksStore.activeBook}
    <!-- 1. User Header (responsive inside) -->
    <UserHeader loading={booksStore.isLoading} />

    <!-- 2. Total Net Worth Card with Monthly Income/Expense -->
    <BalanceHeroCard
      balance={totalBalance}
      currency={booksStore.activeBook.base_currency}
      bookName={booksStore.activeBook.name}
      income={monthlyIncome}
      expense={monthlyExpense}
      loading={booksStore.isLoading || summaryLoading}
    />

    <!-- 3. Category Breakdown Chart -->
    <div class="w-full bg-surface rounded-2xl border border-border p-4">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-foreground">
            Analisis Pengeluaran
          </h3>
          <PrivacyToggle />
        </div>

        <!-- Tabs -->
        <div class="flex p-1 bg-surface-elevated rounded-lg">
          <button
            onclick={() => (activeTab = "income")}
            class="px-3 py-1 text-xs font-medium rounded-md transition-all {activeTab ===
            'income'
              ? 'bg-surface shadow-sm text-primary'
              : 'text-muted hover:text-foreground'}"
          >
            Pemasukan
          </button>
          <button
            onclick={() => (activeTab = "expense")}
            class="px-3 py-1 text-xs font-medium rounded-md transition-all {activeTab ===
            'expense'
              ? 'bg-surface shadow-sm text-primary'
              : 'text-muted hover:text-foreground'}"
          >
            Pengeluaran
          </button>
        </div>
      </div>

      {#if chartLoading}
        <div class="h-48 flex items-center justify-center">
          <div
            class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
      {:else if currentBreakdown.length === 0}
        <div
          class="h-48 flex flex-col items-center justify-center text-muted text-sm gap-2"
        >
          <div
            class="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 opacity-50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              ><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path
                d="M22 12A10 10 0 0 0 12 2v10z"
              ></path></svg
            >
          </div>
          <span
            >Belum ada data {activeTab === "income"
              ? "pemasukan"
              : "pengeluaran"} bulan ini</span
          >
        </div>
      {:else}
        <CategoryPieChart
          data={currentBreakdown}
          type={activeTab}
          currency={booksStore.activeBook.base_currency}
          loading={chartLoading}
        />
      {/if}
    </div>

    <!-- 4. Invitations & Transfers -->
    <PendingInvitations />
    <PendingTransfers />

    <!-- 5. Your Pockets -->
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-foreground">Kantong Kamu</h3>
          <PrivacyToggle />
        </div>
        <button
          onclick={() => (showCreatePocketModal = true)}
          class="text-xs text-primary font-medium"
        >
          Buat kantong
        </button>
      </div>

      <!-- Pocket List (Vertical Stack, max 3) -->
      <div class="space-y-3">
        {#if booksStore.isLoading && booksStore.pockets.length === 0}
          <!-- Skeletons -->
          {#each Array(3) as _}
            <div
              class="w-full h-20 bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 animate-pulse"
            >
              <div class="w-12 h-12 rounded-xl bg-border"></div>
              <div class="space-y-2 flex-1">
                <div class="h-4 w-32 bg-border rounded"></div>
                <div class="h-4 w-24 bg-border rounded"></div>
              </div>
            </div>
          {/each}
        {:else}
          {#each booksStore.pockets.slice(0, 3) as pocket (pocket.id)}
            <PocketListItem
              {pocket}
              currency={booksStore.activeBook?.base_currency}
              onclick={() => goto(`/pockets/${pocket.id}`)}
            />
          {/each}

          <!-- Show more link if more than 3 pockets -->
          {#if booksStore.pockets.length > 3}
            <a
              href="/pockets"
              class="block w-full text-center py-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Lihat lebih banyak
            </a>
          {:else if booksStore.pockets.length === 0}
            <!-- Add Pocket Button (Full Width) when no pockets -->
            <button
              onclick={() => (showCreatePocketModal = true)}
              class="w-full border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex items-center justify-center gap-2 group min-h-15"
            >
              <div
                class="w-8 h-8 rounded-full bg-surface-elevated group-hover:bg-primary/10 flex items-center justify-center transition-colors"
              >
                <PlusIcon
                  size={18}
                  class="text-muted group-hover:text-primary"
                />
              </div>
              <span
                class="text-sm font-semibold text-muted group-hover:text-primary transition-colors"
                >Tambah Kantong Baru</span
              >
            </button>
          {/if}
        {/if}
      </div>
    </div>

    <!-- 6. Recent Transactions -->
    <RecentTransactions />
  {:else if booksStore.books.length > 0}
    <EmptyState title="Pilih Buku" description="Pilih buku di atas dulu ya.">
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
  {:else}
    <EmptyState
      title="Mulai Perjalanan Keuanganmu"
      description="Buat buku pertamamu di atas."
    >
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      {/snippet}
    </EmptyState>
  {/if}
</div>

<!-- Create Pocket Modal -->
<CreatePocketModal
  open={showCreatePocketModal}
  onClose={() => (showCreatePocketModal = false)}
/>

<style>
  :global(.no-scrollbar::-webkit-scrollbar) {
    display: none;
  }
  :global(.no-scrollbar) {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
