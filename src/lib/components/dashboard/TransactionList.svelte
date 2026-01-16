<script lang="ts">
  import type { Transaction } from "$lib/types/transaction";
  import TransactionItem from "./TransactionItem.svelte";
  import { EmptyState } from "$lib/components/ui";

  interface Props {
    transactions: Transaction[];
    currency?: string;
    loading?: boolean;
    onTransactionClick?: (tx: Transaction) => void;
  }

  let {
    transactions,
    currency = "IDR",
    loading = false,
    onTransactionClick,
  }: Props = $props();
</script>

<div class="space-y-1">
  {#if loading}
    {#each Array(3) as _}
      <div class="flex items-center justify-between py-3 animate-pulse">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-border"></div>
          <div class="space-y-2">
            <div class="w-24 h-3 bg-border rounded"></div>
            <div class="w-16 h-2 bg-border rounded"></div>
          </div>
        </div>
        <div class="w-20 h-4 bg-border rounded"></div>
      </div>
    {/each}
  {:else if transactions.length === 0}
    <EmptyState
      title="Belum Ada Transaksi"
      description="Belum ada transaksi di sini."
    >
      {#snippet icon()}
        <svg
          class="w-8 h-8 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      {/snippet}
    </EmptyState>
  {:else}
    {#each transactions as tx (tx.id)}
      <TransactionItem
        transaction={tx}
        {currency}
        onclick={() => onTransactionClick?.(tx)}
      />
    {/each}
  {/if}
</div>
