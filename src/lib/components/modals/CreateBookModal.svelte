<script lang="ts">
  import { Button, ResponsiveModal } from "$lib/components/ui";
  import { booksStore, onboardingStore } from "$lib/stores";

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
      
      // Notify onboarding that book was created
      onboardingStore.completeAction("book_created");
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
        Nama Buku
      </label>
      <input
        id="book-name"
        type="text"
        bind:value={name}
        placeholder="contoh: Keuangan Rumah, Liburan Bali"
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <div>
      <label
        for="book-description"
        class="block text-sm font-medium text-secondary mb-1.5"
      >
        Deskripsi (opsional)
      </label>
      <textarea
        id="book-description"
        bind:value={description}
        placeholder="Buku ini untuk apa?"
        rows="2"
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      ></textarea>
    </div>
  </div>

  <div class="flex gap-3 mt-6">
    <Button variant="secondary" fullWidth onclick={handleClose}>Batal</Button>
    <Button
      variant="primary"
      fullWidth
      loading={isCreating}
      onclick={handleSubmit}>Buat Buku</Button
    >
  </div>
</ResponsiveModal>
