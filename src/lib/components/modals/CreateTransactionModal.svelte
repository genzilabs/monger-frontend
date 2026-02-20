<script lang="ts">
  import {
    Button,
    Combobox,
    ResponsiveModal,
    BookSelector,
    MoneyInput,
  } from "$lib/components/ui";
  import type { ComboboxOption } from "$lib/components/ui";
  import {
    booksStore,
    transactionsStore,
    categoriesStore,
    toastStore,
    onboardingStore,
    uiStore,
  } from "$lib/stores";
  import { Camera } from "lucide-svelte";
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

  import { createTransactionFormState } from "./transactionForm.svelte";
  import TransactionTypeSwitcher from "./TransactionTypeSwitcher.svelte";
  import IncomeExpenseForm from "./IncomeExpenseForm.svelte";
  import TransferForm from "./TransferForm.svelte";

  let { open, onClose, defaultType = "expense", defaultPocketId }: Props = $props();

  const form = createTransactionFormState();

  // Use categories from the store (with caching)
  const categories = $derived(categoriesStore.categories);
  const isLoadingCategories = $derived(categoriesStore.isLoading);

  // Reset form when opening
  $effect(() => {
    if (open) {
      untrack(() => {
        if (booksStore.activeBook?.id) {
          categoriesStore.load(booksStore.activeBook.id); // Uses caching
        }
        form.reset();
        form.type = defaultType;

        // Reset book selection
        if (booksStore.activeBook) {
          form.fromBookId = booksStore.activeBook.id;
          form.toBookId = booksStore.activeBook.id;
        }

        // Set default pocket if provided, else use first active pocket
        if (defaultPocketId) {
          form.pocketId = defaultPocketId;
        } else if (booksStore.pockets.length > 0) {
          form.pocketId = booksStore.pockets[0].id;
        }

        if (booksStore.pockets.length > 0) {
          form.toPocketId = booksStore.pockets[0].id;
        }
      });
    }
  });

  // Load pockets when toBookId changes
  $effect(() => {
    if (form.type === "transfer" && form.toBookId) {
      untrack(() => {
        form.loadPocketsForBook(form.toBookId, true);
      });
    }
  });

  // Load pockets when fromBookId changes
  $effect(() => {
    if (form.type === "transfer" && form.fromBookId) {
      untrack(() => {
        form.loadPocketsForBook(form.fromBookId, false);
      });
    }
  });

  // Filter categories by current type
  const filteredCategories = $derived(
    form.type === "transfer" ? [] : categories.filter((c) => c.type === form.type),
  );

  // Transform categories to ComboboxOption format
  const categoryOptions = $derived<ComboboxOption[]>(
    filteredCategories.map((c) => ({
      value: c.id,
      label: c.name,
      icon: c.icon,
    })),
  );

  // Get subcategories for selected category
  const selectedCategory = $derived(
    categories.find((c) => c.id === form.categoryId),
  );

  const subcategories = $derived(selectedCategory?.subcategories || []);

  // Transform subcategories to ComboboxOption format
  const subcategoryOptions = $derived<ComboboxOption[]>(
    subcategories.map((sc) => ({
      value: sc.id,
      label: sc.name,
    })),
  );

  // Transform pockets to ComboboxOption format (for FROM pocket)
  const pocketOptions = $derived<ComboboxOption[]>(
    (form.isCrossBook && form.fromBookId && form.fromBookId !== booksStore.activeBook?.id
      ? form.fromBookPockets
      : booksStore.pockets
    ).map((p) => ({
      value: p.id,
      label: p.name,
      icon: "💰",
    })),
  );

  // Transform TO pockets options (depends on selected book)
  const toPocketOptions = $derived<ComboboxOption[]>(
    form.toBookPockets.map((p) => ({
      value: p.id,
      label: p.name,
      icon: "💰",
    })),
  );

  // Auto-clear invalid state
  $effect(() => {
    if (form.type && form.categoryId) {
      const currentCat = categories.find((c) => c.id === form.categoryId);
      if (currentCat && currentCat.type !== form.type) {
        form.categoryId = "";
        form.subcategoryId = "";
      }
    }
  });

  async function handleSubmit() {
    const success = await form.submit();
    if (success) {
      onClose();
    }
  }
</script>

<ResponsiveModal
  {open}
  {onClose}
>
  {#if booksStore.pockets.length === 0}
    <div class="flex flex-col items-center justify-center py-8 text-center space-y-4">
      <div class="bg-blue-50 p-4 rounded-full text-blue-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-wallet"
          ><path
            d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
          /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg
        >
      </div>
      <div>
        <h3 class="font-medium text-lg text-foreground">Belum ada Kantong</h3>
        <p class="text-muted text-sm mt-1 max-w-xs mx-auto">
          Kamu perlu membuat minimal satu kantong (Dompet, Bank, dll) untuk
          mencatat transaksi.
        </p>
      </div>
      <Button
        variant="primary"
        onclick={() => {
          onClose();
          if (booksStore.activeBook) {
            const bookId = booksStore.activeBook.id;
            import("$app/navigation").then(({ goto }) => {
              goto(`/books/${bookId}`);
            });
          }
        }}
      >
        Buat Kantong Baru
      </Button>
    </div>
  {:else}
    <div class="sticky top-0 z-10 bg-background flex items-center justify-between gap-2 border-b border-border/50 -mt-4 -mx-4 px-4 pt-2 pb-3 mb-4 md:-mt-6 md:-mx-6 md:px-6 md:pt-2">
      <h2 class="text-xl font-bold text-foreground">
        {form.type === "transfer" ? "Transfer" : "Transaksi Baru"}
      </h2>
      <TransactionTypeSwitcher {form} />
    </div>
    
    <div class="space-y-4">

      <!-- Scan Receipt Button (only for income/expense) -->
      {#if form.type !== "transfer"}
        <button
          type="button"
          onclick={() => {
            onClose();
            uiStore.scanReceipt();
          }}
          class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Scan Struk dengan AI
        </button>
      {/if}

      <!-- Amount -->
      <div>
        <label
          for="amount"
          class="block text-sm font-medium text-secondary mb-1.5">Jumlah</label
        >
        <MoneyInput id="amount" bind:value={form.amount} placeholder="0" />
      </div>

      <!-- Transfer Fee -->
      {#if form.type === "transfer"}
        <div class="bg-surface border border-border rounded-xl p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-foreground"
              >Biaya transfer</span
            >
            <button
              type="button"
              aria-label="Toggle include transfer fee"
              class="{form.includeFee
                ? 'bg-primary'
                : 'bg-border'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              onclick={() => {
                form.includeFee = !form.includeFee;
                if (!form.includeFee) form.fee = "";
              }}
            >
              <span
                class="{form.includeFee
                  ? 'translate-x-6'
                  : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              ></span>
            </button>
          </div>
          {#if form.includeFee}
            <div class="mt-3">
              <MoneyInput bind:value={form.fee} placeholder="0" />
            </div>
          {/if}
        </div>
      {/if}

      <!-- Name -->
      <div>
        <label
          for="name"
          class="block text-sm font-medium text-secondary mb-1.5"
          >Keterangan</label
        >
        <input
          id="name"
          type="text"
          bind:value={form.name}
          placeholder="Cth: Makan Siang, Beli Pulsa, dsb"
          class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p class="text-xs text-muted mt-1.5">Bisa diedit kapan saja.</p>
      </div>

      <!-- Category & Pocket Selectors (only for income/expense) -->
      {#if form.type !== "transfer"}
        <IncomeExpenseForm
          {form}
          {categoryOptions}
          {subcategoryOptions}
          {pocketOptions}
        />
      {/if}

      <!-- Transfer Specific Logic -->
      {#if form.type === "transfer"}
        <TransferForm {form} />
      {/if}

      <!-- Date Time Input -->
      <div>
        <label
          for="date"
          class="block text-sm font-medium text-secondary mb-1.5"
          >Tanggal & Waktu</label
        >
        <input
          id="date"
          type="datetime-local"
          bind:value={form.date}
          class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div class="pt-4">
        <Button
          type="submit"
          class="w-full font-bold text-base py-3"
          loading={form.isSubmitting}
          disabled={!form.name || !form.amount || (form.type !== "transfer" && !form.pocketId)}
        >
          Simpan Transaksi
        </Button>
      </div>
    </div>

  {/if}
</ResponsiveModal>
