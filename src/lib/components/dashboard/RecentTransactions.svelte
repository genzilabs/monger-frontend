<script lang="ts">
  import { booksStore, transactionsStore, privacyStore } from "$lib/stores";
  import { TransactionItem } from "$lib/components/dashboard";
  import { EmptyState } from "$lib/components/ui";
  import { goto } from "$app/navigation";
  import type { Transaction } from "$lib/types/transaction";
  import { untrack } from "svelte";
  import {
    groupRecentTransactions,
    getSignificanceForGroups,
    type DateGroup
  } from "$lib/utils/transactionGrouping";

  let isLoading = $derived(transactionsStore.isLoading);

  $effect(() => {
    const bookId = booksStore.activeBook?.id;
    if (bookId) {
      untrack(() => loadData(bookId));
    }
  });

  async function loadData(bookId: string) {
    if (!bookId) return;
    await transactionsStore.loadByBook(bookId);
  }

  // Filter transactions to show recent activity (Today, Yesterday, and up to 2 days ago)
  const recentGroups = $derived(groupRecentTransactions(transactionsStore.transactions || []));
  
  // Calculate significance map based on the active groups
  const significanceMap = $derived(getSignificanceForGroups(recentGroups));

  function getSignificance(group: DateGroup) {
    return significanceMap[group.dateKey] || {
      expense: { isSignificant: false, direction: "none" },
      income: { isSignificant: false, direction: "none" }
    };
  }

  // Calculate overall totals for last 3 days
  const totals = $derived.by(() => {
    let income = 0;
    let expense = 0;
    for (const group of recentGroups) {
      income += group.income;
      expense += group.expense;
    }
    return { income, expense };
  });

  function formatAmount(cents: number) {
    if (privacyStore.hideAmounts) return "••••";
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  function formatCompact(cents: number) {
    if (privacyStore.hideAmounts) return "••••";
    const value = cents / 100;
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "jt";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1).replace(/\.0$/, "") + "rb";
    }
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  const hasTransactions = $derived(recentGroups.length > 0);
</script>

<div class="space-y-4 pb-20">
  <div class="flex items-center justify-between gap-2">
    <h3 class="text-sm font-semibold text-foreground shrink-0">
      Transaksi Terkini
    </h3>

    <!-- Overall Income/Expense Totals (no arrows at header level) -->
    <div class="flex items-center gap-3 text-xs">
      <!-- Expense -->
      {#if totals.expense > 0}
        <div class="flex items-center gap-1">
          <span class="text-muted font-medium"
            >{formatAmount(totals.expense)}</span
          >
        </div>
      {/if}
      <!-- Income -->
      {#if totals.income > 0}
        <div class="flex items-center gap-1">
          <span class="text-muted font-medium"
            >{formatAmount(totals.income)}</span
          >
        </div>
      {/if}
    </div>
  </div>

  {#if isLoading && transactionsStore.transactions.length === 0}
    <!-- Skeleton -->
    <div class="space-y-4">
      {#each Array(3) as _}
        <!-- Date header skeleton -->
        <div class="flex items-center justify-between py-2 animate-pulse">
          <div class="h-3 w-16 bg-border rounded"></div>
          <div class="flex gap-3">
            <div class="h-3 w-12 bg-border rounded"></div>
            <div class="h-3 w-12 bg-border rounded"></div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-border animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-1/3 bg-border animate-pulse rounded"></div>
            <div class="h-3 w-1/4 bg-border animate-pulse rounded"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if !hasTransactions}
    <EmptyState
      title="Belum Ada Transaksi"
      description="Mulai catat pemasukan dan pengeluaranmu."
    >
      {#snippet action()}
        <button
          class="text-primary font-medium hover:underline text-sm"
          onclick={() => goto("/transactions")}
        >
          Lihat Transaksi
        </button>
      {/snippet}
    </EmptyState>
  {:else}
    {#each recentGroups as group}
      {@const sig = getSignificance(group)}
      <div class="space-y-2">
        <!-- Date Header with Per-Date Totals -->
        <div
          class="flex items-center justify-between sticky top-16 bg-background/95 backdrop-blur py-2 z-10"
        >
          <h4 class="text-xs font-semibold text-muted uppercase tracking-wider">
            {group.label}
          </h4>

          <!-- Per-Date Totals with conditional significance arrows -->
          <div class="flex items-center gap-2.5 text-xs">
            {#if group.expense > 0}
              <div class="flex items-center gap-1">
                {#if sig.expense.isSignificant && sig.expense.direction === "up"}
                  <svg
                    class="w-2.5 h-2.5 text-red-400/70 opacity-80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                {/if}
                <span class="text-muted font-medium tabular-nums"
                  >{formatCompact(group.expense)}</span
                >
              </div>
            {/if}
            {#if group.income > 0}
              <div class="flex items-center gap-1">
                {#if sig.income.isSignificant && sig.income.direction === "down"}
                  <svg
                    class="w-2.5 h-2.5 text-emerald-400/70 opacity-80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                {/if}
                <span class="text-muted font-medium tabular-nums"
                  >{formatCompact(group.income)}</span
                >
              </div>
            {/if}
          </div>
        </div>

        <div class="bg-surface rounded-2xl border border-border px-4 py-1">
          {#each group.transactions as tx (tx.id)}
            <div class="border-b border-border last:border-0 border-dashed">
              <TransactionItem
                transaction={tx}
                currency={booksStore.activeBook?.base_currency}
                showDate={false}
                showTime={true}
              />
            </div>
          {/each}
        </div>
      </div>
    {/each}

    <!-- View All Link -->
    <div class="pt-2">
      <button
        onclick={() => goto("/transactions")}
        class="w-full py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        Lihat semua transaksi
      </button>
    </div>
  {/if}
</div>
