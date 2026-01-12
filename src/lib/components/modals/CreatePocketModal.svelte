<script lang="ts">
  import { Button, ResponsiveModal } from "$lib/components/ui";
  import { booksStore } from "$lib/stores";

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

  async function handleSubmit() {
    if (!name.trim() || !booksStore.activeBook) return;

    isCreating = true;
    const pocket = await booksStore.createPocket(booksStore.activeBook.id, {
      name: name.trim(),
      type_slug: typeSlug,
      color,
      balance: balance ? Math.round(parseFloat(balance) * 100) : 0,
    });

    if (pocket) {
      resetForm();
      onClose();
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
      <label class="block text-sm font-medium text-secondary mb-1.5">Type</label
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
        >Color</label
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

    <!-- Initial Balance -->
    <div>
      <label
        for="pocket-balance"
        class="block text-sm font-medium text-secondary mb-1.5"
      >
        Initial Balance
      </label>
      <input
        id="pocket-balance"
        type="number"
        bind:value={balance}
        placeholder="0"
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
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
