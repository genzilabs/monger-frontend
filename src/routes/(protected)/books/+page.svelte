<script lang="ts">
  import { Button, Card, EmptyState } from "$lib/components/ui";
  import { CreateBookModal } from "$lib/components/modals";
  import { booksStore } from "$lib/stores";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import type { Book } from "$lib/types";
  import {
    BookIcon,
    PlusIcon,
    ChevronRightIcon,
    CreditCardIcon,
  } from "$lib/icons";

  let showCreateModal = $state(false);

  onMount(() => {
    booksStore.loadBooks();
  });

  function openBook(book: Book) {
    goto(`/books/${book.id}`);
  }
</script>

<svelte:head>
  <title>Buku - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-6">
  <!-- Page Header (Title Only) -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Buku</h1>
      <p class="text-secondary">Kelola semua buku keuanganmu.</p>
    </div>
    <!-- No Header Action Button -->
  </div>

  <!-- Add New Book Card (Content Area) - Matching /pockets pattern -->
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
      >Tambah Buku Baru</span
    >
  </button>

  <!-- Loading State -->
  {#if booksStore.isLoading && booksStore.books.length === 0}
    <div class="grid gap-4">
      {#each [1, 2, 3] as _}
        <div class="bg-surface rounded-2xl p-6 animate-pulse">
          <div class="h-6 bg-border rounded w-1/3 mb-2"></div>
          <div class="h-4 bg-border rounded w-1/2"></div>
        </div>
      {/each}
    </div>
  {:else if booksStore.books.length === 0}
    <!-- Empty State -->
    <EmptyState
      title="Belum Ada Buku"
      description="Yuk, mulai buat buku pertamamu."
    >
      {#snippet icon()}
        <BookIcon size={32} class="text-primary" />
      {/snippet}
    </EmptyState>
  {:else}
    <!-- Books List -->
    <div class="space-y-3">
      {#each booksStore.books as book}
        <button
          class="w-full text-left bg-surface rounded-2xl p-4 hover:shadow-lg transition-all duration-200 border border-transparent hover:border-primary/20"
          onclick={() => openBook(book)}
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
            >
              <BookIcon size={24} class="text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-foreground truncate">
                {book.name}
              </h3>
              {#if book.description}
                <p class="text-sm text-secondary truncate">
                  {book.description}
                </p>
              {/if}
              <div class="flex items-center gap-4 mt-2 text-xs text-muted">
                <span class="flex items-center gap-1">
                  <CreditCardIcon size={16} />
                  {book.base_currency}
                </span>
              </div>
            </div>
            <ChevronRightIcon size={20} class="text-muted" />
          </div>
        </button>
      {/each}
    </div>
  {/if}

  <!-- Error State -->
  {#if booksStore.error}
    <div
      class="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100"
    >
      {booksStore.error}
    </div>
  {/if}
</div>

<!-- Create Book Modal -->
<CreateBookModal
  open={showCreateModal}
  onClose={() => (showCreateModal = false)}
/>
