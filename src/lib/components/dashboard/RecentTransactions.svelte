<script lang="ts">
  import { booksStore, transactionsStore, privacyStore } from "$lib/stores";
  import { TransactionItem } from "$lib/components/dashboard";
  import { EmptyState } from "$lib/components/ui";
  import { goto } from "$app/navigation";
  import type { Transaction } from "$lib/types/transaction";
  import { untrack } from "svelte";

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

  interface DateGroup {
    label: string;
    fullDate: string;
    transactions: Transaction[];
    income: number;
    expense: number;
  }

  function getDateInfo(
    dateStr: string,
  ): { label: string; fullDate: string } | null {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const isTwoDaysAgo = date.toDateString() === twoDaysAgo.toDateString();

    const fullDate = date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    if (isToday) return { label: "Hari ini", fullDate };
    if (isYesterday) return { label: "Kemarin", fullDate };
    if (isTwoDaysAgo) return { label: fullDate, fullDate };
    return null;
  }

  // Filter transactions to only show last 3 days and group them with totals
  const recentGroups = $derived.by(() => {
    const groupsMap: Record<string, DateGroup> = {};
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const sorted = [...(transactionsStore.transactions || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    for (const tx of sorted) {
      const txDate = new Date(tx.date);
      if (txDate >= twoDaysAgo) {
        const dateInfo = getDateInfo(tx.date);
        if (dateInfo) {
          const key = dateInfo.label;
          if (!groupsMap[key]) {
            groupsMap[key] = {
              label: dateInfo.label,
              fullDate: dateInfo.fullDate,
              transactions: [],
              income: 0,
              expense: 0,
            };
          }
          groupsMap[key].transactions.push(tx);
          if (tx.type === "income") {
            groupsMap[key].income += tx.amount_cents;
          } else if (tx.type === "expense") {
            groupsMap[key].expense += tx.amount_cents;
          }
        }
      }
    }
    return Object.values(groupsMap);
  });

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

    <!-- Overall Income/Expense Totals -->
    <div class="flex items-center gap-3 text-xs">
      <!-- Expense -->
      <div class="flex items-center gap-1">
        <svg
          class="w-3 h-3 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
        <span class="text-red-500 font-medium"
          >{formatAmount(totals.expense)}</span
        >
      </div>
      <!-- Income -->
      <div class="flex items-center gap-1">
        <svg
          class="w-3 h-3 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
        <span class="text-emerald-500 font-medium"
          >{formatAmount(totals.income)}</span
        >
      </div>
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
      <div class="space-y-2">
        <!-- Date Header with Per-Date Totals -->
        <div
          class="flex items-center justify-between sticky top-16 bg-background/95 backdrop-blur py-2 z-10"
        >
          <h4 class="text-xs font-semibold text-muted uppercase tracking-wider">
            {group.label}
          </h4>

          <!-- Per-Date Totals -->
          <div class="flex items-center gap-2.5 text-xs">
            {#if group.expense > 0}
              <div class="flex items-center gap-1">
                <svg
                  class="w-2.5 h-2.5 text-red-400"
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
                <span class="text-red-400 font-medium tabular-nums"
                  >{formatCompact(group.expense)}</span
                >
              </div>
            {/if}
            {#if group.income > 0}
              <div class="flex items-center gap-1">
                <svg
                  class="w-2.5 h-2.5 text-emerald-400"
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
                <span class="text-emerald-400 font-medium tabular-nums"
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
