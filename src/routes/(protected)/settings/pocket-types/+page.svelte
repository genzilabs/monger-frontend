<script lang="ts">
  import { booksStore } from "$lib/stores/books.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import type { PocketType } from "$lib/types";
  import { Card } from "$lib/components/ui";
  import DynamicIcon from "$lib/components/ui/DynamicIcon.svelte";
  import { PlusIcon, EditIcon, TrashIcon } from "$lib/icons";
  import { onMount } from "svelte";
  import CreatePocketTypeSheet from "./CreatePocketTypeSheet.svelte";

  let customTypes = $derived(
    booksStore.pocketTypes.filter((t) => !t.is_system)
  );
  let systemTypes = $derived(booksStore.pocketTypes.filter((t) => t.is_system));

  let isSheetOpen = $state(false);
  let editingType = $state<PocketType | null>(null);

  onMount(() => {
    if (booksStore.activeBook) {
      booksStore.loadPocketTypes(booksStore.activeBook.id);
    }
  });

  function startCreate() {
    isSheetOpen = true;
    editingType = null;
  }

  function startEdit(type: PocketType) {
    isSheetOpen = true;
    editingType = type;
  }

  function handleSheetClose() {
    isSheetOpen = false;
    editingType = null;
  }

  async function handleDelete(id: string) {
    if (confirm("Yakin ingin menghapus tipe kantong ini?")) {
      await booksStore.deletePocketType(id);
    }
  }
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
    >
      Tambah Tipe Baru
    </span>
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
</div>

<CreatePocketTypeSheet
  open={isSheetOpen}
  {editingType}
  onClose={handleSheetClose}
/>
