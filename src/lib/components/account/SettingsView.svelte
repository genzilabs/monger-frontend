<script lang="ts">
  import { browser } from "$app/environment";
  import { Card, Button } from "$lib/components/ui";
  import { CheckIcon, ChevronRightIcon } from "$lib/icons";

  // Get current locale from localStorage
  let currentLocale = $state("id");
  let showLanguageSelector = $state(false);

  if (browser) {
    currentLocale = localStorage.getItem("monger:locale") || "id";
  }

  const languages = [
    { code: "id", name: "Bahasa Indonesia", short: "ID" },
    { code: "en", name: "English", short: "EN" },
  ];

  function selectLanguage(code: string) {
    currentLocale = code;
    showLanguageSelector = false;
    if (browser) {
      localStorage.setItem("monger:locale", code);
      // Reload the page to apply the new locale
      window.location.reload();
    }
  }

  const currentLanguage = $derived(
    languages.find((l) => l.code === currentLocale) || languages[0],
  );
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
  <Card class="divide-y divide-border overflow-hidden">
    <!-- Language Setting -->
    <button
      onclick={() => (showLanguageSelector = !showLanguageSelector)}
      class="w-full p-4 flex items-center justify-between hover:bg-surface-elevated transition-colors"
    >
      <div class="text-left">
        <p class="font-medium text-foreground">Bahasa</p>
        <p class="text-xs text-secondary">{currentLanguage.name}</p>
      </div>
      <div class="flex items-center gap-2">
        <div
          class="px-3 py-1 bg-surface-elevated rounded text-xs font-mono text-muted"
        >
          {currentLanguage.short}
        </div>
        <ChevronRightIcon
          size={16}
          class="text-muted transition-transform {showLanguageSelector
            ? 'rotate-90'
            : ''}"
        />
      </div>
    </button>

    <!-- Language Selector (Expandable) -->
    {#if showLanguageSelector}
      <div class="bg-muted/30 border-t border-border">
        {#each languages as lang}
          <button
            onclick={() => selectLanguage(lang.code)}
            class="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors border-b border-border last:border-b-0"
          >
            <span
              class="font-medium {currentLocale === lang.code
                ? 'text-primary'
                : 'text-foreground'}">{lang.name}</span
            >
            {#if currentLocale === lang.code}
              <CheckIcon size={18} class="text-primary" />
            {/if}
          </button>
        {/each}
      </div>
    {/if}

    <!-- Currency Setting -->
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

  <p class="text-xs text-muted text-center">
    Perubahan bahasa akan dimuat ulang setelah dipilih.
  </p>

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
