<script lang="ts">
  /**
   * ReceiptConfirmModal - Review and confirm scanned receipt data
   * Allows user to edit parsed data before creating transaction
   */
  import { receiptsApi, type ReceiptScan, type ParsedReceiptData } from "$lib/api/receipts";
  import { booksStore } from "$lib/stores/books.svelte";
  import { categoriesStore } from "$lib/stores/categories.svelte";
  import { transactionsStore } from "$lib/stores/transactions.svelte";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { formatCurrency } from "$lib/utils/currency";
  import { 
    ResponsiveModal, 
    Button, 
    MoneyInput, 
    Combobox,
    type ComboboxOption 
  } from "$lib/components/ui";
  import { Receipt, Store, Calendar, Tag, Loader2, Sparkles, AlertCircle } from "lucide-svelte";

  interface Props {
    open: boolean;
    onClose: () => void;
    receiptScan: ReceiptScan | null;
  }

  let { open, onClose, receiptScan }: Props = $props();

  // Form state - populated from parsed data
  let name = $state("");
  let amount = $state("");
  let pocketId = $state("");
  let categoryId = $state("");
  let subcategoryId = $state("");
  let date = $state("");
  let description = $state("");
  let type: "income" | "expense" = $state("expense");
  
  let isSubmitting = $state(false);

  // Derived states
  const pockets = $derived(booksStore.pockets);
  const categories = $derived(categoriesStore.categories);
  const isLoadingCategories = $derived(categoriesStore.isLoading);

  const filteredCategories = $derived(
    categories.filter((c) => c.type === type)
  );

  const categoryOptions = $derived<ComboboxOption[]>(
    filteredCategories.map((c) => ({
      value: c.id,
      label: c.name,
      icon: c.icon,
    }))
  );

  const pocketOptions = $derived<ComboboxOption[]>(
    pockets.map((p) => ({
      value: p.id,
      label: p.name,
      icon: p.icon_slug || "💰",
    }))
  );

  const selectedCategory = $derived(
    categories.find((c) => c.id === categoryId)
  );

  const subcategories = $derived(selectedCategory?.subcategories || []);

  const subcategoryOptions = $derived<ComboboxOption[]>(
    subcategories.map((s) => ({
      value: s.id,
      label: s.name,
      icon: selectedCategory?.icon || "📁",
    }))
  );

  // Parsed data from receipt
  const parsedData = $derived(receiptScan?.parsed_data);
  const confidence = $derived(parsedData?.confidence ?? 0);
  const confidencePercent = $derived(Math.round(confidence * 100));

  // Populate form from parsed data
  $effect(() => {
    if (open && receiptScan?.parsed_data) {
      const data = receiptScan.parsed_data;
      
      // Set name: AI description → merchant name (fallback)
      name = data.description || data.merchant_name || "";
      
      // Set amount (convert cents to display value)
      const amountValue = data.total_cents / 100;
      amount = amountValue.toString();
      
      // Set description (notes): formatted items + merchant
      if (data.items && data.items.length > 0) {
        const itemsList = data.items
          .map(item => `${item.quantity}x ${item.name} - ${formatItemPrice(item.price_cents, data.currency)}`)
          .join("\n");
        description = `${data.merchant_name}\n\n${itemsList}`;
      } else {
        description = data.merchant_name || "";
      }
      
      // Set date
      if (data.date) {
        const parsedDate = new Date(data.date);
        parsedDate.setMinutes(parsedDate.getMinutes() - parsedDate.getTimezoneOffset());
        date = parsedDate.toISOString().slice(0, 16);
      } else {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        date = now.toISOString().slice(0, 16);
      }
      
      // Set default pocket
      if (pockets.length > 0 && !pocketId) {
        pocketId = pockets[0].id;
      }
      
      // Try to match category from suggestion
      if (data.suggested_category && categories.length > 0) {
        const suggestedLower = data.suggested_category.toLowerCase();
        const matchedCategory = categories.find(
          (c) => c.name.toLowerCase().includes(suggestedLower) || 
                 suggestedLower.includes(c.name.toLowerCase())
        );
        if (matchedCategory) {
          categoryId = matchedCategory.id;
          type = matchedCategory.type;
        }
      }
      
      // Load categories for active book
      if (booksStore.activeBook?.id) {
        categoriesStore.load(booksStore.activeBook.id);
      }
    }
  });

  // Reset form when closed
  $effect(() => {
    if (!open) {
      name = "";
      amount = "";
      pocketId = "";
      categoryId = "";
      subcategoryId = "";
      description = "";
      type = "expense";
    }
  });

  async function handleSubmit() {
    if (!name || !amount || !pocketId || !receiptScan) {
      toastStore.error("Please fill in all required fields");
      return;
    }

    isSubmitting = true;

    try {
      const amountCents = Math.round(parseFloat(amount) * 100);
      const isoDate = date ? new Date(date).toISOString() : new Date().toISOString();

      const result = await receiptsApi.confirm(receiptScan.id, {
        pocket_id: pocketId,
        name: name,
        amount_cents: amountCents,
        type: type,
        category_id: categoryId || undefined,
        subcategory_id: subcategoryId || undefined,
        date: isoDate,
        description: description || undefined,
      });

      if (result.error) {
        toastStore.error(result.error.error || "Failed to create transaction");
        return;
      }

      toastStore.success("Transaction created from receipt!");
      
      // Refresh data
      if (booksStore.activeBook) {
        await booksStore.loadPockets(booksStore.activeBook.id);
      }
      await transactionsStore.refresh();
      
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      toastStore.error("Failed to create transaction");
    } finally {
      isSubmitting = false;
    }
  }

  function formatItemPrice(cents: number, currency: string = "IDR") {
    return formatCurrency(cents / 100, currency);
  }
</script>

<ResponsiveModal {open} {onClose} title="Transaksi dari Struk">
  <div class="space-y-4">
    <!-- AI Confidence Badge -->
    {#if parsedData}
      <div class="flex items-center gap-2 p-3 bg-surface rounded-lg border border-border">
        <Sparkles size={18} class="text-primary" />
        <span class="text-sm text-secondary">AI Confidence:</span>
        <div class="flex-1">
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-500"
              class:bg-green-500={confidence >= 0.8}
              class:bg-yellow-500={confidence >= 0.5 && confidence < 0.8}
              class:bg-red-500={confidence < 0.5}
              style="width: {confidencePercent}%"
            ></div>
          </div>
        </div>
        <span class="text-sm font-medium">{confidencePercent}%</span>
      </div>
    {/if}

    <!-- Type Switcher -->
    <div class="flex p-1 bg-surface rounded-full border border-border" role="tablist">
      <button
        role="tab"
        aria-selected={type === "income"}
        class="flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-200 {type === 'income'
          ? 'bg-emerald-500 text-white shadow-sm'
          : 'text-muted hover:text-foreground'}"
        onclick={() => { type = "income"; categoryId = ""; }}
      >
        Pemasukan
      </button>
      <button
        role="tab"
        aria-selected={type === "expense"}
        class="flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-200 {type === 'expense'
          ? 'bg-red-500 text-white shadow-sm'
          : 'text-muted hover:text-foreground'}"
        onclick={() => { type = "expense"; categoryId = ""; }}
      >
        Pengeluaran
      </button>
    </div>

    <!-- Amount -->
    <div>
      <label for="amount" class="block text-sm font-medium text-secondary mb-1.5">Jumlah</label>
      <MoneyInput id="amount" bind:value={amount} placeholder="0" />
    </div>

    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-secondary mb-1.5">Keterangan</label>
      <input
        id="name"
        type="text"
        bind:value={name}
        placeholder="Isi yang kamu ingat dulu"
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- Category & Subcategory -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Combobox
        label="Kategori"
        options={categoryOptions}
        bind:value={categoryId}
        onValueChange={() => (subcategoryId = "")}
        placeholder="Pilih kategori"
        searchPlaceholder="Cari..."
        emptyMessage="Tidak ada kategori"
      />
      <Combobox
        label="Subkategori"
        options={subcategoryOptions}
        bind:value={subcategoryId}
        placeholder="Opsional"
        searchPlaceholder="Cari..."
        emptyMessage="Tidak ada subkategori"
        disabled={!categoryId || subcategoryOptions.length === 0}
      />
    </div>

    <!-- Pocket -->
    <Combobox
      label="Kantong"
      options={pocketOptions}
      bind:value={pocketId}
      placeholder="Pilih kantong"
      searchPlaceholder="Cari..."
      emptyMessage="Belum ada kantong"
    />

    <!-- Date -->
    <div>
      <label for="date" class="block text-sm font-medium text-secondary mb-1.5">Tanggal</label>
      <input
        id="date"
        type="datetime-local"
        bind:value={date}
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- Notes (contains items) -->
    <div>
      <label for="description" class="block text-sm font-medium text-secondary mb-1.5">Catatan</label>
      <textarea
        id="description"
        bind:value={description}
        placeholder="Catatan tambahan..."
        rows={3}
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      ></textarea>
    </div>
  </div>

  <div class="flex gap-3 mt-6">
    <Button variant="secondary" fullWidth onclick={onClose}>Batal</Button>
    <Button
      variant="primary"
      fullWidth
      loading={isSubmitting}
      onclick={handleSubmit}
    >
      {#if type === "income"}
        Simpan Pemasukan
      {:else}
        Simpan Pengeluaran
      {/if}
    </Button>
  </div>
</ResponsiveModal>
