<script lang="ts">
  import { Button, ResponsiveModal } from "$lib/components/ui";
  import { booksStore } from "$lib/stores";

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  let name = $state("");
  let description = $state("");
  let isCreating = $state(false);

  async function handleSubmit() {
    if (!name.trim()) return;

    isCreating = true;
    const book = await booksStore.createBook({
      name: name.trim(),
      description: description.trim() || undefined,
    });

    if (book) {
      resetForm();
      onClose();
    }
    isCreating = false;
  }

  function resetForm() {
    name = "";
    description = "";
  }

  function handleClose() {
    resetForm();
    onClose();
  }
</script>

<ResponsiveModal {open} onClose={handleClose} title="Buat Buku Baru">
  <div class="space-y-4">
    <div>
      <label
        for="book-name"
        class="block text-sm font-medium text-secondary mb-1.5"
      >
        Book Name
      </label>
      <input
        id="book-name"
        type="text"
        bind:value={name}
        placeholder="e.g., Household Budget, Trip to Bali"
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <div>
      <label
        for="book-description"
        class="block text-sm font-medium text-secondary mb-1.5"
      >
        Description (optional)
      </label>
      <textarea
        id="book-description"
        bind:value={description}
        placeholder="What is this book for?"
        rows="2"
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      ></textarea>
    </div>
  </div>

  <div class="flex gap-3 mt-6">
    <Button variant="secondary" fullWidth onclick={handleClose}>Cancel</Button>
    <Button
      variant="primary"
      fullWidth
      loading={isCreating}
      onclick={handleSubmit}>Create Book</Button
    >
  </div>
</ResponsiveModal>
