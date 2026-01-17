<script lang="ts">
  import { booksStore, authStore } from "$lib/stores";
  import { booksApi } from "$lib/api";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import {
    CreatePocketModal,
    EditBookModal,
    InviteMemberModal,
    MembersListModal,
  } from "$lib/components/modals";
  import { Button } from "$lib/components/ui";
  import DynamicIcon from "$lib/components/ui/DynamicIcon.svelte";
  import {
    EditIcon,
    TrashIcon,
    PlusIcon,
    WalletIcon,
    UserIcon,
  } from "$lib/icons";

  let bookId = $derived($page.params.id);
  let showCreatePocketModal = $state(false);
  let showEditBookModal = $state(false);
  let showInviteModal = $state(false);
  let showMembersModal = $state(false);
  let showDeleteConfirm = $state(false);
  let activeFilter = $state("all");

  // Check if current user is owner
  const isOwner = $derived(
    booksStore.activeBook?.owner_id === authStore.user?.id
  );

  const filters = [
    { id: "all", label: "Semua Kantong" },
    { id: "savings", label: "Tabungan" },
    { id: "expenses", label: "Pengeluaran" },
  ];

  onMount(async () => {
    if (!bookId) {
      goto("/dashboard");
      return;
    }

    // If the book is already active, just ensure pockets are loaded
    if (booksStore.activeBook?.id === bookId) {
      return;
    }

    // Otherwise, fetch and set the book as active
    const result = await booksApi.get(bookId);
    if (result.data) {
      await booksStore.setActiveBook(result.data);
    } else {
      goto("/dashboard");
    }
  });

  function formatBalance(cents: number, currency: string = "IDR") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(cents / 100);
  }

  function getTotalBalance() {
    return booksStore.pockets.reduce((sum, p) => sum + p.balance_cents, 0);
  }

  function handleInviteFromMembers() {
    showMembersModal = false;
    showInviteModal = true;
  }

  async function handleDelete() {
    if (!bookId) return;
    const result = await booksApi.delete(bookId);
    if (result.data) {
      goto("/books");
    }
  }
</script>

<svelte:head>
  <title>{booksStore.activeBook?.name || "Buku"} - Monger</title>
</svelte:head>

<div class="animate-fade-in">
  <main class="flex-1 flex flex-col gap-6">
    {#if booksStore.activeBook}
      <!-- Hero Card -->
      <div
        class="w-full bg-gradient-to-br from-surface to-background rounded-3xl border border-border p-6 relative overflow-hidden"
      >
        <div
          class="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
        ></div>

        <div class="relative z-10">
          <div class="flex justify-between items-start mb-4">
            <div>
              <span
                class="text-primary text-sm font-semibold tracking-wider uppercase"
                >BUKU</span
              >
              <h1 class="text-2xl font-bold text-foreground">
                {booksStore.activeBook.name}
              </h1>
            </div>
            <button
              onclick={() => (showMembersModal = true)}
              class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
              aria-label="Lihat anggota"
            >
              <UserIcon size={20} class="text-primary" />
            </button>
          </div>

          <p class="text-sm text-muted">Total Saldo</p>
          <div class="flex items-baseline gap-3 mt-1 mb-6">
            <span class="text-4xl font-bold tracking-tight text-foreground">
              {formatBalance(
                getTotalBalance(),
                booksStore.activeBook.base_currency
              )}
            </span>
          </div>

          <!-- Action Buttons (Matching /pockets/[id] pattern) -->
          <div class="flex gap-3 w-full border-t border-border pt-4">
            <Button
              variant="outline"
              fullWidth
              onclick={() => (showEditBookModal = true)}
            >
              {#snippet icon()}
                <EditIcon size={16} />
              {/snippet}
              Ubah Buku
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

      <!-- Delete Confirmation -->
      {#if showDeleteConfirm}
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p class="text-sm text-red-700">
            Yakin ingin menghapus buku ini? Semua kantong di dalamnya juga akan
            terhapus.
          </p>
          <div class="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onclick={() => (showDeleteConfirm = false)}
            >
              Batal
            </Button>
            <Button variant="danger" size="sm" onclick={handleDelete}>
              Ya, Hapus
            </Button>
          </div>
        </div>
      {/if}

      <!-- Filter Chips -->
      <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
        {#each filters as filter}
          <button
            onclick={() => (activeFilter = filter.id)}
            class="flex h-10 shrink-0 items-center justify-center px-5 rounded-full text-sm font-medium transition-all active:scale-95 {activeFilter ===
            filter.id
              ? 'bg-primary text-white'
              : 'bg-surface border border-border text-muted'}"
          >
            {filter.label}
          </button>
        {/each}
      </div>
    {/if}

    <!-- Add New Pocket Button -->
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
        >Tambah Kantong</span
      >
    </button>

    <!-- Pockets List -->
    <div class="flex flex-col gap-3">
      {#if booksStore.pockets.length === 0}
        <div
          class="flex flex-col items-center justify-center py-10 text-center"
        >
          <div
            class="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <WalletIcon size={32} class="text-primary" />
          </div>
          <h3 class="text-lg font-semibold text-foreground">
            Belum Ada Kantong
          </h3>
          <p class="text-sm text-muted mt-1">Yuk, buat kantong pertamamu.</p>
        </div>
      {:else}
        {#each booksStore.pockets as pocket}
          <a
            href="/pockets/{pocket.id}"
            class="group w-full flex flex-col gap-4 p-4 rounded-2xl bg-surface border border-border hover:border-muted transition-colors text-left"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="flex items-center justify-center w-12 h-12 rounded-xl"
                  style="background: {pocket.color}20; color: {pocket.color}"
                >
                  <DynamicIcon name={pocket.icon_slug} size={24} />
                </div>
                <div>
                  <h3 class="text-base font-semibold text-foreground">
                    {pocket.name}
                  </h3>
                  <p class="text-sm text-muted capitalize">
                    {pocket.type_slug.replace("-", " ")}
                  </p>
                </div>
              </div>
              <p
                class="text-lg font-bold text-foreground"
                class:text-red-500={pocket.balance_cents < 0}
              >
                {formatBalance(
                  pocket.balance_cents,
                  booksStore.activeBook?.base_currency
                )}
              </p>
            </div>
          </a>
        {/each}
      {/if}
    </div>
  </main>
</div>

<!-- Create Pocket Modal -->
<CreatePocketModal
  open={showCreatePocketModal}
  onClose={() => (showCreatePocketModal = false)}
/>

<!-- Edit Book Modal -->
{#if booksStore.activeBook}
  <EditBookModal
    open={showEditBookModal}
    book={booksStore.activeBook}
    onClose={() => (showEditBookModal = false)}
  />
{/if}

<!-- Collaboration Modals -->
{#if bookId}
  <MembersListModal
    open={showMembersModal}
    onClose={() => (showMembersModal = false)}
    {bookId}
    {isOwner}
    onInvite={handleInviteFromMembers}
  />

  <InviteMemberModal
    open={showInviteModal}
    onClose={() => (showInviteModal = false)}
    {bookId}
  />
{/if}

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
