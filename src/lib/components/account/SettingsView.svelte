<script lang="ts">
  import { browser } from "$app/environment";
  import { Card, Button, NativeSelect } from "$lib/components/ui";
  import { CheckIcon, ChevronRightIcon, CalendarIcon } from "$lib/icons";
  import {
    transactionSettingsStore,
    type WeekendHandling,
    type WeeklyStartDay,
  } from "$lib/stores/transactionSettings.svelte";

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
      window.location.reload();
    }
  }

  const currentLanguage = $derived(
    languages.find((l) => l.code === currentLocale) || languages[0],
  );

  import { ExportModal, ImportWizard } from "$lib/components/modals";
  import { booksStore, toastStore, authStore } from "$lib/stores";
  import { booksApi } from "$lib/api";
  import { Download, Upload, FileDown, MessageCircle, Copy, Unlink, RefreshCw } from "lucide-svelte";
  import { downloadImportTemplate, downloadBlob } from "$lib/api/dataTransfer";
  import { authApi, type TelegramLinkStatus } from "$lib/api/auth";

  // Modal states
  let showExportModal = $state(false);
  let showImportWizard = $state(false);
  let selectedBookId = $state<string | null>(null);
  let isDownloadingTemplate = $state(false);

  // Month start day state
  let selectedMonthStartDay = $state<string>(
    String(booksStore.activeBook?.month_start_day ?? 1),
  );
  let isSavingMonthStartDay = $state(false);

  // Sync selectedMonthStartDay with activeBook
  $effect(() => {
    if (booksStore.activeBook) {
      selectedMonthStartDay = String(booksStore.activeBook.month_start_day);
    }
  });

  async function handleMonthStartDayChange(day: string) {
    if (!booksStore.activeBook || isSavingMonthStartDay) return;

    isSavingMonthStartDay = true;
    const dayNum = Number(day);
    const result = await booksApi.setMonthStartDay(
      booksStore.activeBook.id,
      dayNum,
      booksStore.activeBook.version,
    );

    if (result.data) {
      booksStore.activeBook.month_start_day = result.data.month_start_day;
      booksStore.activeBook.version = result.data.version;
      toastStore.success("Tanggal awal periode berhasil diubah");
    } else {
      // Revert on error
      selectedMonthStartDay = String(booksStore.activeBook.month_start_day);
      toastStore.error(result.error?.error || "Gagal mengubah pengaturan");
    }
    isSavingMonthStartDay = false;
  }

  // Get selected book
  const selectedBook = $derived(
    booksStore.books.find((b) => b.id === selectedBookId),
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

  // Check if selected day is weekend
  const isSelectedDayWeekend = $derived(
    transactionSettingsStore.isWeekend(
      transactionSettingsStore.monthlyResetDay,
    ),
  );

  // Weekend handling options
  const weekendOptions: { value: WeekendHandling; label: string }[] = [
    { value: "none", label: "Tetap di tanggal tersebut" },
    { value: "prev_friday", label: "Pindah ke Jumat sebelumnya" },
    { value: "next_monday", label: "Pindah ke Senin berikutnya" },
  ];

  // Weekly start day options
  const weeklyStartOptions: { value: WeeklyStartDay; label: string }[] = [
    { value: "monday", label: "Senin" },
    { value: "sunday", label: "Minggu" },
  ];

  // Telegram linking state
  let telegramStatus = $state<TelegramLinkStatus | null>(null);
  let telegramCode = $state<string | null>(null);
  let telegramCodeExpires = $state<Date | null>(null);
  let isLoadingTelegram = $state(false);
  let isGeneratingCode = $state(false);
  let isUnlinking = $state(false);
  let isUpdatingTelegramSettings = $state(false);
  let selectedTelegramBookId = $state<string | null>(null);
  let selectedTelegramPocketId = $state<string | null>(null);

  // Fetch Telegram link status on mount
  $effect(() => {
    if (browser && authStore.isAuthenticated) {
      fetchTelegramStatus();
    }
  });

  async function fetchTelegramStatus() {
    isLoadingTelegram = true;
    const result = await authApi.getTelegramStatus();
    if (result.data) {
      telegramStatus = result.data;
      selectedTelegramBookId = result.data.default_book_id;
      selectedTelegramPocketId = result.data.default_pocket_id;
    }
    isLoadingTelegram = false;
  }

  async function generateTelegramCode() {
    isGeneratingCode = true;
    const result = await authApi.generateTelegramCode();
    if (result.data) {
      telegramCode = result.data.code;
      telegramCodeExpires = new Date(result.data.expires_at);
      toastStore.success('Kode berhasil dibuat!');
    } else {
      toastStore.error(result.error?.error || 'Gagal membuat kode');
    }
    isGeneratingCode = false;
  }

  async function unlinkTelegram() {
    isUnlinking = true;
    const result = await authApi.unlinkTelegram();
    if (result.data) {
      telegramStatus = { linked: false, platform: 'telegram', chat_id: null, linked_at: null, default_book_id: null, default_book_name: null, default_pocket_id: null, default_pocket_name: null };
      telegramCode = null;
      selectedTelegramBookId = null;
      selectedTelegramPocketId = null;
      toastStore.success('Telegram berhasil diputus');
    } else {
      toastStore.error(result.error?.error || 'Gagal memutus Telegram');
    }
    isUnlinking = false;
  }

  async function updateTelegramDefaults() {
    if (!selectedTelegramBookId) return;
    isUpdatingTelegramSettings = true;
    const result = await authApi.updateTelegramSettings({
      default_book_id: selectedTelegramBookId,
      default_pocket_id: selectedTelegramPocketId || undefined,
    });
    if (result.data) {
      toastStore.success('Pengaturan Telegram disimpan');
      fetchTelegramStatus();
    } else {
      toastStore.error(result.error?.error || 'Gagal menyimpan pengaturan');
    }
    isUpdatingTelegramSettings = false;
  }

  // Get pockets for selected Telegram book
  const telegramPockets = $derived(
    selectedTelegramBookId
      ? booksStore.pockets.filter((p) => p.book_id === selectedTelegramBookId)
      : []
  );

  function copyCode() {
    if (telegramCode) {
      navigator.clipboard.writeText(telegramCode);
      toastStore.success('Kode disalin!');
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

  <!-- Transaction Display Settings -->
  <div class="space-y-3">
    <h3 class="text-lg font-semibold text-foreground">Tampilan Transaksi</h3>

    <Card class="p-4 space-y-5">
      <!-- Monthly Start Date -->
      <div>
        <div class="flex items-center gap-2 mb-2">
          <CalendarIcon size={16} class="text-primary" />
          <label for="reset-day" class="font-medium text-foreground">
            Tanggal Awal Periode Bulanan
          </label>
        </div>
        <p class="text-xs text-secondary mb-3">
          Transaksi akan dikelompokkan berdasarkan periode ini. Contoh: tanggal
          25 berarti periode 25 Jan - 24 Feb dihitung sebagai 1 bulan.
        </p>
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <NativeSelect
              name="reset-day"
              bind:value={selectedMonthStartDay}
              disabled={!booksStore.activeBook || isSavingMonthStartDay}
              placeholder="Pilih tanggal"
              wrapperClass="w-full"
              onchange={(e) =>
                handleMonthStartDayChange(
                  (e.target as HTMLSelectElement).value,
                )}
            >
              {#each Array.from({ length: 28 }, (_, i) => i + 1) as day}
                <option value={String(day)}>{day}</option>
              {/each}
            </NativeSelect>
          </div>
          <span class="text-sm text-muted shrink-0">setiap bulan</span>
        </div>
      </div>

      <!-- Weekend Handling (conditional) -->
      {#if isSelectedDayWeekend}
        <div class="border-t border-border pt-4">
          <p class="text-sm text-foreground mb-2">
            Tanggal {transactionSettingsStore.monthlyResetDay} jatuh di akhir pekan
          </p>
          <p class="text-xs text-secondary mb-3">
            Bagaimana bila tanggal tersebut jatuh di hari Sabtu atau Minggu?
          </p>
          <div class="space-y-2">
            {#each weekendOptions as option}
              <button
                onclick={() =>
                  transactionSettingsStore.setWeekendHandling(option.value)}
                class="w-full flex items-center justify-between p-3 rounded-xl border transition-colors {transactionSettingsStore.weekendHandling ===
                option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-surface-elevated'}"
              >
                <span
                  class="text-sm {transactionSettingsStore.weekendHandling ===
                  option.value
                    ? 'text-foreground font-medium'
                    : 'text-secondary'}">{option.label}</span
                >
                {#if transactionSettingsStore.weekendHandling === option.value}
                  <CheckIcon size={16} class="text-primary" />
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Divider -->
      <div class="border-t border-border"></div>

      <!-- Weekly Start Day -->
      <div>
        <label class="font-medium text-foreground mb-2 block">
          Hari Pertama Minggu
        </label>
        <p class="text-xs text-secondary mb-3">
          Menentukan kapan minggu baru dimulai untuk ringkasan mingguan.
        </p>
        <div class="flex gap-2">
          {#each weeklyStartOptions as option}
            <button
              onclick={() =>
                transactionSettingsStore.setWeeklyStartDay(option.value)}
              class="flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors {transactionSettingsStore.weeklyStartDay ===
              option.value
                ? 'border-primary bg-primary text-white'
                : 'border-border text-secondary hover:bg-surface-elevated hover:text-foreground'}"
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>
    </Card>
  </div>

  <!-- Data Management Section -->
  <div class="space-y-3">
    <h3 class="text-lg font-semibold text-foreground">Kelola Data</h3>

    <Card class="p-4 space-y-4">
      <!-- Book Selector -->
      <div>
        <label
          for="book-select"
          class="block text-sm font-medium text-secondary mb-2"
        >
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
        Ekspor transaksi ke CSV untuk backup atau analisis. Impor transaksi dari
        file CSV menggunakan template yang disediakan.
      </p>
    </Card>
  </div>

  <!-- Connect Telegram Section -->
  <div class="space-y-3">
    <h3 class="text-lg font-semibold text-foreground">Hubungkan Telegram</h3>

    <Card class="p-4 space-y-4">
      {#if isLoadingTelegram}
        <div class="flex items-center justify-center py-4">
          <RefreshCw class="w-5 h-5 text-muted animate-spin" />
        </div>
      {:else if telegramStatus?.linked}
        <!-- Telegram Connected -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-[#0088cc]/10 rounded-xl flex items-center justify-center">
            <MessageCircle class="w-5 h-5 text-[#0088cc]" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-foreground">Telegram Terhubung</p>
            <p class="text-xs text-secondary">Chat ID: {telegramStatus.chat_id}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onclick={unlinkTelegram}
            loading={isUnlinking}
          >
            {#snippet icon()}
              <Unlink size={16} />
            {/snippet}
            Putus
          </Button>
        </div>
        <p class="text-xs text-muted mb-4">
          Kamu bisa mengirim foto struk atau ketik langsung seperti "Makan 50k" ke bot Telegram.
        </p>

        <!-- Default Book/Pocket Settings -->
        <div class="border-t border-border pt-4 space-y-3">
          <p class="text-sm font-medium text-foreground">Pengaturan Default</p>
          
          <div class="space-y-2">
            <label class="text-xs text-secondary">Buku Default</label>
            <select
              class="w-full p-2.5 rounded-lg bg-surface-elevated border border-border text-foreground text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              bind:value={selectedTelegramBookId}
              onchange={() => { selectedTelegramPocketId = null; if (selectedTelegramBookId) booksStore.loadPockets(selectedTelegramBookId); }}
            >
              <option value={null}>Pilih buku...</option>
              {#each booksStore.books as book}
                <option value={book.id}>{book.name}</option>
              {/each}
            </select>
          </div>

          {#if selectedTelegramBookId && telegramPockets.length > 0}
            <div class="space-y-2">
              <label class="text-xs text-secondary">Pocket Default</label>
              <select
                class="w-full p-2.5 rounded-lg bg-surface-elevated border border-border text-foreground text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                bind:value={selectedTelegramPocketId}
              >
                <option value={null}>Semua pocket (auto-detect)</option>
                {#each telegramPockets as pocket}
                  <option value={pocket.id}>{pocket.name}</option>
                {/each}
              </select>
            </div>
          {/if}

          <Button
            variant="primary"
            size="sm"
            fullWidth
            onclick={updateTelegramDefaults}
            loading={isUpdatingTelegramSettings}
            disabled={!selectedTelegramBookId}
          >
            Simpan Pengaturan
          </Button>
        </div>
      {:else}
        <!-- Telegram Not Connected -->
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-muted/30 rounded-xl flex items-center justify-center">
            <MessageCircle class="w-5 h-5 text-muted" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-foreground">Telegram Belum Terhubung</p>
            <p class="text-xs text-secondary">Hubungkan untuk log transaksi via chat</p>
          </div>
        </div>

        {#if telegramCode}
          <!-- Code Display -->
          <div class="bg-surface-elevated border border-border rounded-xl p-4 text-center">
            <p class="text-xs text-secondary mb-2">Kode Verifikasi (berlaku 5 menit)</p>
            <div class="flex items-center justify-center gap-3">
              <span class="text-3xl font-mono font-bold text-foreground tracking-widest">
                {telegramCode}
              </span>
              <button
                onclick={copyCode}
                class="p-2 hover:bg-muted/30 rounded-lg transition-colors"
                title="Salin kode"
              >
                <Copy class="w-5 h-5 text-muted" />
              </button>
            </div>
            <p class="text-xs text-muted mt-3">
              Kirim <code class="bg-muted/30 px-1 rounded">/link {telegramCode}</code> ke bot
            </p>
          </div>
          <Button
            variant="outline"
            fullWidth
            onclick={generateTelegramCode}
            loading={isGeneratingCode}
          >
            {#snippet icon()}
              <RefreshCw size={18} />
            {/snippet}
            Buat Kode Baru
          </Button>
        {:else}
          <Button
            variant="primary"
            fullWidth
            onclick={generateTelegramCode}
            loading={isGeneratingCode}
          >
            {#snippet icon()}
              <MessageCircle size={18} />
            {/snippet}
            Hubungkan Telegram
          </Button>
        {/if}

        <p class="text-xs text-muted">
          Cari <strong>@MongerBot</strong> di Telegram, lalu kirim kode verifikasi dengan perintah /link.
        </p>
      {/if}
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
