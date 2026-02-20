<script lang="ts">
  import { Button, Input, BottomSheet } from '$lib/components/ui';
  import type { Category, CreateCategoryRequest } from '$lib/types';
  import { categoriesApi } from '$lib/api';
  import { toastStore } from '$lib/stores';
  import { booksStore } from '$lib/stores/books.svelte';
  import { EditIcon, PlusIcon, TrashIcon, CheckIcon, XIcon } from '$lib/icons';
  import type { Subcategory } from '$lib/types/category';

  interface Props {
    open: boolean;
    categoryToEdit?: Category | null;
    onClose: () => void;
    onSuccess?: () => void;
  }

  let { 
    open, 
    categoryToEdit = null,
    onClose,
    onSuccess 
  }: Props = $props();

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

    if (!categoryToEdit && !booksStore.activeBook) {
        toastStore.error('Tidak ada buku yang aktif');
        return;
    }

    isLoading = true;
    try {
      if (categoryToEdit) {
        await categoriesApi.update(categoryToEdit.id, {
          name: formData.name,
          icon: formData.icon,
          version: categoryToEdit.version,
        });
        toastStore.success('Kategori berhasil diperbarui');
      } else if (booksStore.activeBook) {
        await categoriesApi.create(booksStore.activeBook.id, formData);
        toastStore.success('Kategori berhasil dibuat');
      }
      onClose();
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
      onClose();
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
</script>

<BottomSheet {open} {onClose} title={categoryToEdit ? 'Edit Kategori' : 'Tambah Kategori'}>
  <div class="space-y-6 pb-6">
    <div class="flex justify-between items-center">
        {#if categoryToEdit}
            <button 
                class="text-red-500 hover:text-red-700 text-sm font-medium ml-auto"
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

    <div class="flex gap-3 pt-2">
      <Button variant="secondary" onclick={onClose} fullWidth>Batal</Button>
      <Button variant="primary" onclick={handleSubmit} fullWidth>
        {isLoading ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </div>
  </div>
</BottomSheet>
