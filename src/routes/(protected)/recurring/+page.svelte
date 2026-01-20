<script lang="ts">
  import { onMount } from "svelte";
  import { recurringStore } from "$lib/stores/recurring.svelte";
  import RecurringTransactionList from "$lib/components/recurring/RecurringTransactionList.svelte";
  import CreateRecurringTransactionModal from "$lib/components/modals/CreateRecurringTransactionModal.svelte";
  import { Button, ConfirmDialog } from "$lib/components/ui";
  import { PlusIcon } from "$lib/icons";
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
</script>

<div class="container mx-auto px-4 py-6 max-w-4xl">
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold">Transaksi Berulang</h1>
      <p class="text-secondary mt-1">Kelola transaksi rutin Anda di sini.</p>
    </div>
    <Button onclick={() => showCreateModal = true}>
      <PlusIcon size={20} class="mr-2" />
      Buat Baru
    </Button>
  </div>

  <RecurringTransactionList 
    onEdit={handleEdit} 
    onDelete={handleDelete}
  />
</div>

<CreateRecurringTransactionModal bind:open={showCreateModal} />

<ConfirmDialog
  open={showDeleteConfirm}
  onOpenChange={(v) => showDeleteConfirm = v}
  title="Hapus Transaksi Berulang?"
  message="Transaksi ini tidak akan dibuat lagi di masa depan. Transaksi yang sudah dibuat tidak akan terhapus."
  confirmLabel="Hapus"
  cancelLabel="Batal"
  isDestructive
  onConfirm={confirmDelete}
  onCancel={() => (showDeleteConfirm = false)}
/>
