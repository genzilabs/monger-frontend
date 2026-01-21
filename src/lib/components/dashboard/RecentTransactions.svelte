<script lang="ts">
  import { onMount } from "svelte";
  import { booksStore, transactionsStore } from "$lib/stores";
  import { TransactionItem } from "$lib/components/dashboard";
  import { EmptyState, PrivacyToggle } from "$lib/components/ui";
  import { PlusIcon } from "$lib/icons";
  import { goto } from "$app/navigation";
  import type { Transaction } from "$lib/types/transaction";

  let isLoading = $derived(transactionsStore.isLoading);

  import { untrack } from "svelte";

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

  function getGroupLabel(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Hari ini";
    if (isYesterday) return "Kemarin";
    return date
      .toLocaleDateString("id-ID", { day: "numeric", month: "short" })
      .toUpperCase();
  }

  // Use a derived for grouping since transactions change
  const groups = $derived.by(() => {
    const groups: Record<string, Transaction[]> = {};
    // Sort by date desc first
    // Note: transactionsStore.transactions should be a list.
    const sorted = [...(transactionsStore.transactions || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    for (const tx of sorted) {
      const label = getGroupLabel(tx.date);
      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    }
    return groups;
  });
</script>

<div class="space-y-4 pb-20">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <h3 class="text-lg font-bold text-foreground">Transaksi Terkini</h3>
      <PrivacyToggle />
    </div>
    <!-- <button class="text-sm font-medium text-primary hover:text-primary/80">Lihat Semua</button> -->
  </div>

  {#if isLoading && transactionsStore.transactions.length === 0}
    <!-- Skeleton -->
    <div class="space-y-4">
      {#each Array(3) as _}
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-border animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-1/3 bg-border animate-pulse rounded"></div>
            <div class="h-3 w-1/4 bg-border animate-pulse rounded"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if transactionsStore.transactions.length === 0}
    <EmptyState
      title="Belum Ada Transaksi"
      description="Mulai catat pemasukan dan pengeluaranmu."
    >
      <!-- {#snippet icon()}
        <div
          class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary"
        >
          <PlusIcon size={24} />
        </div>
      {/snippet} -->
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
    {#each Object.entries(groups) as [label, txs]}
      <div class="space-y-2">
        <h4
          class="text-xs font-semibold text-muted uppercase tracking-wider sticky top-16 bg-background/95 backdrop-blur py-2 z-10"
        >
          {label}
        </h4>
        <div class="bg-surface rounded-2xl border border-border px-4 py-1">
          {#each txs as tx (tx.id)}
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
  {/if}
</div>
