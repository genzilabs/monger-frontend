<script lang="ts">
  import { Button, Card } from "$lib/components/ui";
  import { booksStore, uiStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { WalletIcon, PlusIcon, ChevronRightIcon } from "$lib/icons";
  import { CreatePocketModal } from "$lib/components/modals";
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
    <Button variant="primary" onclick={() => (showCreatePocketModal = true)}>
      <PlusIcon size={20} class="mr-2" />
      Tambah Kantong
    </Button>
  </div>

  <!-- Pockets List -->
  {#if !booksStore.activeBook}
    <Card class="p-8 text-center">
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <WalletIcon size={32} class="text-primary" />
      </div>
      <h2 class="text-lg font-semibold text-foreground mb-2">
        Pilih Buku Dulu
      </h2>
      <p class="text-secondary">Pilih buku di sidebar untuk melihat kantong.</p>
    </Card>
  {:else if booksStore.pockets.length === 0}
    <Card class="p-8 text-center">
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <WalletIcon size={32} class="text-primary" />
      </div>
      <h2 class="text-lg font-semibold text-foreground mb-2">
        Belum Ada Kantong
      </h2>
      <p class="text-secondary mb-4">Mulai dengan membuat kantong pertamamu.</p>
      <Button variant="primary" onclick={() => (showCreatePocketModal = true)}>
        <PlusIcon size={20} class="mr-2" />
        Tambah Kantong
      </Button>
    </Card>
  {:else}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each booksStore.pockets as pocket}
        <button
          onclick={() => goto(`/pockets/${pocket.id}`)}
          class="text-left bg-surface border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
        >
          <div class="flex items-start justify-between mb-3">
            <div
              class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <WalletIcon size={20} class="text-primary" />
            </div>
            <ChevronRightIcon
              size={20}
              class="text-muted group-hover:text-primary transition-colors"
            />
          </div>
          <h3 class="font-semibold text-foreground mb-1">{pocket.name}</h3>
          <p class="text-lg font-bold text-primary">
            {formatCurrency(
              pocket.balance_cents,
              booksStore.activeBook?.base_currency
            )}
          </p>
        </button>
      {/each}

      <!-- Add New Pocket Card -->
      <button
        onclick={() => (showCreatePocketModal = true)}
        class="border-2 border-dashed border-border rounded-xl p-5 hover:border-primary/30 transition-colors flex flex-col items-center justify-center min-h-[140px]"
      >
        <div
          class="w-10 h-10 rounded-lg bg-surface flex items-center justify-center mb-2"
        >
          <PlusIcon size={24} class="text-muted" />
        </div>
        <span class="text-sm text-muted">Tambah Kantong</span>
      </button>
    </div>
  {/if}
</div>

<!-- Create Pocket Modal -->
<CreatePocketModal
  open={showCreatePocketModal}
  onClose={() => (showCreatePocketModal = false)}
/>
