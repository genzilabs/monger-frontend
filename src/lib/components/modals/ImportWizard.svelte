<script lang="ts">
  import { Button, ResponsiveModal } from "$lib/components/ui";
  import {
    validateImport,
    executeImport,
    downloadImportTemplate,
    downloadBlob
  } from "$lib/api/dataTransfer";
  import type {
    ImportValidationResponse,
    ImportError,
    ImportConflict,
    ConflictResolution,
    ImportOptions
  } from "$lib/types/dataTransfer";
  import {
    Upload,
    Download,
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    ChevronRight,
    ChevronLeft,
    FileSpreadsheet
  } from "lucide-svelte";

  interface Props {
    open: boolean;
    bookId: string;
    bookName: string;
    onClose: () => void;
    onImported?: () => void;
  }

  let { open, bookId, bookName, onClose, onImported }: Props = $props();

  // Wizard state
  let currentStep = $state(1);
  const totalSteps = 4;

  // Step 1: File upload
  let selectedFile: File | null = $state(null);
  let isDragging = $state(false);

  // Step 2: Options
  let options: ImportOptions = $state({
    skipDuplicates: false,
    createCategories: false,
    createPockets: false
  });

  // Step 3 & 4: Validation results
  let validationResult: ImportValidationResponse | null = $state(null);
  let resolutions: ConflictResolution[] = $state([]);

  // UI state
  let isValidating = $state(false);
  let isImporting = $state(false);
  let errorMessage = $state("");

  // File drop handlers
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file && file.name.endsWith(".csv")) {
      selectedFile = file;
    }
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      selectedFile = file;
    }
  }

  async function handleDownloadTemplate() {
    const result = await downloadImportTemplate(bookId);
    if (result.data) {
      downloadBlob(result.data, "monger_import_template.csv");
    } else if (result.error) {
      errorMessage = result.error.error || "Gagal mengunduh template";
    }
  }

  async function handleValidate() {
    if (!selectedFile) return;

    isValidating = true;
    errorMessage = "";

    const result = await validateImport(bookId, selectedFile, undefined, options);

    if (result.error) {
      errorMessage = result.error.error || "Validasi gagal";
      isValidating = false;
      return;
    }

    validationResult = result.data || null;

    // Initialize resolutions for conflicts
    if (validationResult?.conflicts?.length) {
      resolutions = validationResult.conflicts.map((conflict) => ({
        conflictId: conflict.id,
        rows: conflict.rows,
        field: conflict.field,
        resolution: "skip" as const
      }));
    }

    // Move to appropriate step
    if (validationResult?.errors?.length) {
      currentStep = 3; // Show errors
    } else if (validationResult?.conflicts?.length) {
      currentStep = 3; // Show conflicts
    } else {
      currentStep = 4; // Ready to import
    }

    isValidating = false;
  }

  async function handleImport() {
    if (!validationResult) return;

    isImporting = true;
    errorMessage = "";

    const result = await executeImport(bookId, {
      jobId: validationResult.jobId,
      conflictResolutions: resolutions
    });

    if (result.error) {
      errorMessage = result.error.error || "Import gagal";
      isImporting = false;
      return;
    }

    onImported?.();
    handleClose();
  }

  function handleClose() {
    currentStep = 1;
    selectedFile = null;
    options = {
      skipDuplicates: false,
      createCategories: false,
      createPockets: false
    };
    validationResult = null;
    resolutions = [];
    errorMessage = "";
    onClose();
  }

  function goNext() {
    if (currentStep < totalSteps) {
      if (currentStep === 2) {
        handleValidate();
      } else {
        currentStep++;
      }
    }
  }

  function goPrev() {
    if (currentStep > 1) currentStep--;
  }

  function getStepTitle(step: number): string {
    switch (step) {
      case 1:
        return "Pilih File";
      case 2:
        return "Pengaturan";
      case 3:
        return "Review";
      case 4:
        return "Konfirmasi";
      default:
        return "";
    }
  }

  // Derived state
  let canProceed = $derived.by(() => {
    switch (currentStep) {
      case 1:
        return selectedFile !== null;
      case 2:
        return true;
      case 3:
        return validationResult && (validationResult.errors?.length || 0) === 0;
      case 4:
        return true;
      default:
        return false;
    }
  });
</script>

<ResponsiveModal {open} onClose={handleClose} title="Impor Transaksi">
  <!-- Progress Steps -->
  <div class="flex items-center justify-between mb-6">
    {#each Array(totalSteps) as _, i}
      <div class="flex items-center">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors {currentStep >
          i + 1
            ? 'bg-success text-white'
            : currentStep === i + 1
              ? 'bg-primary text-white'
              : 'bg-surface-alt text-muted'}"
        >
          {#if currentStep > i + 1}
            <CheckCircle class="w-4 h-4" />
          {:else}
            {i + 1}
          {/if}
        </div>
        {#if i < totalSteps - 1}
          <div
            class="w-8 sm:w-16 h-0.5 mx-1 {currentStep > i + 1
              ? 'bg-success'
              : 'bg-surface-alt'}"
          ></div>
        {/if}
      </div>
    {/each}
  </div>

  <p class="text-sm text-muted mb-4">
    Langkah {currentStep}:
    <span class="font-medium text-foreground">{getStepTitle(currentStep)}</span>
  </p>

  <!-- Step Content -->
  <div class="min-h-[300px]">
    <!-- Step 1: File Upload -->
    {#if currentStep === 1}
      <div class="space-y-4">
        <!-- Dropzone -->
        <div
          class="border-2 border-dashed rounded-xl p-8 text-center transition-colors {isDragging
            ? 'border-primary bg-primary/5'
            : selectedFile
              ? 'border-success bg-success/5'
              : 'border-border hover:border-primary/50'}"
          role="button"
          tabindex="0"
          ondragover={handleDragOver}
          ondragleave={handleDragLeave}
          ondrop={handleDrop}
        >
          {#if selectedFile}
            <FileSpreadsheet class="w-12 h-12 mx-auto mb-3 text-success" />
            <p class="font-medium text-foreground">{selectedFile.name}</p>
            <p class="text-sm text-muted">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
            <button
              type="button"
              class="mt-2 text-sm text-primary hover:underline"
              onclick={() => (selectedFile = null)}
            >
              Ganti file
            </button>
          {:else}
            <Upload class="w-12 h-12 mx-auto mb-3 text-muted" />
            <p class="text-foreground mb-1">
              Seret file CSV ke sini atau
              <label class="text-primary cursor-pointer hover:underline">
                pilih file
                <input
                  type="file"
                  accept=".csv"
                  class="hidden"
                  onchange={handleFileSelect}
                />
              </label>
            </p>
            <p class="text-xs text-muted">Hanya file CSV yang didukung</p>
          {/if}
        </div>

        <!-- Download Template -->
        <button
          type="button"
          class="flex items-center gap-2 text-sm text-primary hover:underline"
          onclick={handleDownloadTemplate}
        >
          <Download class="w-4 h-4" />
          Unduh template CSV
        </button>
      </div>
    {/if}

    <!-- Step 2: Options -->
    {#if currentStep === 2}
      <div class="space-y-4">
        <label class="flex items-center gap-3 p-4 bg-surface rounded-xl cursor-pointer">
          <input
            type="checkbox"
            bind:checked={options.skipDuplicates}
            class="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <p class="font-medium text-foreground">Lewati duplikat</p>
            <p class="text-sm text-muted">
              Otomatis lewati transaksi yang sudah ada
            </p>
          </div>
        </label>

        <label class="flex items-center gap-3 p-4 bg-surface rounded-xl cursor-pointer">
          <input
            type="checkbox"
            bind:checked={options.createCategories}
            class="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <p class="font-medium text-foreground">Buat kategori baru</p>
            <p class="text-sm text-muted">
              Buat kategori otomatis jika tidak ditemukan
            </p>
          </div>
        </label>

        <label class="flex items-center gap-3 p-4 bg-surface rounded-xl cursor-pointer">
          <input
            type="checkbox"
            bind:checked={options.createPockets}
            class="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <p class="font-medium text-foreground">Buat dompet baru</p>
            <p class="text-sm text-muted">
              Buat dompet otomatis jika tidak ditemukan
            </p>
          </div>
        </label>
      </div>
    {/if}

    <!-- Step 3: Review Errors/Conflicts -->
    {#if currentStep === 3}
      <div class="space-y-4">
        {#if validationResult?.errors?.length}
          <div class="p-4 bg-error/10 border border-error/20 rounded-xl">
            <div class="flex items-center gap-2 mb-3">
              <AlertCircle class="w-5 h-5 text-error" />
              <span class="font-medium text-error">
                {validationResult.errors.length} Error Ditemukan
              </span>
            </div>
            <div class="max-h-48 overflow-y-auto space-y-2">
              {#each validationResult.errors.slice(0, 10) as error}
                <div class="text-sm p-2 bg-surface rounded-lg">
                  <span class="text-muted">Baris {error.row}:</span>
                  <span class="text-foreground">{error.message}</span>
                  {#if error.suggestions?.length}
                    <span class="text-primary">
                      → Saran: {error.suggestions.join(", ")}
                    </span>
                  {/if}
                </div>
              {/each}
              {#if (validationResult.errors?.length || 0) > 10}
                <p class="text-xs text-muted text-center">
                  + {validationResult.errors.length - 10} error lainnya
                </p>
              {/if}
            </div>
          </div>
        {:else if validationResult?.conflicts?.length}
          <div class="p-4 bg-warning/10 border border-warning/20 rounded-xl">
            <div class="flex items-center gap-2 mb-3">
              <AlertTriangle class="w-5 h-5 text-warning" />
              <span class="font-medium text-warning">
                {validationResult.conflicts.length} Konflik Perlu Diselesaikan
              </span>
            </div>
            <p class="text-sm text-muted">
              Beberapa data membutuhkan konfirmasi Anda. Lanjutkan untuk menyelesaikan konflik.
            </p>
          </div>
        {:else if validationResult}
          <div class="p-4 bg-success/10 border border-success/20 rounded-xl">
            <div class="flex items-center gap-2">
              <CheckCircle class="w-5 h-5 text-success" />
              <span class="font-medium text-success">
                Validasi berhasil!
              </span>
            </div>
            <p class="text-sm text-muted mt-2">
              {validationResult.validRows} dari {validationResult.totalRows} baris siap diimpor.
            </p>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Step 4: Confirmation -->
    {#if currentStep === 4}
      <div class="text-center py-8">
        <CheckCircle class="w-16 h-16 mx-auto mb-4 text-success" />
        <h3 class="text-lg font-semibold text-foreground mb-2">
          Siap untuk Mengimpor
        </h3>
        <p class="text-muted mb-4">
          {validationResult?.validRows || 0} transaksi akan ditambahkan ke
          <span class="font-medium text-foreground">{bookName}</span>
        </p>
        {#if validationResult?.warnings?.length}
          <div class="inline-flex items-center gap-2 text-sm text-warning">
            <AlertTriangle class="w-4 h-4" />
            {validationResult.warnings.length} peringatan akan diabaikan
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Error Message -->
  {#if errorMessage}
    <div
      class="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm mt-4"
    >
      {errorMessage}
    </div>
  {/if}

  <!-- Navigation -->
  <div class="flex gap-3 mt-6">
    {#if currentStep > 1}
      <Button variant="secondary" onclick={goPrev}>
        <ChevronLeft class="w-4 h-4 mr-1" />
        Kembali
      </Button>
    {:else}
      <Button variant="secondary" onclick={handleClose}>Batal</Button>
    {/if}

    <div class="flex-1"></div>

    {#if currentStep < totalSteps}
      <Button
        variant="primary"
        loading={isValidating}
        disabled={!canProceed}
        onclick={goNext}
      >
        {currentStep === 2 ? "Validasi" : "Lanjut"}
        <ChevronRight class="w-4 h-4 ml-1" />
      </Button>
    {:else}
      <Button
        variant="primary"
        loading={isImporting}
        onclick={handleImport}
      >
        Impor Sekarang
      </Button>
    {/if}
  </div>
</ResponsiveModal>
