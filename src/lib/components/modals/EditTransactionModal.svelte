<script lang="ts">
  import {
    Button,
    Combobox,
    type ComboboxOption,
    ResponsiveModal,
    BookSelector,
    MoneyInput,
  } from "$lib/components/ui";
  import { booksStore, transactionsStore, toastStore } from "$lib/stores";
  import { transactionsApi } from "$lib/api/transactions";
  import { pocketsApi } from "$lib/api/pockets";
  import { categoriesApi } from "$lib/api/categories";
  import { booksApi } from "$lib/api/books";
  import type { Transaction } from "$lib/types/transaction";
  import type { Category, Subcategory } from "$lib/types/category";
  import { untrack } from "svelte";
  import type { Pocket } from "$lib/types";

  interface Props {
    transaction: Transaction | null;
    open: boolean;
    onClose: () => void;
    onSaved?: () => void;
  }

  let { transaction, open, onClose, onSaved }: Props = $props();

  let name = $state("");
  let amount = $state("");
  let date = $state("");
  let description = $state("");
  let categoryId = $state("");
  let subcategoryId = $state("");
  let isSubmitting = $state(false);

  // Transfer specific state
  let fromPocketId = $state("");
  let fromBookId = $state("");
  let toPocketId = $state("");
  let toBookId = $state("");
  let toBookPockets = $state<Pocket[]>([]);
  let isLoadingToPockets = $state(false);
  let isCrossBook = $state(false);
  let includeFee = $state(false);
  let fee = $state("");
  let excludeFromAnalytics = $state(false);

  // Temporary storage for books not in the store (to fix Unknown Book)
  let tempBooks = $state<Record<string, { id: string; name: string }>>({});

  // Categories
  let categories = $state<Category[]>([]);
  let isLoadingCategories = $state(false);

  // From Book Pockets
  let fromBookPockets = $state<Pocket[]>([]);
  let isLoadingFromPockets = $state(false);

  const isTransfer = $derived(transaction?.type === "transfer");

  // Load categories
  async function loadCategories() {
    if (categories.length > 0 || isLoadingCategories) return;
    isLoadingCategories = true;
    try {
      if (!booksStore.activeBook) return;
      const response = await categoriesApi.list(booksStore.activeBook.id);
      if (response.data?.categories) {
        categories = response.data.categories;
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    }
    isLoadingCategories = false;
  }

  // Available pockets for selection (From side)
  const pocketOptions = $derived.by(() => {
    // Determine source pockets list
    let sourceList: Pocket[] = [];
    if (isCrossBook && fromBookId) {
      sourceList = fromBookPockets;
    } else {
      // Default to active book pockets if not cross-book or no fromBookId yet
      sourceList = booksStore.pockets;
    }

    const baseOptions = sourceList.map((p) => ({
      value: p.id,
      label: p.name,
      icon: "💰",
    }));

    // Ensure the current "fromPocketId" is represented even if lists are loading
    // We use the transaction data to fill in the label if needed
    // Ensure the current "fromPocketId" is represented even if lists are loading
    // We use the transaction data to fill in the label if needed
    if (fromPocketId && !baseOptions.find((o) => o.value === fromPocketId)) {
      let label = "Unknown Pocket";
      let icon = "💰";

      if (transaction) {
        const pocket =
          transaction.source_pocket?.id === fromPocketId
            ? transaction.source_pocket
            : transaction.pocket?.id === fromPocketId
              ? transaction.pocket
              : transaction.related_pocket?.id === fromPocketId
                ? transaction.related_pocket
                : null;

        if (pocket) {
          // Privacy Masking: If we can't edit this side (book not in store), mask the name via owner
          if (!canEditFrom && (pocket as any).book?.owner_name) {
            label = `${(pocket as any).book.owner_name}'s Pocket`;
          } else {
            label = pocket.name;
          }
        }
      }

      baseOptions.push({
        value: fromPocketId,
        label: label,
        icon: icon,
      });
    }

    return baseOptions;
  });

  // Available books for selection (From side)
  const fromBookOptions = $derived.by(() => {
    const baseOptions = booksStore.books.map((b) => ({
      value: b.id,
      label: b.name,
      icon: "📚",
    }));

    if (fromBookId && !baseOptions.find((o) => o.value === fromBookId)) {
      let label = "Unknown Book";
      let icon = "📚";

      // Check tempBooks first
      if (tempBooks[fromBookId]) {
        label = tempBooks[fromBookId].name;
      }
      // Try to find book name from transaction
      else if (
        transaction?.source_pocket &&
        (transaction.source_pocket as any).book
      ) {
        const book = (transaction.source_pocket as any).book;
        if (book.owner_name) {
          label = `${book.owner_name}'s Book`;
        } else {
          label = book.name;
        }
      } else if (
        transaction?.related_pocket &&
        (transaction.related_pocket as any).book &&
        transaction.related_pocket.book_id === fromBookId
      ) {
        const book = (transaction.related_pocket as any).book;
        if (book.owner_name) {
          label = `${book.owner_name}'s Book`;
        } else {
          label = book.name;
        }
      } else if (
        transaction?.pocket &&
        (transaction.pocket as any).book &&
        transaction.pocket.book_id === fromBookId
      ) {
        const book = (transaction.pocket as any).book;
        if (book.owner_name) {
          label = `${book.owner_name}'s Book`;
        } else {
          label = book.name;
        }
      }

      baseOptions.push({
        value: fromBookId,
        label: label,
        icon: icon,
      });
    }
    return baseOptions;
  });

  // Available books for selection (To side)
  const toBookOptions = $derived.by(() => {
    const baseOptions = booksStore.books.map((b) => ({
      value: b.id,
      label: b.name,
      icon: "📚",
    }));

    if (toBookId && !baseOptions.find((o) => o.value === toBookId)) {
      let label = "Unknown Book";
      let icon = "📚";

      // Check tempBooks first
      if (tempBooks[toBookId]) {
        label = tempBooks[toBookId].name;
      }
      // Try to find book name from transaction dest_pocket
      else if (
        transaction?.dest_pocket &&
        (transaction.dest_pocket as any).book
      ) {
        const book = (transaction.dest_pocket as any).book;
        if (book.owner_name) {
          label = `${book.owner_name}'s Book`;
        } else {
          label = book.name;
        }
      } else if (
        transaction?.related_pocket &&
        (transaction.related_pocket as any).book &&
        transaction.related_pocket.book_id === toBookId
      ) {
        const book = (transaction.related_pocket as any).book;
        if (book.owner_name) {
          label = `${book.owner_name}'s Book`;
        } else {
          label = book.name;
        }
      } else if (
        transaction?.pocket &&
        (transaction.pocket as any).book &&
        transaction.pocket.book_id === toBookId
      ) {
        const book = (transaction.pocket as any).book;
        if (book.owner_name) {
          label = `${book.owner_name}'s Book`;
        } else {
          label = book.name;
        }
      }

      baseOptions.push({
        value: toBookId,
        label: label,
        icon: icon,
      });
    }
    return baseOptions;
  });

  // To Pocket Options (Dynamic based on selected book)
  const toPocketOptions = $derived.by(() => {
    const baseOptions = toBookPockets
      // Filter out fromPocket if we are in the same book, to prevent same-pocket transfer
      .filter((p) =>
        booksStore.activeBook && toBookId === booksStore.activeBook.id
          ? p.id !== fromPocketId
          : true,
      )
      .map((p) => ({
        value: p.id,
        label: p.name,
        icon: "💰",
      }));

    // Add current selected pocket if not in list (Unknown/Privacy Case)
    if (toPocketId && !baseOptions.find((o) => o.value === toPocketId)) {
      let label = "Unknown Pocket";
      let icon = "💰";

      if (transaction) {
        const pocket =
          transaction.dest_pocket?.id === toPocketId
            ? transaction.dest_pocket
            : transaction.pocket?.id === toPocketId
              ? transaction.pocket
              : transaction.related_pocket?.id === toPocketId
                ? transaction.related_pocket
                : null;

        if (pocket) {
          // Privacy Masking
          if (!canEditTo && (pocket as any).book?.owner_name) {
            label = `${(pocket as any).book.owner_name}'s Pocket`;
          } else {
            label = pocket.name;
          }
        }
      }

      baseOptions.push({
        value: toPocketId,
        label: label,
        icon: icon,
      });
    }

    return baseOptions;
  });

  // Populate form when transaction changes
  $effect(() => {
    if (open && transaction?.id) {
      console.log("DEBUG TRANSACTION:", transaction);
      const tx = transaction;
      untrack(() => {
        loadCategories();

        // Initialize with passed transaction data first (optimistic)
        initializeForm(tx);

        // Fetch full details to ensure we have related_pocket and fees
        fetchFullTransactionDetails(tx.id);
      });
    }
  });

  async function loadToBookPockets(specificBookId?: string) {
    const targetBookId = specificBookId || toBookId;
    if (!targetBookId) return;

    // If it's the active book, use the store
    if (booksStore.activeBook && targetBookId === booksStore.activeBook.id) {
      toBookPockets = booksStore.pockets;
      isLoadingToPockets = false;
      return;
    }

    // Capture current ID to verify later
    isLoadingToPockets = true;
    try {
      const result = await pocketsApi.listByBook(targetBookId);
      // Only apply if the book ID hasn't changed since we started
      if (toBookId === targetBookId && result.data) {
        toBookPockets = result.data.pockets;
      }
    } catch (e: any) {
      // 403 is expected if we don't have permission to view that book (e.g. cross-book transfer)
      if (e?.response?.status !== 403) {
        console.error("Failed to load pockets for To Book", e);
      }
    } finally {
      if (toBookId === targetBookId) {
        isLoadingToPockets = false;
      }
    }
  }

  async function loadFromBookPockets(specificBookId?: string) {
    const targetBookId = specificBookId || fromBookId;
    if (!targetBookId) return;

    // If it's the active book, use the store
    if (booksStore.activeBook && targetBookId === booksStore.activeBook.id) {
      // Wait, fromBookPockets usually mirrors active pockets if same?
      // Let's just fetch to be safe or use store if matched.
      fromBookPockets = booksStore.pockets;
      isLoadingFromPockets = false;
      return;
    }

    // Attempt to resolve book name if needed (Collab Case)
    // If the book is NOT in our local store, fetch it to get the name
    if (
      targetBookId &&
      !booksStore.books.find((b) => b.id === targetBookId) &&
      !tempBooks[targetBookId]
    ) {
      try {
        const bookRes = await booksApi.get(targetBookId);
        if (bookRes.data) {
          // Update tempBooks using spread to ensure reactivity
          tempBooks = {
            ...tempBooks,
            [targetBookId]: { id: bookRes.data.id, name: bookRes.data.name },
          };
        }
      } catch (e) {
        console.error("Failed to fetch book details for", fromBookId, e);
      }
    }

    // Otherwise fetch pockets for that book
    isLoadingFromPockets = true;
    try {
      const result = await pocketsApi.listByBook(fromBookId);
      if (result.data) {
        fromBookPockets = result.data.pockets;
      }
    } catch (e: any) {
      // 403 is expected if we don't have permission to view that book (e.g. cross-book transfer)
      if (e?.response?.status !== 403) {
        console.error("Failed to load pockets for From Book", e);
      }
      // Do NOT reset lastLoadedFromBookId to prevent error loops
    }
    isLoadingFromPockets = false;
  }

  async function fetchFullTransactionDetails(id: string) {
    try {
      const res = await transactionsApi.getById(id);
      if (res.data) {
        const tx = res.data;
        // Only patch fields that might be missing in list view (fees, related pockets)
        // Do NOT re-run full initializeForm to avoid resetting IDs that trigger effects

        // Patch Amount/Fee if needed
        if (tx.type === "transfer") {
          const feeVal = tx.transfer_fee_cents ?? tx.fee_cents ?? 0;
          if (feeVal > 0) {
            if (!includeFee) {
              includeFee = true;
              fee = (feeVal / 100).toString();
            }
          }

          // AUTHORITY: If source/dest pockets are present, they are the truth.
          // Overwrite whatever heuristic initializeForm might have set.
          if (tx.source_pocket) {
            fromBookId = tx.source_pocket.book_id;
            fromPocketId = tx.source_pocket.id;
            loadFromBookPockets();
          }
          if (tx.dest_pocket) {
            toBookId = tx.dest_pocket.book_id;
            toPocketId = tx.dest_pocket.id;
            loadToBookPockets();
          }

          // Update CrossBook state
          if (fromBookId && toBookId) {
            isCrossBook = fromBookId !== toBookId;
          }
        }

        // Refresh tempBooks name if found for From Book
        if (fromBookId && tx.source_pocket && (tx.source_pocket as any).book) {
          const b = (tx.source_pocket as any).book;
          if (!tempBooks[fromBookId]) {
            tempBooks = {
              ...tempBooks,
              [fromBookId]: { id: b.id, name: b.name },
            };
          }
        }
        // Refresh tempBooks name if found for To Book
        if (toBookId && tx.dest_pocket && (tx.dest_pocket as any).book) {
          const b = (tx.dest_pocket as any).book;
          if (!tempBooks[toBookId]) {
            tempBooks = {
              ...tempBooks,
              [toBookId]: { id: b.id, name: b.name },
            };
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch transaction details", e);
    }
  }

  function initializeForm(tx: Transaction) {
    name = tx.name;
    amount = (Math.abs(tx.amount_cents) / 100).toString();

    // Handle fee & pockets for transfers
    if (tx.type === "transfer") {
      // Use transfer_amount_cents if available (always positive), fallback to absolute amount
      const amtVal = tx.transfer_amount_cents ?? Math.abs(tx.amount_cents);
      amount = (amtVal / 100).toString();

      // Check transfer_fee_cents first (populated by backend for transfer context), then fallback to fee_cents
      const feeVal = tx.transfer_fee_cents ?? tx.fee_cents ?? 0;
      if (feeVal > 0) {
        includeFee = true;
        fee = (feeVal / 100).toString();
      } else {
        includeFee = false;
        fee = "";
      }

      // DEBUG: Log what we received
      console.log("DEBUG TX:", {
        source_pocket: tx.source_pocket,
        dest_pocket: tx.dest_pocket,
        transfer_amount_cents: tx.transfer_amount_cents,
        transfer_fee_cents: tx.transfer_fee_cents,
        is_source: tx.is_source,
      });

      // Use source_pocket/dest_pocket if available (ALWAYS consistent From/To)
      if (tx.source_pocket && tx.dest_pocket) {
        fromPocketId = tx.source_pocket.id;
        toPocketId = tx.dest_pocket.id;

        // Determine Books
        toBookId = tx.dest_pocket.book_id;
        fromBookId = tx.source_pocket.book_id;

        // Set cross-book toggle
        isCrossBook = toBookId !== fromBookId;

        // Pre-populate toBookPockets/fromBookPockets if active
        if (booksStore.activeBook && toBookId === booksStore.activeBook.id) {
          toBookPockets = booksStore.pockets;
        }
        if (booksStore.activeBook && fromBookId === booksStore.activeBook.id) {
          fromBookPockets = booksStore.pockets;
        }
      } else {
        // Fallback to old heuristic logic
        let isSource =
          tx.is_source ??
          (tx.amount_cents < 0 || (tx.fee_cents && tx.fee_cents > 0));
        if (isSource) {
          fromPocketId = tx.pocket_id;
          toPocketId = tx.related_pocket_id || tx.related_pocket?.id || "";
          // Guess book from related pocket if available
          if (tx.related_pocket) {
            toBookId = tx.related_pocket.book_id;
          } else if (booksStore.activeBook) {
            toBookId = booksStore.activeBook.id;
          }

          if (tx.pocket) {
            fromBookId = tx.pocket.book_id;
          } else if (booksStore.activeBook) {
            fromBookId = booksStore.activeBook.id;
          }
        } else {
          fromPocketId = tx.related_pocket_id || tx.related_pocket?.id || "";
          toPocketId = tx.pocket_id;
          // Guess book from main pocket if available?
          // If isSource is false, then related_pocket is the SOURCE, and pocket_id is DEST.
          // So toBookId should be from pocket_id (main pocket)
          if (tx.pocket) {
            toBookId = tx.pocket.book_id;
          } else if (booksStore.activeBook) {
            toBookId = booksStore.activeBook.id;
          }

          if (tx.related_pocket) {
            fromBookId = tx.related_pocket.book_id;
          } else if (booksStore.activeBook) {
            fromBookId = booksStore.activeBook.id;
          }
        }

        isCrossBook = toBookId !== fromBookId;
      }
    } else {
      includeFee = false;
      fee = "";
      fromPocketId = "";
      toPocketId = "";
    }

    // Format date for datetime-local input
    const d = new Date(tx.date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    date = d.toISOString().slice(0, 16);
    description = tx.description || "";
    categoryId = tx.category_id || "";
    subcategoryId = tx.subcategory_id || "";
    excludeFromAnalytics = tx.exclude_from_analytics || false;
  }

  // Filter categories by transaction type
  const filteredCategories = $derived(
    transaction && transaction.type !== "transfer"
      ? categories.filter((c) => c.type === transaction.type)
      : [],
  );

  // Category Options for Combobox
  const categoryOptions = $derived<ComboboxOption[]>(
    filteredCategories.map((c) => ({
      value: c.id,
      label: c.name,
      icon: c.icon,
    })),
  );

  // Get subcategories for selected category
  const selectedCategory = $derived(
    categories.find((c) => c.id === categoryId),
  );

  const subcategories = $derived(selectedCategory?.subcategories || []);

  // Subcategory Options for Combobox
  const subcategoryOptions = $derived<ComboboxOption[]>(
    subcategories.map((s) => ({
      value: s.id,
      label: s.name,
    })),
  );

  // Determine if we have edit access to the books
  const canEditFrom = $derived(
    !fromBookId || booksStore.books.some((b) => b.id === fromBookId),
  );

  const canEditTo = $derived(
    !toBookId || booksStore.books.some((b) => b.id === toBookId),
  );

  async function handleSubmit() {
    if (!transaction || !name || !amount) return;

    isSubmitting = true;

    let amountCents = Math.round(parseFloat(amount) * 100);

    // Determine which fields to send for pockets
    let finalPocketId: string | undefined;
    let finalRelatedPocketId: string | undefined;

    if (isTransfer) {
      // Map From/To to Pocket/Related based on transaction direction
      // We always send both to be safe and ensure backend syncs links
      const isOutgoing = transaction.amount_cents < 0;

      if (isOutgoing) {
        // We are Source
        // Pocket = From
        // Related = To
        finalPocketId = fromPocketId;
        finalRelatedPocketId = toPocketId;
      } else {
        // We are Dest
        // Pocket = To
        // Related = From
        finalPocketId = toPocketId;
        finalRelatedPocketId = fromPocketId;
      }
    }

    // Amount sign logic: Always send positive amount to backend (validation requires min=1)
    // Backend handles negation based on type/context.
    amountCents = Math.abs(amountCents);

    // If user swapped pockets completely (From became To, To became From), we might be inverting direction?
    // But here we are just editing the pockets associated with this transaction record.
    // If I edit "Transfer Out" (A->B) and swap to (B->A),
    // "From" becomes B, "To" becomes A.
    // `finalPocketId` = B. `finalRelatedPocketId` = A.
    // Backend will update: Current (was A) -> B. Related (was B) -> A.
    // Result: Current is now "Transfer Out" from B to A.
    // Logic holds.

    const feeCents = includeFee && fee ? Math.round(parseFloat(fee) * 100) : 0;
    const isoDate = new Date(date).toISOString();

    try {
      const result = await transactionsApi.update(transaction.id, {
        name,
        amount_cents: amountCents,
        date: isoDate,
        description,
        category_id: categoryId || undefined,
        subcategory_id: subcategoryId || undefined,
        fee_cents: feeCents,
        related_pocket_id: finalRelatedPocketId,
        pocket_id: finalPocketId,
        exclude_from_analytics: excludeFromAnalytics,
        version: transaction.version,
      });

      if (result.data) {
        toastStore.success("Transaksi berhasil diperbarui!");
        // Refresh pockets to update balances
        if (booksStore.activeBook) {
          await booksStore.loadPockets(booksStore.activeBook.id);
        }
        // Refresh transaction list
        await transactionsStore.refresh();
        onClose();
        if (onSaved) onSaved();
      } else {
        toastStore.error(result.error?.error || "Gagal memperbarui transaksi");
      }
    } catch (e) {
      toastStore.error("Terjadi kesalahan saat menyimpan");
    } finally {
      isSubmitting = false;
    }
  }
</script>

<ResponsiveModal
  {open}
  {onClose}
  title="Edit {isTransfer ? 'Transfer' : 'Transaksi'}"
>
  {#if transaction}
    <div class="space-y-4">
      <!-- Amount -->
      <div>
        <label
          for="edit-amount"
          class="block text-sm font-medium text-secondary mb-1.5">Amount</label
        >
        <MoneyInput id="edit-amount" bind:value={amount} placeholder="0" />
      </div>

      <!-- Transfer Fee (Visible only for transfers) -->
      {#if isTransfer}
        <div class="bg-surface border border-border rounded-xl p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-foreground"
              >Transaction Fee</span
            >
            <button
              type="button"
              role="switch"
              aria-checked={includeFee}
              aria-label="Toggle biaya transaksi"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 {includeFee
                ? 'bg-primary'
                : 'bg-muted'}"
              onclick={() => (includeFee = !includeFee)}
            >
              <span
                class="{includeFee
                  ? 'translate-x-6'
                  : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              ></span>
            </button>
          </div>
          {#if includeFee}
            <div class="mt-3">
              <MoneyInput bind:value={fee} placeholder="0" />
            </div>
          {/if}
        </div>
      {/if}

      <!-- Description / Name -->
      <div>
        <label
          for="edit-name"
          class="block text-sm font-medium text-secondary mb-1.5"
          >Description</label
        >
        <input
          id="edit-name"
          type="text"
          bind:value={name}
          placeholder="What is this for?"
          class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <!-- Analytics Toggle -->
      <div
        class="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50"
      >
        <div>
          <span class="text-sm font-medium text-foreground block"
            >Exclude from Analytics</span
          >
          <span class="text-xs text-muted block mt-0.5"
            >Don't include this in spending reports</span
          >
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={excludeFromAnalytics}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 {excludeFromAnalytics
            ? 'bg-primary'
            : 'bg-muted'}"
          onclick={() => (excludeFromAnalytics = !excludeFromAnalytics)}
        >
          <span
            class="{excludeFromAnalytics
              ? 'translate-x-6'
              : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          />
        </button>
      </div>

      {#if isTransfer}
        <div class="space-y-4">
          <!-- Type Switcher / Cross-Book Toggle -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-secondary"
              >Cross-book Transfer</span
            >
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

          <div class="grid grid-cols-1 gap-4">
            <!-- From Section -->
            <div
              class="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50"
            >
              {#if isCrossBook}
                <Combobox
                  label="From Book"
                  options={fromBookOptions}
                  value={fromBookId}
                  onValueChange={(val) => {
                    fromBookId = val;
                    fromPocketId = "";
                    loadFromBookPockets(val);
                  }}
                  placeholder="Select book"
                  searchPlaceholder="Search books..."
                  emptyMessage="No books found"
                  disabled={!canEditFrom}
                />
              {/if}

              <Combobox
                label="From Pocket"
                options={pocketOptions}
                bind:value={fromPocketId}
                placeholder="Select pocket"
                searchPlaceholder="Search..."
                emptyMessage="No pockets found"
                disabled={!canEditFrom}
              />
            </div>

            <!-- Swap Button -->
            <div class="flex justify-center -my-2 relative z-10">
              <button
                type="button"
                class="p-2 bg-surface border border-border rounded-full hover:bg-border transition-colors"
                title="Swap pockets"
                onclick={() => {
                  const tempPocket = fromPocketId;
                  fromPocketId = toPocketId;
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

            <!-- To Section -->
            <div
              class="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50"
            >
              {#if isCrossBook}
                <Combobox
                  label="To Book"
                  options={toBookOptions}
                  value={toBookId}
                  onValueChange={(val) => {
                    toBookId = val;
                    toPocketId = "";
                    loadToBookPockets(val);
                  }}
                  placeholder="Select book"
                  searchPlaceholder="Search books..."
                  emptyMessage="No books found"
                />
              {/if}

              <Combobox
                label="To Pocket"
                options={toPocketOptions}
                bind:value={toPocketId}
                placeholder={isLoadingToPockets
                  ? "Loading pockets..."
                  : "Select pocket"}
                searchPlaceholder="Search pockets..."
                emptyMessage={isLoadingToPockets
                  ? "Loading..."
                  : "No pockets found"}
                disabled={isLoadingToPockets ||
                  (!isCrossBook ? false : !toBookId)}
              />
            </div>
          </div>
        </div>
      {/if}

      <!-- Category Selector (only for income/expense) -->
      {#if !isTransfer}
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
      {/if}

      <!-- Date -->
      <div>
        <label
          for="edit-date"
          class="block text-sm font-medium text-secondary mb-1.5">Date</label
        >
        <input
          id="edit-date"
          type="datetime-local"
          bind:value={date}
          class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <!-- Description/Notes -->
      <div>
        <label
          for="edit-description"
          class="block text-sm font-medium text-secondary mb-1.5">Notes</label
        >
        <textarea
          id="edit-description"
          bind:value={description}
          rows="2"
          placeholder="Additional notes (optional)"
          class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        ></textarea>
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
        Save Changes
      </Button>
    </div>
  {/if}
</ResponsiveModal>
