<script lang="ts">
  import { Button, ResponsiveModal } from "$lib/components/ui";
  import { booksStore, toastStore } from "$lib/stores";
  import { booksApi } from "$lib/api";
  import type { Book } from "$lib/types";

  interface Props {
    open: boolean;
    book: Book | null;
    onClose: () => void;
    onSuccess?: () => void;
  }

  let { open, book, onClose, onSuccess }: Props = $props();

  let name = $state("");
  let description = $state("");
  let isSaving = $state(false);

  // Track if form has changes
  const hasChanges = $derived(
    book
      ? name !== book.name || description !== (book.description || "")
      : false
  );

  // Initialize form when book changes or modal opens
  $effect(() => {
    if (open && book) {
      name = book.name;
      description = book.description || "";
    }
  });

  async function handleSubmit() {
    if (!book || !name.trim()) return;

    isSaving = true;
    try {
      const res = await booksApi.update(book.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        version: book.version,
      });

      if (res.data) {
        toastStore.success("Buku berhasil diperbarui");
        // Refresh active book
        await booksStore.setActiveBook(res.data);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toastStore.error(res.error?.error || "Gagal memperbarui buku");
      }
    } catch (e) {
      toastStore.error("Terjadi kesalahan");
    } finally {
      isSaving = false;
    }
  }

  function handleClose() {
    onClose();
  }
</script>

<ResponsiveModal {open} onClose={handleClose} title="Ubah Buku">
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
      loading={isSaving}
      disabled={!hasChanges || !name.trim()}
      onclick={handleSubmit}>Simpan Perubahan</Button
    >
  </div>
</ResponsiveModal>
