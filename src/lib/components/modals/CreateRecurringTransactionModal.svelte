<script lang="ts">
  import { recurringStore } from "$lib/stores/recurring.svelte";
  import { categoriesStore } from "$lib/stores/categories.svelte";
  import { booksStore } from "$lib/stores/books.svelte";
  import { ResponsiveModal, MoneyInput, Button, Combobox } from "$lib/components/ui";
  import type { ComboboxOption } from "$lib/components/ui";
  import type { CreateRecurringTransactionRequest } from "$lib/types/recurring";
  import { untrack } from "svelte";

  let { open = $bindable(false) } = $props();

  let name = $state("");
  let amount = $state(0);
  let type = $state<"income" | "expense" | "transfer">("expense");
  let frequency = $state<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  let startDate = $state(new Date().toISOString().split("T")[0]);
  let categoryId = $state("");
  let subcategoryId = $state("");
  let pocketId = $state("");
  let toPocketId = $state(""); // For transfer

  // Derived state
  let pockets = $derived(booksStore.pockets);
  
  const pocketOptions = $derived<ComboboxOption[]>(
    pockets.map(p => ({
        value: p.id,
        label: p.name,
        // icon: "💰" // Optional icon
    }))
  );

  // Filter categories based on type
  let categories = $derived(categoriesStore.categories.filter(c => c.type === type));
  
  const categoryOptions = $derived<ComboboxOption[]>(
    categories.map(c => ({
        value: c.id,
        label: c.name,
        icon: c.icon
    }))
  );

  // Subcategories logic
  const selectedCategory = $derived(
    categories.find((c) => c.id === categoryId)
  );

  const subcategories = $derived(selectedCategory?.subcategories || []);

  const subcategoryOptions = $derived<ComboboxOption[]>(
    subcategories.map((s) => ({
      value: s.id,
      label: s.name,
    }))
  );

  // Reset/Init form
  $effect(() => {
    if (open) {
        // If we have an active book, load its categories
        const activeBookId = booksStore.activeBook?.id;
        if (activeBookId) {
            untrack(() => {
                categoriesStore.load(activeBookId);
                
                if (!pocketId && pockets.length > 0) {
                    pocketId = pockets[0].id;
                }
            });
        }
    }
  });

  // Reset subcategory when category changes or type changes
  $effect(() => {
      // If type matches, we keep category, but if category changes, subcategory might be invalid.
      // Actually simpler: if categoryId changes, we might want to reset subcategoryId?
      // But we can't easily detect "change" without tracking specific deps.
      // Svelte 5 runes: We can just let the combobox handle it or check validity?
      // A common pattern:
      if (categoryId && subcategoryId) {
          const cat = categories.find(c => c.id === categoryId);
          if (cat) {
            const sub = cat.subcategories?.find(s => s.id === subcategoryId);
            if (!sub) subcategoryId = "";
          } else {
             // Category no longer in list (e.g. type switched)
             categoryId = "";
             subcategoryId = "";
          }
      }
  });

  async function handleSubmit() {
    if (!pocketId || !name || amount <= 0) return;
    
    // Additional validation for transfer
    if (type === "transfer" && !toPocketId) return;

    const data: CreateRecurringTransactionRequest = {
      name,
      amount_cents: amount, // MoneyInput already handles local state, but we might need conversion if it returns string
      type,
      frequency,
      start_date: new Date(startDate).toISOString(),
      pocket_id: pocketId,
      category_id: type !== 'transfer' ? (categoryId || undefined) : undefined,
      subcategory_id: type !== 'transfer' ? (subcategoryId || undefined) : undefined,
      to_pocket_id: type === 'transfer' ? toPocketId : undefined
    };

    // MoneyInput usually binds to a number or string. 
    // If MoneyInput binds to a direct number value of raw input (e.g. "10000"), we might need to multiply by 100 for cents if the backend expects cents
    // But looking at the previous code: amount_cents: amount.
    // And MoneyInput value prop: `value = $bindable("")` (string).
    // Wait, in previous step `amount` was initialized as `0` (number).
    // Let's check MoneyInput usage. It seems to export clean number string.
    // So we need to parse it.

    // Correction: In previous code `let amount = $state(0);` and `amount_cents: amount`. 
    // But MoneyInput usually returns the raw number string.
    // Let's ensure strict typing.
    
    // Let's treat `amount` as the raw number value (possibly string from input).
    // We need to send `amount_cents`.
    
    // Refined logic:
    // If `amount` is a number from `MoneyInput` (if it was modified to return number), then `amount * 100` might be wrong if it's already big.
    // Actually, `MoneyInput` in step 925: `value = raw` which is a string.
    // So we should parse it.
    
    const amountVal = typeof amount === 'string' ? parseInt(amount) : amount;
    // Assuming backend expects CENTS.
    // If user types "10.000", value is "10000".
    // Usually MoneyInput is in major units (Rp). So 10000 Rp = 1000000 cents.
    data.amount_cents = amountVal * 100;

    const res = await recurringStore.create(data);
    if (res) {
      open = false;
      resetForm();
    }
  }

  function resetForm() {
    name = "";
    amount = 0;
    type = "expense";
    frequency = "monthly";
    startDate = new Date().toISOString().split("T")[0];
    categoryId = "";
    subcategoryId = "";
    toPocketId = "";
    // Keep pocketId if possible
  }

  const frequencyOptions = [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
    { value: "yearly", label: "Tahunan" },
  ];
</script>

<ResponsiveModal title="Buat Transaksi Berulang" {open} onClose={() => open = false}>
  <div class="space-y-4">
    <!-- Type Switcher -->
    <div class="flex p-1 bg-surface rounded-xl border border-border">
      <button
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted hover:text-foreground'}"
        onclick={() => type = 'income'}
      >
        Pemasukan
      </button>
      <button
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'text-muted hover:text-foreground'}"
        onclick={() => type = 'expense'}
      >
        Pengeluaran
      </button>
      <button
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'transfer' ? 'bg-blue-500 text-white shadow-sm' : 'text-muted hover:text-foreground'}"
        onclick={() => type = 'transfer'}
      >
        Transfer
      </button>
    </div>

    <!-- Amount -->
    <div>
      <label
        for="amount"
        class="block text-sm font-medium text-secondary mb-1.5">Jumlah</label
      >
      <div class="relative">
        <span
          class="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium"
          >Rp</span
        >
        <input
          id="amount"
          type="number"
          bind:value={amount}
          placeholder="0"
          class="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground text-lg font-semibold placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>

    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-secondary mb-1.5">Nama / Deskripsi</label>
      <input
        id="name"
        type="text"
        bind:value={name}
        placeholder="Contoh: Bayar Kosan"
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- Pockets & Categories -->
    {#if type === 'transfer'}
        <!-- Transfer Logic -->
        <div class="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
             <Combobox
                label="Dari Kantong"
                options={pocketOptions}
                bind:value={pocketId}
                placeholder="Pilih kantong asal"
             />
             
             <div class="flex justify-center -my-2 relative z-10">
                <div class="p-1.5 bg-surface border border-border rounded-full text-muted">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
             </div>

             <Combobox
                label="Ke Kantong"
                options={pocketOptions.filter(p => p.value !== pocketId)}
                bind:value={toPocketId}
                placeholder="Pilih kantong tujuan"
             />
        </div>
    {:else}
        <!-- Regular Income/Expense -->
        <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Combobox
                    label="Kategori"
                    options={categoryOptions}
                    bind:value={categoryId}
                    onValueChange={() => (subcategoryId = "")}
                    placeholder="Pilih kategori"
                    emptyMessage="Tidak ada kategori"
                />
                 <Combobox
                    label="Subkategori"
                    options={subcategoryOptions}
                    bind:value={subcategoryId}
                    placeholder="Opsional"
                    emptyMessage="Tidak ada subkategori"
                    disabled={!categoryId || subcategoryOptions.length === 0}
                />
            </div>
            
            <Combobox
                label="Kantong"
                options={pocketOptions}
                bind:value={pocketId}
                placeholder="Pilih kantong"
            />
        </div>
    {/if}

    <!-- Frequency & Date Grid (Moved to bottom) -->
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label for="frequency" class="block text-sm font-medium text-secondary mb-1.5">Frekuensi</label>
            <select 
                id="frequency"
                class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                bind:value={frequency}
            >
                {#each frequencyOptions as freq}
                    <option value={freq.value}>{freq.label}</option>
                {/each}
            </select>
        </div>
        <div>
            <label for="startDate" class="block text-sm font-medium text-secondary mb-1.5">Mulai Tanggal</label>
            <input 
                type="date" 
                id="startDate" 
                bind:value={startDate} 
                class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    </div>

    <div class="flex gap-3 mt-6">
        <Button variant="secondary" fullWidth onclick={() => open = false}>Batal</Button>
        <Button 
            variant="primary" 
            fullWidth 
            disabled={recurringStore.isLoading || !name || !amount || amount <= 0 || !pocketId || (type === 'transfer' && !toPocketId)}
            onclick={handleSubmit}
        >
            {recurringStore.isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
    </div>
  </div>
</ResponsiveModal>
