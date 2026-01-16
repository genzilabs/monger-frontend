<script lang="ts">
  import { booksStore } from "$lib/stores/books.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import type { PocketType } from "$lib/types";
  import { Button, Input, Card } from "$lib/components/ui";
  import DynamicIcon from "$lib/components/ui/DynamicIcon.svelte";
  import { PlusIcon, EditIcon, TrashIcon } from "$lib/icons";
  import { onMount } from "svelte";

  let customTypes = $derived(
    booksStore.pocketTypes.filter((t) => !t.is_system)
  );
  let systemTypes = $derived(booksStore.pocketTypes.filter((t) => t.is_system));

  let isEditing = $state(false);
  let editingType = $state<PocketType | null>(null);
  let isSlugManuallyEdited = $state(false);
  let formData = $state({
    name: "",
    slug: "",
    icon_slug: "wallet",
  });

  onMount(() => {
    if (booksStore.activeBook) {
      booksStore.loadPocketTypes(booksStore.activeBook.id);
    }
  });

  function startCreate() {
    isEditing = true;
    editingType = null;
    isSlugManuallyEdited = false;
    formData = { name: "", slug: "", icon_slug: "wallet" };
  }

  function startEdit(type: PocketType) {
    isEditing = true;
    editingType = type;
    isSlugManuallyEdited = true;
    formData = {
      name: type.name,
      slug: type.slug,
      icon_slug: type.icon_slug,
    };
  }

  function cancelEdit() {
    isEditing = false;
    editingType = null;
  }

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
    isEditing = false;
  }

  async function handleDelete(id: string) {
    if (confirm("Yakin ingin menghapus tipe kantong ini?")) {
      await booksStore.deletePocketType(id);
    }
  }

  // Generate slug from name if not manually edited
  $effect(() => {
    if (!isSlugManuallyEdited && formData.name) {
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

<svelte:head>
  <title>Tipe Kantong - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-6 pb-20">
  <!-- Header (Title Only) -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Tipe Kantong</h1>
      <p class="text-secondary">Kelola tipe kantong kustommu.</p>
    </div>
  </div>

  {#if isEditing}
    <!-- Edit/Create Form -->
    <Card class="p-4 space-y-4">
      <h2 class="text-lg font-semibold text-foreground">
        {editingType ? "Ubah Tipe" : "Tipe Baru"}
      </h2>

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
        <Button variant="secondary" onclick={cancelEdit} fullWidth>
          Batal
        </Button>
        <Button variant="primary" onclick={handleSubmit} fullWidth>
          Simpan
        </Button>
      </div>
    </Card>
  {:else}
    <!-- Add New Type Card -->
    <button
      onclick={startCreate}
      class="w-full border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex items-center justify-center gap-2 group min-h-15"
    >
      <div
        class="w-8 h-8 rounded-full bg-surface-elevated group-hover:bg-primary/10 flex items-center justify-center transition-colors"
      >
        <PlusIcon size={18} class="text-muted group-hover:text-primary" />
      </div>
      <span
        class="text-sm font-semibold text-muted group-hover:text-primary transition-colors"
        >Tambah Tipe Baru</span
      >
    </button>

    <!-- Custom Types -->
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-muted tracking-wide uppercase px-1">
        Tipe Buatan
      </h3>

      {#if customTypes.length === 0}
        <Card class="text-center py-8">
          <p class="text-muted">Belum ada tipe buatan.</p>
          <p class="text-sm text-muted/70 mt-1">
            Buat tipe baru untuk mengelola kantongmu.
          </p>
        </Card>
      {:else}
        <Card class="divide-y divide-border">
          {#each customTypes as type}
            <div class="flex items-center p-4">
              <div
                class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mr-3"
              >
                <DynamicIcon name={type.icon_slug} size={20} />
              </div>
              <div class="flex-1">
                <p class="font-medium text-foreground">{type.name}</p>
                <p class="text-xs text-muted font-mono">{type.slug}</p>
              </div>
              <div class="flex gap-1">
                <button
                  onclick={() => startEdit(type)}
                  class="p-2 text-muted hover:text-primary transition-colors"
                >
                  <EditIcon size={18} />
                </button>
                <button
                  onclick={() => handleDelete(type.id)}
                  class="p-2 text-muted hover:text-red-500 transition-colors"
                >
                  <TrashIcon size={18} />
                </button>
              </div>
            </div>
          {/each}
        </Card>
      {/if}
    </section>

    <!-- System Types -->
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-muted tracking-wide uppercase px-1">
        Tipe Bawaan
      </h3>
      <Card class="divide-y divide-border">
        {#each systemTypes as type}
          <div class="flex items-center p-4">
            <div
              class="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center text-muted mr-3"
            >
              <DynamicIcon name={type.icon_slug} size={20} />
            </div>
            <div class="flex-1">
              <p class="font-medium text-foreground">{type.name}</p>
              <p class="text-xs text-muted font-mono">{type.slug}</p>
            </div>
            <span
              class="text-xs bg-surface-elevated text-muted px-2 py-1 rounded"
            >
              Bawaan
            </span>
          </div>
        {/each}
      </Card>
    </section>
  {/if}
</div>
