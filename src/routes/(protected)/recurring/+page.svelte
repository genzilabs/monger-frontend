<script lang="ts">
  import { onMount } from "svelte";
  import { recurringStore } from "$lib/stores/recurring.svelte";
  import { booksStore } from "$lib/stores";
  import RecurringTransactionList from "$lib/components/recurring/RecurringTransactionList.svelte";
  import CreateRecurringTransactionModal from "$lib/components/modals/CreateRecurringTransactionModal.svelte";
  import { EmptyState, ConfirmDialog } from "$lib/components/ui";
  import { PlusIcon, RepeatIcon } from "$lib/icons";
  import type { RecurringTransaction } from "$lib/types/recurring";

  let showDeleteConfirm = $state(false);
  let showCreateModal = $state(false);
  let transactionToDelete = $state<string | null>(null);

  function handleEdit(transaction: RecurringTransaction) {
    // TODO: Implement edit modal
    console.log("Edit", transaction);
    alert("Edit not implemented yet");
  }

  function handleDelete(id: string) {
    transactionToDelete = id;
    showDeleteConfirm = true;
  }

  async function confirmDelete() {
    if (transactionToDelete) {
      await recurringStore.delete(transactionToDelete);
      showDeleteConfirm = false;
      transactionToDelete = null;
    }
  }

  onMount(() => {
    recurringStore.load();
  });
</script>

<svelte:head>
  <title>Transaksi Rutin - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-6">
  <!-- Page Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Transaksi Rutin</h1>
      <p class="text-secondary">Kelola tagihan dan pemasukan berulang.</p>
    </div>
  </div>

  <!-- Add New Button -->
  <button
    onclick={() => (showCreateModal = true)}
    class="w-full border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex items-center justify-center gap-2 group min-h-15"
  >
    <div
      class="w-8 h-8 rounded-full bg-surface-elevated group-hover:bg-primary/10 flex items-center justify-center transition-colors"
    >
      <PlusIcon size={18} class="text-muted group-hover:text-primary" />
    </div>
    <span
      class="text-sm font-semibold text-muted group-hover:text-primary transition-colors"
      >Tambah Transaksi Rutin</span
    >
  </button>

  <!-- List -->
  {#if !booksStore.activeBook}
    <EmptyState
      title="Pilih Buku Dulu"
      description="Pilih buku di header dulu ya."
    >
      {#snippet icon()}
        <RepeatIcon size={32} class="text-primary" />
      {/snippet}
    </EmptyState>
  {:else if recurringStore.isLoading && recurringStore.transactions.length === 0}
    <div class="flex justify-center py-12">
      <div
        class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"
      ></div>
    </div>
  {:else if recurringStore.transactions.length === 0}
    <EmptyState
      title="Belum Ada Transaksi Rutin"
      description="Buat transaksi rutin untuk tagihan atau pemasukan tetap."
    >
      {#snippet icon()}
        <RepeatIcon size={32} class="text-primary" />
      {/snippet}
    </EmptyState>
  {:else}
    <RecurringTransactionList onEdit={handleEdit} onDelete={handleDelete} />
  {/if}
</div>

<CreateRecurringTransactionModal bind:open={showCreateModal} />

<ConfirmDialog
  open={showDeleteConfirm}
  onOpenChange={(v) => (showDeleteConfirm = v)}
  title="Hapus Transaksi Rutin?"
  message="Transaksi ini tidak akan dibuat lagi di masa depan. Transaksi yang sudah dibuat tidak akan terhapus."
  confirmLabel="Hapus"
  cancelLabel="Batal"
  isDestructive
  onConfirm={confirmDelete}
  onCancel={() => (showDeleteConfirm = false)}
/>
