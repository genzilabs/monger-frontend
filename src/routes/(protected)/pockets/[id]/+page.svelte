<script lang="ts">
  import { page } from "$app/stores";
  import {
    booksStore,
    uiStore,
    transactionsStore,
    toastStore,
    authStore,
    privacyStore,
  } from "$lib/stores";
  import { formatCurrency } from "$lib/utils/currency";
  import { TransactionList } from "$lib/components/dashboard";
  import {
    EditPocketModal,
    EditTransactionModal,
  } from "$lib/components/modals";
  import { Button, ResponsiveModal, PrivacyToggle } from "$lib/components/ui";
  import { EditIcon, TrashIcon, ShieldIcon } from "$lib/icons";
  import type { Transaction, Pocket } from "$lib/types";
  import { onMount, tick } from "svelte";
  import { goto } from "$app/navigation";
  import { pocketsApi } from "$lib/api/pockets";

  let pocketId = $derived($page.params.id);
  let pocket = $state<Pocket | null>(null);
  let showEditPocketModal = $state(false);
  let showDeleteConfirm = $state(false);
  let isDeleting = $state(false);

  // Transaction Modal State
  let showEditTransactionModal = $state(false);
  let selectedTransaction = $state<Transaction | null>(null);

  // Use derived state from store for reactivity
  const transactions = $derived(transactionsStore.transactions);
  const isLoading = $derived(transactionsStore.isLoading);

  // State binding after SSR initialization
  $effect(() => {
    if (pocketId && booksStore.pockets.length > 0) {
      const found = booksStore.pockets.find((p) => p.id === pocketId);
      if (found) pocket = found;
    }
  });

  function handleTransactionClick(tx: Transaction) {
    selectedTransaction = tx;
    showEditTransactionModal = true;
  }

  async function handleDelete() {
    if (!pocket || !booksStore.activeBook) return;

    isDeleting = true;
    try {
      const success = await booksStore.deletePocket(pocket.id);
      if (success) {
        goto("/pockets");
      }
    } catch (e) {
      toastStore.error("Terjadi kesalahan");
    } finally {
      isDeleting = false;
      showDeleteConfirm = false;
    }
  }
</script>

<svelte:head>
  <title>{pocket?.name || "Kantong"} - Monger</title>
</svelte:head>

<div class="animate-fade-in pb-20">
  <!-- Header -->
  <header class="mb-6">
    <div class="flex items-center gap-2">
      <h1 class="text-2xl font-bold text-foreground">
        {pocket?.name || "Detail Kantong"}
      </h1>
      {#if booksStore.activeBook?.owner_id !== authStore.user?.id}
        <span
          class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium border border-blue-500/20"
        >
          Kolaborasi
        </span>
      {/if}
    </div>
    <p class="text-secondary">Kelola transaksi kantong ini.</p>
  </header>

  {#if pocket}
    <!-- Balance Card -->
    <div class="bg-surface border border-border rounded-2xl p-6 mb-6">
      <div class="flex flex-col items-center justify-center">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-sm text-muted font-medium">Total Saldo</span>
          <PrivacyToggle />
        </div>
        <h2 class="text-4xl font-bold text-foreground mb-6">
          {privacyStore.hideAmounts
            ? "••••"
            : formatCurrency(
                pocket.balance_cents,
                booksStore.activeBook?.base_currency,
              )}
        </h2>

        <!-- Transaction Quick Actions -->
        <div class="flex gap-3 mb-6">
          <button
            class="px-6 py-2.5 bg-emerald-500/10 text-emerald-500 font-semibold rounded-full text-sm hover:bg-emerald-500/20 transition-colors flex items-center shadow-sm"
            onclick={() => uiStore.openTransactionModal("income", pocket?.id)}
          >
            + Pemasukan
          </button>
          <button
            class="px-6 py-2.5 bg-red-500/10 text-red-500 font-semibold rounded-full text-sm hover:bg-red-500/20 transition-colors flex items-center shadow-sm"
            onclick={() => uiStore.openTransactionModal("expense", pocket?.id)}
          >
            - Pengeluaran
          </button>
        </div>

        <!-- Edit/Delete Actions (Clear & Separated) -->
        <div class="flex gap-3 w-full border-t border-border pt-4">
          <Button
            variant="outline"
            fullWidth
            onclick={() => (showEditPocketModal = true)}
          >
            {#snippet icon()}
              <EditIcon size={16} />
            {/snippet}
            Ubah Kantong
          </Button>
          <Button
            variant="danger-outline"
            fullWidth
            onclick={() => (showDeleteConfirm = true)}
          >
            {#snippet icon()}
              <TrashIcon size={16} />
            {/snippet}
            Hapus
          </Button>
        </div>
      </div>
    </div>

    <!-- Transactions Section -->
    <div
      class="bg-surface border border-border rounded-3xl p-6 min-h-[50vh] shadow-sm"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-foreground">Riwayat Transaksi</h3>
      </div>

      <TransactionList
        {transactions}
        loading={isLoading}
        currency={booksStore.activeBook?.base_currency}
        onTransactionClick={handleTransactionClick}
      />
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center h-[50vh]">
      <div
        class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"
      ></div>
    </div>
  {/if}
</div>

<!-- Modals -->
{#if pocket}
  <EditPocketModal
    open={showEditPocketModal}
    {pocket}
    onClose={() => (showEditPocketModal = false)}
    onDeleted={() => {
      showEditPocketModal = false;
      goto("/pockets");
    }}
  />

  <!-- Delete Confirmation Modal -->
  <ResponsiveModal
    open={showDeleteConfirm}
    onClose={() => (showDeleteConfirm = false)}
    title="Hapus Kantong"
  >
    <div class="space-y-4 py-4 animate-fade-in">
      <div
        class="flex flex-col items-center justify-center text-center p-6 bg-red-50 rounded-2xl border border-red-100"
      >
        <ShieldIcon class="text-red-500 mb-3" size={48} />
        <h3 class="text-lg font-bold text-red-700 mb-1">Hapus Kantong ini?</h3>
        <p class="text-sm text-red-600/80">
          Semua riwayat transaksi di dalam kantong ini akan ikut terhapus secara
          permanen.
        </p>
      </div>
      <div class="flex gap-3">
        <Button
          variant="outline"
          fullWidth
          onclick={() => (showDeleteConfirm = false)}>Batal</Button
        >
        <Button
          variant="primary"
          fullWidth
          onclick={handleDelete}
          loading={isDeleting}
          class="bg-red-600 hover:bg-red-700 text-white border-transparent"
        >
          Ya, Hapus
        </Button>
      </div>
    </div>
  </ResponsiveModal>
{/if}

{#if selectedTransaction}
  <EditTransactionModal
    open={showEditTransactionModal}
    transaction={selectedTransaction}
    onClose={() => {
      showEditTransactionModal = false;
      setTimeout(() => (selectedTransaction = null), 300); // Clear after animation
    }}
  />
{/if}
