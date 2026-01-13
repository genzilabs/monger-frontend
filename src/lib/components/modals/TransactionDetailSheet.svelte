<script lang="ts">
  import { ResponsiveModal, Button } from "$lib/components/ui";
  import type { Transaction } from "$lib/types/transaction";
  import { formatCurrency } from "$lib/utils/currency";
  import { transactionsApi } from "$lib/api/transactions";
  import { booksStore } from "$lib/stores";
  import { authStore } from "$lib/stores/auth.svelte";

  interface Props {
    transaction: Transaction | null;
    currency?: string;
    open: boolean;
    onClose: () => void;
    onEdit?: (tx: Transaction) => void;
    onDeleted?: () => void;
  }

  let {
    transaction,
    currency = "IDR",
    open,
    onClose,
    onEdit,
    onDeleted,
  }: Props = $props();

  let isDeleting = $state(false);
  let showDeleteConfirm = $state(false);

  const isIncome = $derived(transaction?.type === "income");
  const isTransfer = $derived(transaction?.type === "transfer");

  	const createdByOther = $derived(
		transaction?.creator_id && 
		authStore.user?.id && 
		transaction.creator_id !== '00000000-0000-0000-0000-000000000000' &&
		transaction.creator_id !== authStore.user.id
	);

  const typeColor = $derived(
    isTransfer
      ? "text-blue-500"
      : isIncome
        ? "text-emerald-500"
        : "text-red-500"
  );

  const typeBgColor = $derived(
    isTransfer
      ? "bg-blue-500/10"
      : isIncome
        ? "bg-emerald-500/10"
        : "bg-red-500/10"
  );

  const formattedDate = $derived(() => {
    if (!transaction) return "";
    return new Date(transaction.date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  const formattedTime = $derived(() => {
    if (!transaction) return "";
    return new Date(transaction.date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  function handleEdit() {
    if (transaction && onEdit) {
      onEdit(transaction);
    }
  }

  async function handleDelete() {
    if (!transaction) return;

    isDeleting = true;
    const result = await transactionsApi.delete(transaction.id);
    isDeleting = false;

    if (!result.error) {
      // Refresh pockets to update balances
      if (booksStore.activeBook) {
        await booksStore.loadPockets(booksStore.activeBook.id);
      }
      showDeleteConfirm = false;
      onClose();
      if (onDeleted) onDeleted();
    }
  }
</script>

<ResponsiveModal {open} {onClose} title="Detail Transaksi">
  {#if transaction}
    <div class="space-y-6">
      <!-- Amount Hero -->
      <div class="text-center py-4">
        <div
          class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center {typeBgColor}"
        >
          {#if isTransfer}
            <svg
              class="w-8 h-8 {typeColor}"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          {:else if isIncome}
            <svg
              class="w-8 h-8 {typeColor}"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          {:else}
            <svg
              class="w-8 h-8 {typeColor}"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          {/if}
        </div>
        <p class="text-3xl font-bold {typeColor}">
          {isIncome ? "+" : isTransfer ? "" : "-"}{formatCurrency(
            transaction.amount_cents,
            currency
          )}
        </p>
        <p class="text-sm text-muted mt-1 capitalize">{transaction.type}</p>
      </div>

      <!-- Details -->
      <div class="space-y-4">
        <!-- Name -->
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0"
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted">Name</p>
            <p class="text-sm font-medium text-foreground">
              {transaction.name}
            </p>
            {#if createdByOther}
              <p class="text-xs text-primary mt-0.5">Created by {transaction.creator_name}</p>
            {/if}
          </div>
        </div>

        <!-- Category (if available) -->
        {#if transaction.category}
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0"
            >
              <span class="text-lg">{transaction.category.icon || "📁"}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-muted">Category</p>
              <p class="text-sm font-medium text-foreground">
                {transaction.category.name}
                {#if transaction.subcategory}
                  <span class="text-muted"
                    >→ {transaction.subcategory.name}</span
                  >
                {/if}
              </p>
            </div>
          </div>
        {/if}

        <!-- Transfer Info (if transfer) -->
        {#if isTransfer && transaction.related_pocket}
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0"
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              {#if transaction.fee_cents && transaction.fee_cents > 0}
                <p class="text-xs text-muted">Transfer To</p>
              {:else}
                <p class="text-xs text-muted">Connected Pocket</p>
              {/if}
              <p class="text-sm font-medium text-foreground">
                {transaction.related_pocket.name}
              </p>
            </div>
          </div>
        {/if}

        <!-- Fee (if transfer with fee) -->
        {#if isTransfer && (transaction.transfer_fee_cents || transaction.fee_cents)}
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0"
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-muted">Transfer Fee</p>
              <p class="text-sm font-medium text-red-500">
                {formatCurrency(
                  transaction.transfer_fee_cents || transaction.fee_cents || 0,
                  currency
                )}
              </p>
            </div>
          </div>
        {/if}

        <!-- Date & Time -->
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0"
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted">Date & Time</p>
            <p class="text-sm font-medium text-foreground">{formattedDate()}</p>
            <p class="text-xs text-secondary">{formattedTime()}</p>
          </div>
        </div>

        <!-- Description -->
        {#if transaction.description}
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0"
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
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-muted">Description</p>
              <p class="text-sm text-foreground">{transaction.description}</p>
            </div>
          </div>
        {/if}
      </div>

      <!-- Action Buttons -->
      {#if showDeleteConfirm}
        <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p class="text-sm text-foreground mb-3">
            {#if isTransfer}
              <strong>Warning:</strong> This will delete both the outgoing and incoming
              transfer transactions and reverse the balance changes.
            {:else}
              Are you sure you want to delete this transaction? The pocket
              balance will be adjusted.
            {/if}
          </p>
          <div class="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onclick={() => (showDeleteConfirm = false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              loading={isDeleting}
              onclick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      {:else}
        <div class="flex gap-3 pt-4 border-t border-border">
          <button
            type="button"
            class="flex-1 py-3 px-4 bg-surface text-foreground font-medium rounded-xl hover:bg-border transition-colors flex items-center justify-center gap-2"
            onclick={handleEdit}
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button
            type="button"
            class="flex-1 py-3 px-4 bg-red-500/10 text-red-500 font-medium rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            onclick={() => (showDeleteConfirm = true)}
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      {/if}
    </div>
  {/if}
</ResponsiveModal>
