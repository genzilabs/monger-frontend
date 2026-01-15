<script lang="ts">
  import { Button, ResponsiveModal, ErrorAlert } from "$lib/components/ui";
  import { booksStore, toastStore } from "$lib/stores";
  import type { Pocket } from "$lib/types";
  import { ShieldIcon, TrashIcon } from "$lib/icons";
  import { pocketsApi } from "$lib/api/pockets";
  import { goto } from "$app/navigation";

  interface Props {
    open: boolean;
    pocket: Pocket | null;
    onClose: () => void;
    onDeleted?: () => void;
  }

  let { open, pocket, onClose, onDeleted }: Props = $props();

  // Form state
  let name = $state("");
  let typeSlug = $state("cash");
  let color = $state("#448AFF");
  let isSaving = $state(false);
  let isDeleting = $state(false);
  let showDeleteConfirm = $state(false);

  const pocketTypes = [
    { slug: "cash", name: "Cash", icon: "💵" },
    { slug: "bank", name: "Bank Account", icon: "🏦" },
    { slug: "e-wallet", name: "E-Wallet", icon: "📱" },
    { slug: "credit", name: "Credit Card", icon: "💳" },
  ];

  const colors = [
    "#448AFF",
    "#4CAF50",
    "#FF9800",
    "#9C27B0",
    "#F44336",
    "#00BCD4",
  ];

  // Initialize form when pocket changes
  $effect(() => {
    if (open && pocket) {
      name = pocket.name;
      typeSlug = pocket.type_slug;
      color = pocket.color;
      showDeleteConfirm = false;
    }
  });

  async function handleSubmit() {
    if (!pocket || !name.trim() || !booksStore.activeBook) return;

    isSaving = true;
    try {
      const res = await pocketsApi.update(pocket.id, {
        name: name.trim(),
        type_slug: typeSlug,
        color,
      });

      if (res.data) {
        toastStore.success("Kantong berhasil diperbarui");
        // Refresh pockets list
        await booksStore.loadPockets(booksStore.activeBook.id);
        onClose();
      } else {
        toastStore.error(res.error?.error || "Gagal memperbarui kantong");
      }
    } catch (e) {
      toastStore.error("Terjadi kesalahan");
    } finally {
      isSaving = false;
    }
  }

  async function handleDelete() {
    if (!pocket || !booksStore.activeBook) return;

    isDeleting = true;
    try {
      const res = await pocketsApi.delete(pocket.id);
      if (res.data) {
        toastStore.success("Kantong berhasil dihapus");
        await booksStore.loadPockets(booksStore.activeBook.id);
        if (onDeleted) onDeleted();
        else {
          goto("/pockets");
          onClose();
        }
      } else {
        toastStore.error(res.error?.error || "Gagal menghapus kantong");
      }
    } catch (e) {
      toastStore.error("Terjadi kesalahan");
    } finally {
      isDeleting = false;
    }
  }
</script>

<ResponsiveModal {open} {onClose} title="Edit Kantong">
  {#if showDeleteConfirm}
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
  {:else}
    <div class="space-y-4">
      <!-- Name -->
      <div>
        <label
          for="pocket-name"
          class="block text-sm font-medium text-secondary mb-1.5"
        >
          Nama Kantong
        </label>
        <input
          id="pocket-name"
          type="text"
          bind:value={name}
          placeholder="Contoh: Dompet Utama"
          class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <!-- Type -->
      <div>
        <label class="block text-sm font-medium text-secondary mb-1.5"
          >Tipe</label
        >
        <div class="grid grid-cols-2 gap-2">
          {#each pocketTypes as type}
            <button
              type="button"
              class="flex items-center gap-2 p-3 rounded-xl border transition-all {typeSlug ===
              type.slug
                ? 'border-primary bg-primary/10'
                : 'border-border'}"
              onclick={() => (typeSlug = type.slug)}
            >
              <span class="text-xl">{type.icon}</span>
              <span class="text-sm text-foreground">{type.name}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Color -->
      <div>
        <label class="block text-sm font-medium text-secondary mb-1.5"
          >Warna</label
        >
        <div class="flex gap-2">
          {#each colors as c}
            <button
              type="button"
              class="w-10 h-10 rounded-full border-2 transition-all"
              style="background: {c}; border-color: {color === c
                ? 'white'
                : 'transparent'}; box-shadow: {color === c
                ? '0 0 0 2px ' + c
                : 'none'}"
              onclick={() => (color = c)}
            ></button>
          {/each}
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="pt-6 border-t border-border mt-6">
        <button
          onclick={() => (showDeleteConfirm = true)}
          class="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
        >
          <TrashIcon size={16} />
          Hapus Kantong ini
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 mt-6">
      <Button variant="secondary" fullWidth onclick={onClose}>Batal</Button>
      <Button
        variant="primary"
        fullWidth
        loading={isSaving}
        onclick={handleSubmit}>Simpan Perubahan</Button
      >
    </div>
  {/if}
</ResponsiveModal>
