<script lang="ts">
  import { Button, ResponsiveModal, MoneyInput } from "$lib/components/ui";
  import DynamicIcon from "$lib/components/ui/DynamicIcon.svelte";
  import { booksStore, onboardingStore } from "$lib/stores";
  import { onMount } from "svelte";

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  // Form state
  let name = $state("");
  let typeSlug = $state("cash");
  let color = $state("#448AFF");
  let balance = $state("");
  let isCreating = $state(false);

  let pocketTypes = $derived(
    booksStore.pocketTypes.length > 0
      ? booksStore.pocketTypes
      : [
          { slug: "cash", name: "Cash", icon_slug: "cash" },
          { slug: "bank", name: "Bank Account", icon_slug: "bank" },
        ],
  ); // Fallback if store is empty

  const colors = [
    "#448AFF",
    "#4CAF50",
    "#FF9800",
    "#9C27B0",
    "#F44336",
    "#00BCD4",
  ];

  onMount(() => {
    if (booksStore.activeBook) {
      booksStore.loadPocketTypes(booksStore.activeBook.id);
    }
  });

  async function handleSubmit() {
    if (!name.trim() || !booksStore.activeBook) return;

    isCreating = true;
    const type = pocketTypes.find((t) => t.slug === typeSlug);

    const pocket = await booksStore.createPocket(booksStore.activeBook.id, {
      name: name.trim(),
      type_slug: typeSlug,
      icon_slug: type?.icon_slug,
      color,
      balance: balance ? Math.round(parseFloat(balance) * 100) : 0,
    });

    if (pocket) {
      resetForm();
      onClose();
      
      // Notify onboarding that pocket was created
      onboardingStore.completeAction("pocket_created");
    }
    isCreating = false;
  }
  function resetForm() {
    name = "";
    typeSlug = "cash";
    color = "#448AFF";
    balance = "";
  }

  function handleClose() {
    resetForm();
    onClose();
  }
</script>

<ResponsiveModal {open} onClose={handleClose} title="Tambah Kantong Baru">
  <div class="space-y-4">
    <!-- Name -->
    <div>
      <label
        for="pocket-name"
        class="block text-sm font-medium text-secondary mb-1.5"
      >
        Pocket Name
      </label>
      <input
        id="pocket-name"
        type="text"
        bind:value={name}
        placeholder="e.g., Main Wallet"
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
    <!-- Type -->
    <div>
      <span
        id="pocket-type-label"
        class="block text-sm font-medium text-secondary mb-1.5">Type</span
      >
      <div
        class="grid grid-cols-2 gap-2 overflow-y-auto"
        role="radiogroup"
        aria-labelledby="pocket-type-label"
      >
        {#each pocketTypes as type}
          <button
            type="button"
            class="flex items-center gap-2 p-3 rounded-xl border transition-all {typeSlug ===
            type.slug
              ? 'border-primary bg-primary/10'
              : 'border-border'}"
            onclick={() => (typeSlug = type.slug)}
          >
            <DynamicIcon name={type.icon_slug} size={20} />
            <span class="text-sm text-foreground">{type.name}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Color -->
    <div>
      <span
        id="pocket-color-label"
        class="block text-sm font-medium text-secondary mb-1.5">Color</span
      >
      <div
        class="flex gap-2"
        role="radiogroup"
        aria-labelledby="pocket-color-label"
      >
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
            aria-label="Select color {c}"
          ></button>
        {/each}
      </div>
    </div>

    <!-- Initial Balance -->
    <div>
      <label
        for="pocket-balance"
        class="block text-sm font-medium text-secondary mb-1.5"
      >
        Initial Balance
      </label>
      <MoneyInput id="pocket-balance" bind:value={balance} placeholder="0" />
    </div>
  </div>

  <!-- Actions -->
  <div class="flex gap-3 mt-6">
    <Button variant="secondary" fullWidth onclick={handleClose}>Cancel</Button>
    <Button
      variant="primary"
      fullWidth
      loading={isCreating}
      onclick={handleSubmit}>Add Pocket</Button
    >
  </div>
</ResponsiveModal>
