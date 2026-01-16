<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { Button, Input } from '$lib/components/ui';
  import type { Category, CreateCategoryRequest } from '$lib/types';
  import { categoriesApi } from '$lib/api';
  import { toastStore } from '$lib/stores';
  import { EditIcon, PlusIcon, TrashIcon, CheckIcon, XIcon } from '$lib/icons';
  import type { Subcategory } from '$lib/types/category';

  let { 
    isOpen = $bindable(false), 
    categoryToEdit = null,
    onSuccess 
  }: { 
    isOpen: boolean, 
    categoryToEdit?: Category | null,
    onSuccess?: () => void 
  } = $props();

  let formData = $state<CreateCategoryRequest>({
    name: '',
    icon: '',
    type: 'expense'
  });

  let subcategories = $state<Subcategory[]>([]);
  let newSubcategoryName = $state('');
  let editingSubId = $state<string | null>(null);
  let editingSubName = $state('');

  let isLoading = $state(false);
  let isSubmittingSub = $state(false);

  // Sync form data when categoryToEdit changes
  $effect(() => {
    if (categoryToEdit) {
      formData = {
        name: categoryToEdit.name,
        icon: categoryToEdit.icon || '',
        type: categoryToEdit.type
      };
      subcategories = categoryToEdit.subcategories || [];
    } else {
      formData = {
        name: '',
        icon: '',
        type: 'expense'
      };
      subcategories = [];
    }
  });

  async function handleSubmit() {
    if (!formData.name) {
      toastStore.error('Nama kategori harus diisi');
      return;
    }

    isLoading = true;
    try {
      if (categoryToEdit) {
        await categoriesApi.update(categoryToEdit.id, formData);
        toastStore.success('Kategori berhasil diperbarui');
      } else {
        await categoriesApi.create(formData);
        toastStore.success('Kategori berhasil dibuat');
      }
      isOpen = false;
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toastStore.error(categoryToEdit ? 'Gagal memperbarui kategori' : 'Gagal membuat kategori');
    } finally {
      isLoading = false;
    }
  }

  async function handleDelete() {
    if (!categoryToEdit || !confirm('Apakah anda yakin ingin menghapus kategori ini?')) return;

    isLoading = true;
    try {
      await categoriesApi.delete(categoryToEdit.id);
      toastStore.success('Kategori berhasil dihapus');
      isOpen = false;
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toastStore.error('Gagal menghapus kategori');
    } finally {
      isLoading = false;
    }
  }

  async function handleAddSubcategory() {
    if (!categoryToEdit || !newSubcategoryName.trim()) return;
    
    isSubmittingSub = true;
    try {
      const res = await categoriesApi.createSubcategory(categoryToEdit.id, { name: newSubcategoryName });
      if (res.data) {
          subcategories = [...subcategories, res.data];
          newSubcategoryName = '';
          toastStore.success('Sub-kategori ditambahkan');
          onSuccess?.(); // Refresh parent list silently
      }
    } catch (err) {
        console.error(err);
        toastStore.error('Gagal menambah sub-kategori');
    } finally {
        isSubmittingSub = false;
    }
  }

  async function handleDeleteSubcategory(subId: string) {
    if (!confirm('Hapus sub-kategori ini?')) return;
    
    try {
        await categoriesApi.deleteSubcategory(subId);
        subcategories = subcategories.filter(s => s.id !== subId);
        toastStore.success('Sub-kategori dihapus');
        onSuccess?.();
    } catch (err) {
        console.error(err);
        toastStore.error('Gagal menghapus sub-kategori');
    }
  }

  function startEditSub(sub: Subcategory) {
      editingSubId = sub.id;
      editingSubName = sub.name;
  }

  function cancelEditSub() {
      editingSubId = null;
      editingSubName = '';
  }

  async function saveEditSub(subId: string) {
      if (!editingSubName.trim()) return;

      try {
          // Use createSubcategory payload structure which is just { name }
          // Assuming updateSubcategory uses same payload structure based on API definition
          await categoriesApi.updateSubcategory(subId, { name: editingSubName });
          
          subcategories = subcategories.map(s => s.id === subId ? { ...s, name: editingSubName } : s);
          editingSubId = null;
          toastStore.success('Sub-kategori diperbarui');
          onSuccess?.();
      } catch (err) {
           console.error(err);
           toastStore.error('Gagal memperbarui sub-kategori');
      }
  }


  function handleClose() {
    isOpen = false;
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade>
    <div 
      class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
      transition:scale={{ start: 0.95 }}
    >
      <div class="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900">
            {categoryToEdit ? 'Edit Kategori' : 'Tambah Kategori'}
            </h2>
            {#if categoryToEdit}
                <button 
                    class="text-red-500 hover:text-red-700 text-sm font-medium"
                    onclick={handleDelete}
                    disabled={isLoading}
                >
                    Hapus Kategori
                </button>
            {/if}
        </div>

        <div class="space-y-4">
          <!-- Type Selection -->
          <div class="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 {formData.type === 'expense' ? 'bg-white text-error shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
              onclick={() => formData.type = 'expense'}
            >
              Pengeluaran
            </button>
            <button
              class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 {formData.type === 'income' ? 'bg-white text-success shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
              onclick={() => formData.type = 'income'}
            >
              Pemasukan
            </button>
          </div>

          <Input
            label="Nama Kategori"
            placeholder="Contoh: Makanan, Gaji, dll"
            bind:value={formData.name}
          />

          <Input
            label="Emoji / Ikon"
            placeholder="Contoh: 🍔, 💰"
            bind:value={formData.icon}
          />

          {#if categoryToEdit}
            <div class="pt-4 border-t border-gray-100">
                <label class="block text-sm font-medium text-gray-700 mb-2">Sub-kategori</label>
                
                <div class="space-y-2 mb-3">
                    {#each subcategories as sub}
                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg group">
                            {#if editingSubId === sub.id}
                                <div class="flex items-center gap-2 flex-1">
                                    <input 
                                        type="text" 
                                        class="flex-1 text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary px-2 py-1"
                                        bind:value={editingSubName}
                                        autofocus
                                    />
                                    <button class="text-green-600 hover:text-green-700" onclick={() => saveEditSub(sub.id)}>
                                        <CheckIcon size={16} />
                                    </button>
                                    <button class="text-gray-500 hover:text-gray-700" onclick={cancelEditSub}>
                                        <XIcon size={16} />
                                    </button>
                                </div>
                            {:else}
                                <span class="text-sm text-gray-700">{sub.name}</span>
                                <div class="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button class="p-1 text-gray-400 hover:text-blue-600" onclick={() => startEditSub(sub)}>
                                        <EditIcon size={14} />
                                    </button>
                                    <button class="p-1 text-gray-400 hover:text-red-600" onclick={() => handleDeleteSubcategory(sub.id)}>
                                        <TrashIcon size={14} />
                                    </button>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>

                <div class="flex gap-2">
                    <input 
                        type="text" 
                        class="flex-1 text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary px-3 py-2 border"
                        placeholder="Tambah sub-kategori baru..."
                        bind:value={newSubcategoryName}
                        onkeydown={(e) => e.key === 'Enter' && handleAddSubcategory()}
                    />
                    <button 
                        class="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                        onclick={handleAddSubcategory}
                        disabled={!newSubcategoryName.trim() || isSubmittingSub}
                    >
                        <PlusIcon size={18} />
                    </button>
                </div>
            </div>
          {/if}
        </div>
      </div>

      <div class="p-6 border-t border-gray-100 bg-gray-50">
        <div class="flex gap-3">
          <Button 
            variant="outline" 
            class="flex-1"
            onclick={handleClose}
            disabled={isLoading}
          >
            Selesai
          </Button>
          <Button 
            class="flex-1"
            onclick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Kategori'}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}
