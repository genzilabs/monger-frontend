<script lang="ts">
  import { Card, Button } from "$lib/components/ui";
  import { ExportModal, ImportWizard } from "$lib/components/modals";
  import { booksStore, toastStore } from "$lib/stores";
  import { Download, Upload, FileDown } from "lucide-svelte";
  import { downloadImportTemplate, downloadBlob } from "$lib/api/dataTransfer";

  // Modal states
  let showExportModal = $state(false);
  let showImportWizard = $state(false);
  let selectedBookId = $state<string | null>(null);
  let isDownloadingTemplate = $state(false);

  // Get selected book
  const selectedBook = $derived(
    booksStore.books.find((b) => b.id === selectedBookId)
  );

  // Auto-select active book if available
  $effect(() => {
    if (!selectedBookId && booksStore.activeBook) {
      selectedBookId = booksStore.activeBook.id;
    } else if (!selectedBookId && booksStore.books.length > 0) {
      selectedBookId = booksStore.books[0].id;
    }
  });

  async function handleDownloadTemplate() {
    if (!selectedBookId) {
      toastStore.error("Pilih buku terlebih dahulu");
      return;
    }

    isDownloadingTemplate = true;
    const result = await downloadImportTemplate(selectedBookId);
    if (result.data) {
      downloadBlob(result.data, "monger_import_template.csv");
      toastStore.success("Template berhasil diunduh");
    } else {
      toastStore.error(result.error?.error || "Gagal mengunduh template");
    }
    isDownloadingTemplate = false;
  }

  function handleImported() {
    if (selectedBookId) {
      booksStore.loadPockets(selectedBookId);
      toastStore.success("Data berhasil diimpor!");
    }
  }
</script>

<div class="space-y-6 animate-fade-in">
  <div class="flex items-center gap-3">
    <h2 class="text-xl font-bold text-foreground">Pengaturan</h2>
  </div>

  <!-- Language & Currency Settings -->
  <Card class="divide-y divide-border">
    <div class="p-4 flex items-center justify-between">
      <div>
        <p class="font-medium text-foreground">Bahasa</p>
        <p class="text-xs text-secondary">Bahasa Indonesia (Default)</p>
      </div>
      <div
        class="px-3 py-1 bg-surface-elevated rounded text-xs font-mono text-muted"
      >
        ID
      </div>
    </div>
    <div class="p-4 flex items-center justify-between">
      <div>
        <p class="font-medium text-foreground">Mata Uang</p>
        <p class="text-xs text-secondary">Rupiah Indonesia</p>
      </div>
      <div
        class="px-3 py-1 bg-surface-elevated rounded text-xs font-mono text-muted"
      >
        IDR
      </div>
    </div>
  </Card>

  <!-- Data Management Section -->
  <div class="space-y-3">
    <h3 class="text-lg font-semibold text-foreground">Kelola Data</h3>

    <Card class="p-4 space-y-4">
      <!-- Book Selector -->
      <div>
        <label for="book-select" class="block text-sm font-medium text-secondary mb-2">
          Pilih Buku
        </label>
        <select
          id="book-select"
          bind:value={selectedBookId}
          class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {#if booksStore.books.length === 0}
            <option value={null}>Tidak ada buku</option>
          {:else}
            {#each booksStore.books as book}
              <option value={book.id}>{book.name}</option>
            {/each}
          {/if}
        </select>
      </div>

      <!-- Export/Import Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          variant="outline"
          fullWidth
          onclick={() => selectedBookId && (showExportModal = true)}
          disabled={!selectedBookId}
        >
          {#snippet icon()}
            <Download size={18} />
          {/snippet}
          Ekspor Data
        </Button>

        <Button
          variant="outline"
          fullWidth
          onclick={() => selectedBookId && (showImportWizard = true)}
          disabled={!selectedBookId}
        >
          {#snippet icon()}
            <Upload size={18} />
          {/snippet}
          Impor Data
        </Button>

        <Button
          variant="outline"
          fullWidth
          onclick={handleDownloadTemplate}
          loading={isDownloadingTemplate}
          disabled={!selectedBookId}
        >
          {#snippet icon()}
            <FileDown size={18} />
          {/snippet}
          Unduh Template
        </Button>
      </div>

      <p class="text-xs text-muted">
        Ekspor transaksi ke CSV untuk backup atau analisis.
        Impor transaksi dari file CSV menggunakan template yang disediakan.
      </p>
    </Card>
  </div>
</div>

<!-- Export Modal -->
{#if selectedBook}
  <ExportModal
    open={showExportModal}
    onClose={() => (showExportModal = false)}
    bookId={selectedBook.id}
    bookName={selectedBook.name}
  />

  <ImportWizard
    open={showImportWizard}
    onClose={() => (showImportWizard = false)}
    bookId={selectedBook.id}
    bookName={selectedBook.name}
    onImported={handleImported}
  />
{/if}
