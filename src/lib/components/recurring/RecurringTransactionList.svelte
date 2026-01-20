<script lang="ts">
  import { onMount } from "svelte";
  import { recurringStore } from "$lib/stores/recurring.svelte";
  import RecurringTransactionItem from "./RecurringTransactionItem.svelte";
  import { PlusIcon } from "$lib/icons";

  let { onEdit, onDelete } = $props<{
      onEdit: (t: any) => void;
      onDelete: (id: string) => void;
  }>();

  onMount(() => {
    recurringStore.load();
  });
</script>

<div class="space-y-4">
  {#if recurringStore.isLoading && recurringStore.transactions.length === 0}
    <div class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  {:else if recurringStore.transactions.length === 0}
    <div class="text-center py-12">
      <div class="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
        <PlusIcon size={32} class="text-muted" />
      </div>
      <h3 class="font-bold text-lg">Belum ada transaksi berulang</h3>
      <p class="text-secondary mt-2">Buat transaksi berulang untuk tagihan atau pemasukan rutin.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each recurringStore.transactions as transaction (transaction.id)}
        <RecurringTransactionItem 
            {transaction} 
            {onEdit}
            {onDelete}
        />
      {/each}
    </div>
  {/if}
</div>
