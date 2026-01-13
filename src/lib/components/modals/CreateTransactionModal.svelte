<script lang="ts">
  import {
    Button,
    Combobox,
    ResponsiveModal,
    BookSelector
  } from "$lib/components/ui";
  import type { ComboboxOption } from "$lib/components/ui";
  import { booksStore, transactionsStore, categoriesStore, toastStore } from "$lib/stores";
  import type { Category, Subcategory } from "$lib/types/category";
  import { untrack } from "svelte";
  import type { Pocket } from "$lib/types";
  import { pocketsApi } from "$lib/api";

  import { p2pApi } from "$lib/api/p2p";

  interface Props {
    open: boolean;
    onClose: () => void;
    defaultType?: "income" | "expense" | "transfer";
    defaultPocketId?: string;
  }

  let {
    open,
    onClose,
    defaultType = "expense",
    defaultPocketId,
  }: Props = $props();

  let name = $state("");
  let amount = $state("");
  let type = $state<"income" | "expense" | "transfer">(defaultType);
  let pocketId = $state(defaultPocketId || ""); // Acts as "From Pocket" for transfers
  let toPocketId = $state(""); // "To Pocket" for transfers
  let categoryId = $state("");
  let subcategoryId = $state("");
  
  // Cross-book transfer state
  let isCrossBook = $state(false);
  let fromBookId = $state("");
  let toBookId = $state("");
  
  let fromBookPockets = $state<Pocket[]>([]);
  let isLoadingFromPockets = $state(false);
  
  let toBookPockets = $state<Pocket[]>([]);
  let isLoadingToPockets = $state(false);

  // P2P State
  let isP2P = $state(false);
  let recipientEmail = $state("");

  function getLocalDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  let date = $state(getLocalDateTime());

  let isSubmitting = $state(false);

  // Use categories from the store (with caching)
  const categories = $derived(categoriesStore.categories);
  const isLoadingCategories = $derived(categoriesStore.isLoading);

  // Reset form when opening
  $effect(() => {
    if (open) {
      untrack(() => {
        categoriesStore.load(); // Uses caching
        type = defaultType;
        
        // Reset book selection
        if (booksStore.activeBook) {
          fromBookId = booksStore.activeBook.id;
          toBookId = booksStore.activeBook.id;
        }

        // Default to first pocket if available and none selected
        if (defaultPocketId) {
          pocketId = defaultPocketId;
        } else if (!pocketId && booksStore.pockets.length > 0) {
          pocketId = booksStore.pockets[0].id;
        }
        
        // Default destination pocket (try to pick a different one if possible)
        if (booksStore.pockets.length > 1 && !toPocketId) {
          const other = booksStore.pockets.find((p) => p.id !== pocketId);
          if (other) toPocketId = other.id;
        } else if (booksStore.pockets.length > 0 && !toPocketId) {
          toPocketId = booksStore.pockets[0].id;
        }
        
        // update date to now
        if (!date) date = getLocalDateTime();
      });
    }
  });

  // Load pockets when toBookId changes
  $effect(() => {
    if (type === 'transfer' && toBookId) {
      untrack(async () => {
        // If same book as active, use store pockets
        if (booksStore.activeBook && toBookId === booksStore.activeBook.id) {
          toBookPockets = booksStore.pockets;
          return;
        }
        
        // Otherwise fetch pockets for that book
        isLoadingToPockets = true;
        try {
          const result = await pocketsApi.listByBook(toBookId);
          if (result.data) {
            toBookPockets = result.data.pockets;
            // Clear selection if not in new list
            if (!toBookPockets.find(p => p.id === toPocketId)) {
              toPocketId = "";
            }
          }
        } catch (e) {
          console.error("Failed to load pockets for To Book", e);
          toastStore.error("Failed to load pockets for selected book");
        } finally {
          isLoadingToPockets = false;
        }
      });
    }
  });

  // Load pockets when fromBookId changes
  $effect(() => {
    if (type === 'transfer' && fromBookId) {
      untrack(async () => {
        // If same book as active, use store pockets
        if (booksStore.activeBook && fromBookId === booksStore.activeBook.id) {
          fromBookPockets = booksStore.pockets;
          return;
        }
        
        // Otherwise fetch pockets for that book
        isLoadingFromPockets = true;
        try {
          const result = await pocketsApi.listByBook(fromBookId);
          if (result.data) {
            fromBookPockets = result.data.pockets;
            // Clear selection if not in new list
            if (!fromBookPockets.find(p => p.id === pocketId)) {
              pocketId = "";
            }
          }
        } catch (e) {
          console.error("Failed to load pockets for From Book", e);
        } finally {
          isLoadingFromPockets = false;
        }
      });
    }
  });

  // Filter categories by current type
  const filteredCategories = $derived(
    type === "transfer" ? [] : categories.filter((c) => c.type === type)
  );

  // Transform categories to ComboboxOption format
  const categoryOptions = $derived<ComboboxOption[]>(
    filteredCategories.map((c) => ({
      value: c.id,
      label: c.name,
      icon: c.icon,
    }))
  );

  // Get subcategories for selected category
  const selectedCategory = $derived(
    categories.find((c) => c.id === categoryId)
  );

  const subcategories = $derived(selectedCategory?.subcategories || []);

  // Transform subcategories to ComboboxOption format
  const subcategoryOptions = $derived<ComboboxOption[]>(
    subcategories.map((s) => ({
      value: s.id,
      label: s.name,
    }))
  );

  // Transform pockets to ComboboxOption format (for FROM pocket)
  const pocketOptions = $derived<ComboboxOption[]>(
    (isCrossBook && fromBookId && fromBookId !== booksStore.activeBook?.id ? fromBookPockets : booksStore.pockets).map((p) => ({
      value: p.id,
      label: p.name,
      icon: "💰",
    }))
  );

  // Transform TO pockets options (depends on selected book)
  const toPocketOptions = $derived<ComboboxOption[]>(
    toBookPockets.map((p) => ({
      value: p.id,
      label: p.name,
      icon: "💰",
    }))
  );

  // Reset category when type changes
  $effect(() => {
    if (type === "transfer") {
      categoryId = "";
      subcategoryId = "";
    } else {
      // Check if current category matches new type
      const currentCat = categories.find((c) => c.id === categoryId);
      if (currentCat && currentCat.type !== type) {
        categoryId = "";
        subcategoryId = "";
      }
    }
  });

  // Fee Logic
  let includeFee = $state(false);
  let fee = $state("");

  async function handleSubmit() {
    if (!name || !amount) return;

    isSubmitting = true;
    const amountCents = Math.round(parseFloat(amount) * 100);
    const feeCents = includeFee && fee ? Math.round(parseFloat(fee) * 100) : 0;

    let success = false;
    const isoDate = new Date(date).toISOString();

    if (type === "transfer") {
      if (!pocketId) {
        isSubmitting = false;
        return;
      }
      
      if (isP2P) {
         if (!recipientEmail) return;
         try {
             await p2pApi.create({
                 sender_pocket_id: pocketId,
                 recipient_email: recipientEmail,
                 amount_cents: amountCents,
                 fee_cents: feeCents,
                 name: name,
                 description: "",
             });
             success = true;
         } catch(e) {
             console.error(e);
             toastStore.error("Failed to send transfer request");
             success = false;
         }
      } else {
        if (!toPocketId) {
            isSubmitting = false;
            return;
        }
        success = await transactionsStore.createTransfer({
            from_pocket_id: pocketId,
            to_pocket_id: toPocketId,
            name: name,
            amount_cents: amountCents,
            fee_cents: feeCents,
            date: isoDate,
            description: "",
        });
      }
    } else {
      if (!pocketId) {
        isSubmitting = false;
        return;
      }
      const tx = await transactionsStore.createTransaction({
        pocket_id: pocketId,
        name: name,
        amount_cents: amountCents,
        type: type as "income" | "expense",
        date: isoDate,
        category_id: categoryId || undefined,
        subcategory_id: subcategoryId || undefined,
      });
      success = !!tx;
    }

    isSubmitting = false;

    if (success) {
      // Refresh pockets to update balance
      if (booksStore.activeBook) {
        await booksStore.loadPockets(booksStore.activeBook.id);
      }
      // Refresh transaction list
      await transactionsStore.refresh();
      resetForm();
      onClose();
    }
  }

  function resetForm() {
    name = "";
    amount = "";
    type = defaultType;
    toPocketId = "";
    categoryId = "";
    subcategoryId = "";
    includeFee = false;
    fee = "";
    isCrossBook = false;
    isP2P = false;
    recipientEmail = "";
    fromBookId = booksStore.activeBook?.id || "";
    toBookId = booksStore.activeBook?.id || "";
    date = getLocalDateTime();
  }
</script>

<ResponsiveModal
  {open}
  {onClose}
  title={type === "transfer" ? "Transfer Baru" : "Transaksi Baru"}
>
  <div class="space-y-4">
    <!-- Type Switcher -->
    <div class="flex p-1 bg-surface rounded-xl border border-border">
      <button
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type ===
        'income'
          ? 'bg-emerald-500 text-white shadow-sm'
          : 'text-muted hover:text-foreground'}"
        onclick={() => (type = "income")}
      >
        Income
      </button>
      <button
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type ===
        'expense'
          ? 'bg-red-500 text-white shadow-sm'
          : 'text-muted hover:text-foreground'}"
        onclick={() => (type = "expense")}
      >
        Expense
      </button>
      <button
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type ===
        'transfer'
          ? 'bg-blue-500 text-white shadow-sm'
          : 'text-muted hover:text-foreground'}"
        onclick={() => (type = "transfer")}
      >
        Transfer
      </button>
    </div>

    <!-- Amount -->
    <div>
      <label
        for="amount"
        class="block text-sm font-medium text-secondary mb-1.5">Amount</label
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

    <!-- Transfer Fee -->
    {#if type === "transfer"}
      <div class="bg-surface border border-border rounded-xl p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-foreground"
            >Transaction Fee</span
          >
          <button
            type="button"
            role="switch"
            aria-checked={includeFee}
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 {includeFee
              ? 'bg-primary'
              : 'bg-muted'}"
            onclick={() => (includeFee = !includeFee)}
          >
            <span
              class="{includeFee
                ? 'translate-x-6'
                : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            />
          </button>
        </div>
        {#if includeFee}
          <div class="mt-3 relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium"
              >Rp</span
            >
            <input
              type="number"
              bind:value={fee}
              placeholder="0"
              class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm font-semibold placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        {/if}
      </div>
    {/if}

    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-secondary mb-1.5"
        >Description</label
      >
      <input
        id="name"
        type="text"
        bind:value={name}
        placeholder="What is this for?"
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- Category Selector (only for income/expense) -->
    {#if type !== "transfer"}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Combobox
          label="Category"
          options={categoryOptions}
          bind:value={categoryId}
          onValueChange={() => (subcategoryId = "")}
          placeholder="Select category"
          searchPlaceholder="Search..."
          emptyMessage="No categories"
        />
        <Combobox
          label="Subcategory"
          options={subcategoryOptions}
          bind:value={subcategoryId}
          placeholder="Optional"
          searchPlaceholder="Search..."
          emptyMessage="No subcategories"
          disabled={!categoryId || subcategoryOptions.length === 0}
        />
      </div>

    <!-- Pocket Selector(s) (non-transfer) -->
      <div class="grid grid-cols-1 gap-4">
        <Combobox
          label="Pocket"
          options={pocketOptions}
          bind:value={pocketId}
          placeholder="Select pocket"
          searchPlaceholder="Search..."
          emptyMessage="No pockets found"
        />
      </div>
    {/if}

    <!-- Transfer Specific Logic -->
    {#if type === "transfer"}
        <div class="space-y-4">
          <!-- Mode Toggle (Cross-Book vs P2P) -->
          <div class="flex gap-2 p-1 bg-muted rounded-lg">
             <button 
                class="flex-1 py-1.5 text-xs font-medium rounded { !isP2P ? 'bg-surface shadow-sm text-foreground' : 'text-muted hover:text-foreground' }"
                onclick={() => isP2P = false}
             >
                Internal / Cross-Book
             </button>
             <button 
                class="flex-1 py-1.5 text-xs font-medium rounded { isP2P ? 'bg-surface shadow-sm text-foreground' : 'text-muted hover:text-foreground' }"
                onclick={() => isP2P = true}
             >
                Send to User (P2P)
             </button>
          </div>

          {#if !isP2P}
            <!-- Cross-Book Toggle -->
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-secondary">Cross-book Transfer</span>
                <button
                type="button"
                role="switch"
                aria-checked={isCrossBook}
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 {isCrossBook
                    ? 'bg-primary'
                    : 'bg-muted'}"
                onclick={() => (isCrossBook = !isCrossBook)}
                >
                <span
                    class="{isCrossBook
                    ? 'translate-x-6'
                    : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                />
                </button>
            </div>
          {/if}

          <div class="grid grid-cols-1 gap-4">
            <!-- From Section -->
            <div class="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
               {#if isCrossBook && !isP2P}
                  <BookSelector
                    label="From Book"
                    bind:value={fromBookId}
                    onValueChange={(val) => {
                        fromBookId = val;
                    }}
                  />
               {/if}
                
                <Combobox
                  label="From Pocket"
                  options={pocketOptions}
                  bind:value={pocketId}
                  placeholder="Select pocket"
                  searchPlaceholder="Search..."
                  emptyMessage="No pockets found"
                />
            </div>

            <!-- Swap Button (Only for Internal) -->
            {#if !isP2P}
                <div class="flex justify-center -my-2 relative z-10">
                <button
                    type="button"
                    class="p-2 bg-surface border border-border rounded-full hover:bg-border transition-colors"
                    title="Swap pockets"
                    onclick={() => {
                    const tempPocket = pocketId;
                    pocketId = toPocketId;
                    toPocketId = tempPocket;
                    
                    if (isCrossBook) {
                        const tempBook = fromBookId;
                        fromBookId = toBookId;
                        toBookId = tempBook;
                    }
                    }}
                    aria-label="Swap pockets"
                >
                    <svg
                    class="w-5 h-5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                    </svg>
                </button>
                </div>
            {/if}

            <!-- To Section -->
            <div class="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
               {#if isP2P}
                    <label for="recipient" class="block text-sm font-medium text-secondary">Recipient Email</label>
                    <input
                        id="recipient"
                        type="email"
                        bind:value={recipientEmail}
                        placeholder="user@example.com"
                        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    />
               {:else}
                   {#if isCrossBook}
                      <BookSelector 
                        label="To Book" 
                        bind:value={toBookId} 
                      />
                   {/if}
                    
                    <Combobox
                      label="To Pocket"
                      options={toPocketOptions}
                      bind:value={toPocketId}
                      placeholder={isLoadingToPockets ? "Loading pockets..." : "Select pocket"}
                      searchPlaceholder="Search pockets..."
                      emptyMessage={isLoadingToPockets ? "Loading..." : "No pockets found"}
                      disabled={isLoadingToPockets || (!isCrossBook ? false : !toBookId)}
                    />
               {/if}
            </div>
          </div>
        </div>
    {/if}

    <!-- Date -->
    <div>
      <label for="date" class="block text-sm font-medium text-secondary mb-1.5"
        >Date</label
      >
      <input
        id="date"
        type="datetime-local"
        bind:value={date}
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  </div>

  <div class="flex gap-3 mt-6">
    <Button variant="secondary" fullWidth onclick={onClose}>Cancel</Button>
    <Button
      variant="primary"
      fullWidth
      loading={isSubmitting}
      onclick={handleSubmit}
    >
      {#if type === "transfer"}
        Transfer
      {:else}
        Add {type === "income" ? "Income" : "Expense"}
      {/if}
    </Button>
  </div>
</ResponsiveModal>
