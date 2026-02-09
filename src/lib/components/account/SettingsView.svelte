<script lang="ts">
  import { browser } from "$app/environment";
  import { NativeSelect, Select } from "$lib/components/ui";
  import {
    CheckIcon,
    ChevronRightIcon,
    CalendarIcon,
    GlobeIcon,
    BankIcon,
    CreditCardIcon,
    LogOutIcon,
    SmartphoneIcon,
    MessageIcon,
    RepeatIcon,
  } from "$lib/icons";
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
  import {
    Download,
    Upload,
    FileDown,
    MessageCircle,
    RefreshCw,
    Unlink,
    Copy,
  } from "lucide-svelte";
  import { downloadImportTemplate, downloadBlob } from "$lib/api/dataTransfer";
  import { authApi, type TelegramLinkStatus } from "$lib/api/auth";
  import { goto } from "$app/navigation";

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
      toastStore.success("Kode berhasil dibuat!");
    } else {
      toastStore.error(result.error?.error || "Gagal membuat kode");
    }
    isGeneratingCode = false;
  }

  async function unlinkTelegram() {
    isUnlinking = true;
    const result = await authApi.unlinkTelegram();
    if (result.data) {
      telegramStatus = {
        linked: false,
        platform: "telegram",
        chat_id: null,
        linked_at: null,
        default_book_id: null,
        default_book_name: null,
        default_pocket_id: null,
        default_pocket_name: null,
      };
      telegramCode = null;
      selectedTelegramBookId = null;
      selectedTelegramPocketId = null;
      toastStore.success("Telegram berhasil diputus");
    } else {
      toastStore.error(result.error?.error || "Gagal memutus Telegram");
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
      toastStore.success("Pengaturan Telegram disimpan");
      fetchTelegramStatus();
    } else {
      toastStore.error(result.error?.error || "Gagal menyimpan pengaturan");
    }
    isUpdatingTelegramSettings = false;
  }

  // Get pockets for selected Telegram book
  const telegramPockets = $derived(
    selectedTelegramBookId
      ? booksStore.pockets.filter((p) => p.book_id === selectedTelegramBookId)
      : [],
  );

  function copyCode() {
    if (telegramCode) {
      navigator.clipboard.writeText(telegramCode);
      toastStore.success("Kode disalin!");
    }
  }
</script>

<div class="space-y-6 animate-fade-in pb-12">
  <div class="flex items-center gap-3 px-1">
    <h2 class="text-xl font-bold text-foreground">Pengaturan</h2>
  </div>

  <!-- Preferensi Umum -->
  <div class="space-y-2">
    <h3 class="text-xs font-semibold text-muted uppercase tracking-wider px-1">
      Preferensi Umum
    </h3>
    <div
      class="bg-surface rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-sm"
    >
      <!-- Bahasa -->
      <button
        onclick={() => (showLanguageSelector = !showLanguageSelector)}
        class="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"
          >
            <GlobeIcon size={18} />
          </div>
          <span class="text-sm font-medium text-foreground">Bahasa</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted">{currentLanguage.name}</span>
          <ChevronRightIcon
            size={16}
            class="text-muted/50 transition-transform {showLanguageSelector
              ? 'rotate-90'
              : ''}"
          />
        </div>
      </button>

      {#if showLanguageSelector}
        <div class="bg-muted/10 border-t border-border">
          {#each languages as lang}
            <button
              onclick={() => selectLanguage(lang.code)}
              class="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors border-b border-border/50 last:border-b-0 pl-14"
            >
              <span
                class="text-sm {currentLocale === lang.code
                  ? 'text-primary font-medium'
                  : 'text-foreground'}"
              >
                {lang.name}
              </span>
              {#if currentLocale === lang.code}
                <CheckIcon size={16} class="text-primary" />
              {/if}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Mata Uang -->
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"
          >
            <BankIcon size={18} />
          </div>
          <span class="text-sm font-medium text-foreground">Mata Uang</span>
        </div>
        <span class="text-sm text-muted">IDR (Rupiah)</span>
      </div>
    </div>
  </div>

  <!-- Tampilan Transaksi -->
  <div class="space-y-2">
    <h3 class="text-xs font-semibold text-muted uppercase tracking-wider px-1">
      Tampilan Transaksi
    </h3>
    <div
      class="bg-surface rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-sm"
    >
      <!-- Awal Periode Bulanan -->
      <div class="p-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"
          >
            <CalendarIcon size={18} />
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">
              Awal Periode Bulanan
            </p>
            <p class="text-[10px] text-muted-foreground mt-0.5">
              Tanggal mulai reset budget
            </p>
          </div>
        </div>
        <div class="w-20">
          <Select
            items={Array.from({ length: 28 }, (_, i) => ({
              value: String(i + 1),
              label: String(i + 1),
            }))}
            value={selectedMonthStartDay}
            disabled={!booksStore.activeBook || isSavingMonthStartDay}
            onSelect={(item) => handleMonthStartDayChange(item.value)}
            triggerClass="w-full"
          />
        </div>
      </div>

      <!-- Awal Minggu -->
      <div class="p-4 flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"
          >
            <RepeatIcon size={18} />
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">Awal Minggu</p>
            <p class="text-[10px] text-muted-foreground mt-0.5">
              Hari pertama dalam ringkasan mingguan
            </p>
          </div>
        </div>
        <div class="flex gap-2 pl-11">
          {#each weeklyStartOptions as option}
            <button
              onclick={() =>
                transactionSettingsStore.setWeeklyStartDay(option.value)}
              class="flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors {transactionSettingsStore.weeklyStartDay ===
              option.value
                ? 'border-primary bg-primary text-white'
                : 'border-border text-secondary hover:bg-muted/50'}"
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Kelola Data -->
  <div class="space-y-2">
    <h3 class="text-xs font-semibold text-muted uppercase tracking-wider px-1">
      Kelola Data
    </h3>
    <div
      class="bg-surface rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-sm p-4 space-y-4"
    >
      <div>
        <label
          for="d-book-select"
          class="text-xs font-medium text-secondary mb-2 block"
          >Pilih Buku</label
        >
        <Select
          items={booksStore.books.map((b) => ({
            value: b.id,
            label: b.name,
          }))}
          value={selectedBookId || undefined}
          placeholder="Pilih buku..."
          onSelect={(item) => (selectedBookId = item.value)}
          triggerClass="w-full bg-surface-elevated"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          aria-label="Export data"
          onclick={() => selectedBookId && (showExportModal = true)}
          disabled={!selectedBookId}
          class="flex items-center justify-center gap-2 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <Download size={16} />
          <span>Ekspor</span>
        </button>
        <button
          aria-label="Import data"
          onclick={() => selectedBookId && (showImportWizard = true)}
          disabled={!selectedBookId}
          class="flex items-center justify-center gap-2 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <Upload size={16} />
          <span>Impor</span>
        </button>
        <button
          aria-label="Download template"
          onclick={handleDownloadTemplate}
          disabled={!selectedBookId || isDownloadingTemplate}
          class="flex items-center justify-center gap-2 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <FileDown size={16} />
          <span>Template</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Telegram Integration -->
  <div class="space-y-2">
    <h3 class="text-xs font-semibold text-muted uppercase tracking-wider px-1">
      Integrasi Telegram
    </h3>
    <div
      class="bg-surface rounded-2xl border border-border overflow-hidden p-4 shadow-sm"
    >
      {#if isLoadingTelegram}
        <div class="flex justify-center py-4">
          <RefreshCw class="animate-spin text-muted" />
        </div>
      {:else if telegramStatus?.linked}
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600"
          >
            <MessageCircle class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-foreground">Terhubung</p>
            <p class="text-xs text-secondary">
              Chat ID: {telegramStatus.chat_id}
            </p>
          </div>
          <button
            onclick={unlinkTelegram}
            disabled={isUnlinking}
            class="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
          >
            Putus
          </button>
        </div>

        <div class="space-y-3 pt-3 border-t border-border">
          <div class="space-y-1">
            <label
              for="telegram-book-select"
              class="text-xs text-secondary block">Buku Default</label
            >
            <select
              id="telegram-book-select"
              class="w-full p-2 rounded-lg bg-surface-elevated border border-border text-sm"
              bind:value={selectedTelegramBookId}
              onchange={() => {
                selectedTelegramPocketId = null;
                if (selectedTelegramBookId)
                  booksStore.loadPockets(selectedTelegramBookId);
              }}
            >
              <option value={null}>Pilih buku...</option>
              {#each booksStore.books as book}
                <option value={book.id}>{book.name}</option>
              {/each}
            </select>
          </div>

          {#if selectedTelegramBookId && telegramPockets.length > 0}
            <div class="space-y-1">
              <label for="telegram-pocket-select" class="text-xs text-secondary"
                >Pocket Default</label
              >
              <select
                id="telegram-pocket-select"
                class="w-full p-2 rounded-lg bg-surface-elevated border border-border text-sm"
                bind:value={selectedTelegramPocketId}
              >
                <option value={null}>Semua pocket (auto-detect)</option>
                {#each telegramPockets as pocket}
                  <option value={pocket.id}>{pocket.name}</option>
                {/each}
              </select>
            </div>
          {/if}

          <button
            onclick={updateTelegramDefaults}
            disabled={isUpdatingTelegramSettings || !selectedTelegramBookId}
            class="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isUpdatingTelegramSettings ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      {:else}
        <div class="text-center space-y-4">
          <div class="flex justify-center">
            <div
              class="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center"
            >
              <MessageCircle class="w-6 h-6 text-muted" />
            </div>
          </div>
          <div>
            <p class="font-medium text-foreground">Hubungkan Telegram</p>
            <p class="text-xs text-muted-foreground mt-1">
              Catat transaksi langsung dari chat Telegram.
            </p>
          </div>

          {#if telegramCode}
            <div
              class="bg-surface-elevated p-3 rounded-xl border border-border"
            >
              <div class="flex items-center justify-center gap-3 mb-2">
                <code class="text-xl font-bold tracking-widest"
                  >{telegramCode}</code
                >
                <button
                  onclick={copyCode}
                  class="p-1.5 hover:bg-muted/20 rounded-md"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p class="text-[10px] text-muted">
                Kirim <code>/link {telegramCode}</code> ke bot
              </p>
            </div>
          {:else}
            <button
              onclick={generateTelegramCode}
              disabled={isGeneratingCode}
              class="w-full py-2.5 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              Buat Kode Penghubung
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Logout Section (Moved Here) -->
  <div class="pt-8 flex flex-col items-center gap-6">
    <button
      onclick={async () => {
        if (
          !confirm(
            "Apakah Anda yakin ingin keluar? Pastikan data Anda sudah tersimpan.",
          )
        )
          return;
        await authStore.logout();
        goto("/auth", { replaceState: true });
      }}
      class="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-red-100 text-red-500 font-medium hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      <LogOutIcon size={18} />
      <span>Keluar dari Akun</span>
    </button>
    <p class="text-[10px] text-muted-foreground tracking-widest opacity-50">
      Monger v2.0 • Genzi Meraih Mimpi
    </p>
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
