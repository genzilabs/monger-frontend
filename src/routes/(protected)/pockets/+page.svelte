<script lang="ts">
  import { Button, Card, EmptyState } from "$lib/components/ui";
  import { booksStore, uiStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { WalletIcon, PlusIcon, ChevronRightIcon } from "$lib/icons";
  import { CreatePocketModal } from "$lib/components/modals";
  import PocketListItem from "$lib/components/pockets/PocketListItem.svelte";
  import { formatCurrency } from "$lib/utils/currency";

  let showCreatePocketModal = $state(false);
</script>

<svelte:head>
  <title>Kantong - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-6">
  <!-- Page Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Kantong</h1>
      <p class="text-secondary">Kelola semua kantong keuanganmu.</p>
    </div>
    <!-- Clean Header: No Action Button Here -->
  </div>

  <!-- Add New Pocket Card (Content Area) -->
  <button
    onclick={() => (showCreatePocketModal = true)}
    class="w-full border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex items-center justify-center gap-2 group min-h-15"
  >
    <div
      class="w-8 h-8 rounded-full bg-surface-elevated group-hover:bg-primary/10 flex items-center justify-center transition-colors"
    >
      <PlusIcon size={18} class="text-muted group-hover:text-primary" />
    </div>
    <span
      class="text-sm font-semibold text-muted group-hover:text-primary transition-colors"
      >Tambah Kantong Baru</span
    >
  </button>

  <!-- Pockets List -->
  {#if !booksStore.activeBook}
    <EmptyState
      title="Pilih Buku Dulu"
      description="Pilih buku di sidebar dulu ya."
    >
      {#snippet icon()}
        <WalletIcon size={32} class="text-primary" />
      {/snippet}
    </EmptyState>
  {:else if booksStore.pockets.length === 0}
    <EmptyState
      title="Belum Ada Kantong"
      description="Yuk, buat kantong pertamamu."
    >
      {#snippet icon()}
        <WalletIcon size={32} class="text-primary" />
      {/snippet}
      <!-- {#snippet action()}
        <Button
          variant="primary"
          onclick={() => (showCreatePocketModal = true)}
        >
          <PlusIcon size={20} class="mr-2" />
          Tambah Kantong
        </Button>
      {/snippet} -->
    </EmptyState>
  {:else}
    <div class="space-y-3">
      {#each booksStore.pockets as pocket (pocket.id)}
        <PocketListItem
          {pocket}
          currency={booksStore.activeBook?.base_currency}
          onclick={() => goto(`/pockets/${pocket.id}`)}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- Create Pocket Modal -->
<CreatePocketModal
  open={showCreatePocketModal}
  onClose={() => (showCreatePocketModal = false)}
/>
