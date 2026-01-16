<script lang="ts">
  import { page } from "$app/stores";
  import { booksStore, uiStore, transactionsStore } from "$lib/stores";
  import { formatCurrency } from "$lib/utils/currency";
  import { TransactionList } from "$lib/components/dashboard";
  import {
    EditPocketModal,
    EditTransactionModal,
  } from "$lib/components/modals";
  import { Button } from "$lib/components/ui";
  import { EditIcon, TrashIcon } from "$lib/icons";
  import type { Transaction, Pocket } from "$lib/types";
  import { onMount, tick } from "svelte";
  import { goto } from "$app/navigation";

  let pocketId = $derived($page.params.id);
  let pocket = $state<Pocket | null>(null);
  let showEditPocketModal = $state(false);

  // Transaction Modal State
  let showEditTransactionModal = $state(false);
  let selectedTransaction = $state<Transaction | null>(null);

  // Use derived state from store for reactivity
  const transactions = $derived(transactionsStore.transactions);
  const isLoading = $derived(transactionsStore.isLoading);

  onMount(async () => {
    if (!pocketId) return;
    await loadData();
  });

  async function loadData() {
    try {
      // Find pocket in store first to show immediate data
      const storedPocket = booksStore.pockets.find((p) => p.id === pocketId);
      if (storedPocket) {
        pocket = storedPocket;
      }

      // If no pocket (refresh/direct link), fetching logic would go here
      // For now, rely on booksStore or assume user navigated from dashboard
      if (!storedPocket && booksStore.activeBook) {
        await booksStore.loadPockets(booksStore.activeBook.id);
        const found = booksStore.pockets.find((p) => p.id === pocketId);
        if (found) pocket = found;
      }

      // Load transactions into store
      if (pocketId) {
        await transactionsStore.loadByPocket(pocketId);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleTransactionClick(tx: Transaction) {
    selectedTransaction = tx;
    showEditTransactionModal = true;
  }
</script>

<svelte:head>
  <title>{pocket?.name || "Kantong"} - Monger</title>
</svelte:head>

<div class="animate-fade-in pb-20">
  <!-- Header -->
  <header class="mb-6">
    <h1 class="text-2xl font-bold text-foreground">
      {pocket?.name || "Detail Kantong"}
    </h1>
    <p class="text-secondary">Kelola transaksi kantong ini.</p>
  </header>

  {#if pocket}
    <!-- Balance Card -->
    <div class="bg-surface border border-border rounded-2xl p-6 mb-6">
      <div class="flex flex-col items-center justify-center">
        <span class="text-sm text-muted mb-1 font-medium">Total Saldo</span>
        <h2 class="text-4xl font-bold text-foreground mb-6">
          {formatCurrency(
            pocket.balance_cents,
            booksStore.activeBook?.base_currency
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
            onclick={() => (showEditPocketModal = true)}
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
