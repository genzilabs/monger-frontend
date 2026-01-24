<script lang="ts">
  import { Button, ResponsiveModal } from "$lib/components/ui";
  import { exportBook, downloadBlob } from "$lib/api/dataTransfer";
  import type { ExportFormat } from "$lib/types/dataTransfer";
  import { Download, FileText, FileSpreadsheet, File } from "lucide-svelte";

  interface Props {
    open: boolean;
    bookId: string;
    bookName: string;
    onClose: () => void;
  }

  let { open, bookId, bookName, onClose }: Props = $props();

  // Form state
  let selectedFormat: ExportFormat = $state("csv");
  let dateRange = $state<"all" | "this_month" | "last_month" | "custom">("all");
  let customStartDate = $state("");
  let customEndDate = $state("");
  let isExporting = $state(false);
  let errorMessage = $state("");

  // Format options
  const formatOptions = [
    {
      value: "csv" as ExportFormat,
      label: "CSV",
      description: "Spreadsheet format, dapat dibuka di Excel/Google Sheets",
      icon: FileSpreadsheet,
      available: true
    },
    {
      value: "pdf" as ExportFormat,
      label: "PDF",
      description: "Laporan dalam format dokumen",
      icon: FileText,
      available: false // Not yet implemented
    },
    {
      value: "xlsx" as ExportFormat,
      label: "Excel",
      description: "Format Microsoft Excel",
      icon: File,
      available: false // Not yet implemented
    }
  ];

  // Date range options
  const dateRangeOptions = [
    { value: "all", label: "Semua Transaksi" },
    { value: "this_month", label: "Bulan Ini" },
    { value: "last_month", label: "Bulan Lalu" },
    { value: "custom", label: "Pilih Tanggal" }
  ];

  function getDateParams(): { startDate?: string; endDate?: string } {
    const now = new Date();

    switch (dateRange) {
      case "this_month": {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: start.toISOString().split("T")[0],
          endDate: now.toISOString().split("T")[0]
        };
      }
      case "last_month": {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0]
        };
      }
      case "custom":
        return {
          startDate: customStartDate || undefined,
          endDate: customEndDate || undefined
        };
      default:
        return {};
    }
  }

  async function handleExport() {
    const formatOption = formatOptions.find((f) => f.value === selectedFormat);
    if (!formatOption?.available) {
      errorMessage = "Format ini belum tersedia";
      return;
    }

    isExporting = true;
    errorMessage = "";

    const dateParams = getDateParams();

    const result = await exportBook(bookId, {
      format: selectedFormat,
      ...dateParams
    });

    if (result.error) {
      errorMessage = result.error.error || "Gagal mengekspor data";
      isExporting = false;
      return;
    }

    if (result.data) {
      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const safeName = bookName.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `monger_${safeName}_${timestamp}.${selectedFormat}`;

      downloadBlob(result.data, filename);
      onClose();
    }

    isExporting = false;
  }

  function handleClose() {
    selectedFormat = "csv";
    dateRange = "all";
    customStartDate = "";
    customEndDate = "";
    errorMessage = "";
    onClose();
  }
</script>

<ResponsiveModal {open} onClose={handleClose} title="Ekspor Data">
  <div class="space-y-6">
    <!-- Format Selection -->
    <div>
      <label class="block text-sm font-medium text-secondary mb-3">
        Format File
      </label>
      <div class="grid grid-cols-3 gap-3">
        {#each formatOptions as option}
          <button
            type="button"
            class="relative p-4 rounded-xl border-2 transition-all text-left {selectedFormat ===
            option.value
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'} {!option.available
              ? 'opacity-50 cursor-not-allowed'
              : ''}"
            onclick={() => option.available && (selectedFormat = option.value)}
            disabled={!option.available}
          >
            <div class="flex items-center gap-2 mb-1">
              <option.icon class="w-5 h-5 text-primary" />
              <span class="font-medium text-foreground">{option.label}</span>
            </div>
            <p class="text-xs text-muted">{option.description}</p>
            {#if !option.available}
              <span
                class="absolute top-2 right-2 text-xs bg-warning/20 text-warning px-1.5 py-0.5 rounded"
              >
                Soon
              </span>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Date Range -->
    <div>
      <label class="block text-sm font-medium text-secondary mb-3">
        Rentang Waktu
      </label>
      <div class="grid grid-cols-2 gap-2">
        {#each dateRangeOptions as option}
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl border transition-all {dateRange ===
            option.value
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border text-foreground hover:border-primary/50'}"
            onclick={() => (dateRange = option.value as typeof dateRange)}
          >
            {option.label}
          </button>
        {/each}
      </div>

      {#if dateRange === "custom"}
        <div class="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label
              for="start-date"
              class="block text-xs text-muted mb-1.5"
            >
              Dari Tanggal
            </label>
            <input
              id="start-date"
              type="date"
              bind:value={customStartDate}
              class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label
              for="end-date"
              class="block text-xs text-muted mb-1.5"
            >
              Sampai Tanggal
            </label>
            <input
              id="end-date"
              type="date"
              bind:value={customEndDate}
              class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      {/if}
    </div>

    <!-- Error Message -->
    {#if errorMessage}
      <div
        class="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm"
      >
        {errorMessage}
      </div>
    {/if}
  </div>

  <div class="flex gap-3 mt-6">
    <Button variant="secondary" fullWidth onclick={handleClose}>Batal</Button>
    <Button
      variant="primary"
      fullWidth
      loading={isExporting}
      onclick={handleExport}
    >
      <Download class="w-4 h-4 mr-2" />
      Ekspor
    </Button>
  </div>
</ResponsiveModal>
