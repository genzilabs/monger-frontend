<script lang="ts">
  import { onMount } from "svelte";
  import { categoriesApi } from "$lib/api";
  import { Button, Card } from "$lib/components/ui";
  import { ArrowUpIcon, ArrowDownIcon, PlusIcon, TagIcon } from "$lib/icons";
  import type { Category } from "$lib/types/category";
  import ManageCategoryModal from "$lib/components/modals/ManageCategoryModal.svelte";
  import { booksStore } from "$lib/stores/books.svelte";

  let categories = $state<Category[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  let isModalOpen = $state(false);
  let editingCategory = $state<Category | null>(null);

  async function loadCategories() {
    if (!booksStore.activeBook) return;

    isLoading = true;
    error = null;
    try {
      const res = await categoriesApi.list(booksStore.activeBook.id);
      if (res.data) {
        categories = res.data.categories;
      } else {
        throw new Error(res.error?.error || "Gagal memuat kategori");
      }
    } catch (err) {
      error = "Gagal memuat kategori";
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    if (booksStore.activeBook) {
      loadCategories();
    }
  });

  function openCreateModal() {
    editingCategory = null;
    isModalOpen = true;
  }

  function openEditModal(category: Category) {
    editingCategory = category;
    isModalOpen = true;
  }

  function handleSuccess() {
    loadCategories();
  }
</script>

<svelte:head>
  <title>Kategori Transaksi - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-6 pb-24">
  <!-- Header (Title Only - No Back Button) -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Kategori</h1>
      <p class="text-secondary">Kelola kategori transaksimu.</p>
    </div>
  </div>

  {#if isLoading && !categories.length}
    <div class="flex justify-center py-10">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
    </div>
  {:else if error}
    <Card class="p-4 text-center">
      <p class="text-red-600 text-sm">{error}</p>
      <button
        class="mt-2 text-primary font-medium text-sm"
        onclick={loadCategories}>Coba Lagi</button
      >
    </Card>
  {:else}
    <!-- Add New Category Card -->
    <button
      onclick={openCreateModal}
      class="w-full border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex items-center justify-center gap-2 group min-h-15"
    >
      <div
        class="w-8 h-8 rounded-full bg-surface-elevated group-hover:bg-primary/10 flex items-center justify-center transition-colors"
      >
        <PlusIcon size={18} class="text-muted group-hover:text-primary" />
      </div>
      <span
        class="text-sm font-semibold text-muted group-hover:text-primary transition-colors"
        >Tambah Kategori Baru</span
      >
    </button>

    <!-- Categories List -->
    <div class="space-y-6">
      <!-- Income Section -->
      <section class="space-y-3">
        <h2
          class="text-sm font-semibold text-muted tracking-wide uppercase px-1"
        >
          Pemasukan
        </h2>
        {#if categories.filter((c) => c.type === "income").length === 0}
          <Card class="p-4 text-center">
            <p class="text-sm text-muted">Belum ada kategori pemasukan</p>
          </Card>
        {:else}
          <div class="flex flex-col gap-2">
            {#each categories.filter((c) => c.type === "income") as category}
              <button
                class="w-full flex items-center justify-between p-3 bg-surface border border-border rounded-xl hover:border-muted transition-colors text-left"
                onclick={() => openEditModal(category)}
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-600"
                  >
                    <ArrowDownIcon size={20} />
                  </div>
                  <div>
                    <h3 class="font-medium text-foreground">{category.name}</h3>
                    {#if category.subcategories?.length}
                      <p class="text-xs text-muted">
                        {category.subcategories.length} sub-kategori
                      </p>
                    {/if}
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </section>

      <!-- Expense Section -->
      <section class="space-y-3">
        <h2
          class="text-sm font-semibold text-muted tracking-wide uppercase px-1"
        >
          Pengeluaran
        </h2>
        {#if categories.filter((c) => c.type === "expense").length === 0}
          <Card class="p-4 text-center">
            <p class="text-sm text-muted">Belum ada kategori pengeluaran</p>
          </Card>
        {:else}
          <div class="flex flex-col gap-2">
            {#each categories.filter((c) => c.type === "expense") as category}
              <button
                class="w-full flex items-center justify-between p-3 bg-surface border border-border rounded-xl hover:border-muted transition-colors text-left"
                onclick={() => openEditModal(category)}
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100 text-red-600"
                  >
                    <ArrowUpIcon size={20} />
                  </div>
                  <div>
                    <h3 class="font-medium text-foreground">{category.name}</h3>
                    {#if category.subcategories?.length}
                      <p class="text-xs text-muted">
                        {category.subcategories.length} sub-kategori
                      </p>
                    {/if}
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  {/if}

  <ManageCategoryModal
    bind:isOpen={isModalOpen}
    categoryToEdit={editingCategory}
    onSuccess={handleSuccess}
  />
</div>
