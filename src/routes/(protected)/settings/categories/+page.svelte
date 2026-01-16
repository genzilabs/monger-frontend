<script lang="ts">
  import { onMount } from "svelte";
  import { categoriesApi } from "$lib/api";
  import { Button, DynamicIcon } from "$lib/components/ui";
  import { ChevronLeftIcon, ArrowUpIcon, ArrowDownIcon } from "$lib/icons";
  import type { Category } from "$lib/types/category";
  import ManageCategoryModal from "$lib/components/modals/ManageCategoryModal.svelte";

  let categories = $state<Category[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  let isModalOpen = $state(false);
  let editingCategory = $state<Category | null>(null);

  async function loadCategories() {
    isLoading = true;
    error = null;
    try {
      const res = await categoriesApi.list();
      if (res.data) {
        categories = res.data.categories;
      } else {
        throw new Error(res.error?.error || 'Gagal memuat kategori');
      }
    } catch (err) {
      error = "Gagal memuat kategori";
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadCategories();
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

  function getIcon(type: string) {
    return type === 'income' ? ArrowDownIcon : ArrowUpIcon;
  }
</script>

<svelte:head>
  <title>Kategori Transaksi - Monger</title>
</svelte:head>

<div class="container max-w-md mx-auto p-4 space-y-6 pb-24">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <Button
      variant="ghost"
      size="icon"
      onclick={() => window.history.back()}
      class="shrink-0"
    >
      <ChevronLeftIcon size={24} />
    </Button>
    <h1 class="text-xl font-bold text-foreground">Kategori Transaksi</h1>
  </div>

  {#if isLoading && !categories.length}
    <div class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  {:else if error}
    <div class="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-center text-sm">
      {error}
      <button class="block w-full mt-2 text-primary font-medium" onclick={loadCategories}>Coba Lagi</button>
    </div>
  {:else}
    <!-- Categories List -->
    <div class="space-y-6">
      
      <!-- Income Section -->
      <section class="space-y-3">
        <h2 class="text-sm font-semibold text-muted tracking-wide uppercase px-1">Pemasukan</h2>
        <div class="flex flex-col gap-2">
          {#each categories.filter(c => c.type === 'income') as category}
            <button 
                class="w-full flex items-center justify-between p-3 bg-surface border border-border rounded-xl hover:bg-gray-50 transition-colors text-left"
                onclick={() => openEditModal(category)}
            >
              <div class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-600 text-xl">
                    {#if category.icon}
                        {category.icon}
                    {:else}
                        <ArrowDownIcon size={20} />
                    {/if}
                 </div>
                 <div>
                    <h3 class="font-medium text-foreground">{category.name}</h3>
                    {#if category.subcategories?.length}
                       <p class="text-xs text-muted">{category.subcategories.length} sub-kategori</p>
                    {/if}
                 </div>
              </div>
            </button>
          {:else}
             <div class="text-center py-4 text-sm text-muted">Belum ada kategori pemasukan</div>
          {/each}
        </div>
      </section>

      <!-- Expense Section -->
      <section class="space-y-3">
        <h2 class="text-sm font-semibold text-muted tracking-wide uppercase px-1">Pengeluaran</h2>
        <div class="flex flex-col gap-2">
          {#each categories.filter(c => c.type === 'expense') as category}
            <button 
                class="w-full flex items-center justify-between p-3 bg-surface border border-border rounded-xl hover:bg-gray-50 transition-colors text-left"
                onclick={() => openEditModal(category)}
            >
               <div class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100 text-red-600 text-xl">
                    {#if category.icon}
                        {category.icon}
                    {:else}
                        <ArrowUpIcon size={20} />
                    {/if}
                 </div>
                 <div>
                    <h3 class="font-medium text-foreground">{category.name}</h3>
                    {#if category.subcategories?.length}
                       <p class="text-xs text-muted">{category.subcategories.length} sub-kategori</p>
                    {/if}
                 </div>
              </div>
            </button>
          {:else}
             <div class="text-center py-4 text-sm text-muted">Belum ada kategori pengeluaran</div>
          {/each}
        </div>
      </section>

      <div class="pt-4 flex justify-center">
         <Button 
            variant="outline" 
            fullWidth 
            onclick={openCreateModal}
          >
           Tambah Kategori Baru
         </Button>
      </div>

    </div>
  {/if}

  <ManageCategoryModal
    bind:isOpen={isModalOpen}
    categoryToEdit={editingCategory}
    onSuccess={handleSuccess}
  />
</div>
