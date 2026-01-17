<script lang="ts">
  import type { PocketType } from "$lib/types";
  import { Button, Input, BottomSheet } from "$lib/components/ui";
  import DynamicIcon from "$lib/components/ui/DynamicIcon.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { booksStore } from "$lib/stores/books.svelte";

  interface Props {
    open: boolean;
    editingType: PocketType | null;
    onClose: () => void;
  }

  let { open, editingType, onClose }: Props = $props();

  let isSlugManuallyEdited = $state(false);
  let formData = $state({
    name: "",
    slug: "",
    icon_slug: "wallet",
  });

  $effect(() => {
    if (editingType) {
      formData = {
        name: editingType.name,
        slug: editingType.slug,
        icon_slug: editingType.icon_slug,
      };
      isSlugManuallyEdited = true;
    } else {
      formData = { name: "", slug: "", icon_slug: "wallet" };
      isSlugManuallyEdited = false;
    }
  });

  async function handleSubmit() {
    if (!formData.name || !formData.slug) {
      toastStore.error("Nama dan Kode Unik harus diisi");
      return;
    }

    if (!booksStore.activeBook) {
      toastStore.error("Belum ada buku yang dipilih");
      return;
    }

    if (editingType) {
      await booksStore.updatePocketType(editingType.id, formData);
    } else {
      await booksStore.createPocketType(booksStore.activeBook.id, formData);
    }
    onClose();
  }

  // Generate slug from name if not manually edited
  $effect(() => {
    if (!isSlugManuallyEdited && formData.name && !editingType) {
      formData.slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    }
  });

  const availableIcons = [
    "wallet",
    "bank",
    "cash",
    "credit-card",
    "smartphone",
    "edit",
    "user",
    "shield",
    "settings",
    "home",
  ];
</script>

<BottomSheet {open} {onClose} title={editingType ? "Ubah Tipe" : "Tipe Baru"}>
  <div class="space-y-4 pb-6">
    <Input
      label="Nama"
      bind:value={formData.name}
      placeholder="contoh: Kripto, Brankas"
    />

    <Input
      label="Kode Unik"
      bind:value={formData.slug}
      placeholder="contoh: kripto"
      oninput={() => (isSlugManuallyEdited = true)}
    />

    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">Ikon</label>
      <div class="flex gap-2 flex-wrap">
        {#each availableIcons as icon}
          <button
            class="p-2 border rounded-lg transition-colors {formData.icon_slug ===
            icon
              ? 'bg-primary/10 border-primary'
              : 'bg-surface border-border hover:border-muted'}"
            onclick={() => (formData.icon_slug = icon)}
          >
            <DynamicIcon name={icon} size={24} />
          </button>
        {/each}
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      <Button variant="secondary" onclick={onClose} fullWidth>Batal</Button>
      <Button variant="primary" onclick={handleSubmit} fullWidth>Simpan</Button>
    </div>
  </div>
</BottomSheet>
