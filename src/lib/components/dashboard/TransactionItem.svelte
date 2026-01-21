<script lang="ts">
  import type { Transaction } from "$lib/types/transaction";
  import { formatCurrency } from "$lib/utils/currency";
  import { authStore, privacyStore } from "$lib/stores";

  interface Props {
    transaction: Transaction;
    currency?: string;
    onclick?: () => void;
    showDate?: boolean;
    showTime?: boolean;
  }

  let {
    transaction,
    currency = "IDR",
    onclick,
    showDate = true,
    showTime = false,
  }: Props = $props();

  const isIncome = $derived(transaction.type === "income");
  const isTransfer = $derived(transaction.type === "transfer");

  // Check if created by someone else
  const createdByOther = $derived(
    transaction.creator_id &&
      authStore.user?.id &&
      transaction.creator_id !== "00000000-0000-0000-0000-000000000000" &&
      transaction.creator_id !== authStore.user.id,
  );

  // Get icon color based on type
  const iconClass = $derived(
    isTransfer
      ? "bg-blue-500/10 text-blue-500"
      : isIncome
        ? "bg-emerald-500/10 text-emerald-500"
        : "bg-red-500/10 text-red-500",
  );

  const amountClass = $derived(
    isTransfer
      ? "text-blue-500"
      : isIncome
        ? "text-emerald-500"
        : "text-foreground",
  );

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  }
</script>

<button
  type="button"
  class="w-full flex items-center gap-3 py-3 group hover:bg-surface/50 -mx-2 px-2 rounded-xl transition-colors cursor-pointer text-left"
  {onclick}
>
  <div
    class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 {iconClass}"
  >
    {#if isTransfer}
      <!-- Transfer icon -->
      <svg
        class="w-5 h-5"
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
        class="w-5 h-5"
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
        class="w-5 h-5"
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

  <!-- Content - takes available space with proper truncation -->
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2">
      <h4 class="text-sm font-medium text-foreground truncate">
        {transaction.name}
      </h4>
      {#if transaction.category}
        <span
          class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-surface border border-border text-muted shrink-0"
        >
          <span class="shrink-0">{transaction.category.icon || ""}</span>
          <span class="truncate max-w-12">{transaction.category.name}</span>
        </span>
      {/if}
    </div>
    <p class="text-xs text-muted truncate">
      {#if showDate}
        {formatDate(transaction.date)}
      {/if}
      {#if showDate && showTime}
        •
      {/if}
      {#if showTime}
        {formatTime(transaction.date)}
      {/if}

      {#if createdByOther}
        • <span class="text-primary font-medium"
          >by {transaction.creator_name}</span
        >
      {/if}
      {#if isTransfer && transaction.related_pocket}
        • → {transaction.related_pocket.name}
      {:else if transaction.pocket}
        • {transaction.pocket.name}
      {/if}
    </p>
  </div>

  <!-- Amount - fixed width, always visible -->
  <div class="text-right shrink-0 pl-2">
    <span class="text-sm font-semibold {amountClass} whitespace-nowrap">
      {#if privacyStore.hideAmounts}
        ••••
      {:else}
        {isIncome ? "+" : isTransfer ? "" : "-"}{formatCurrency(
          transaction.amount_cents,
          currency,
        )}
      {/if}
    </span>
    {#if transaction.fee_cents && transaction.fee_cents > 0}
      <p class="text-xs text-muted whitespace-nowrap">
        Fee: {formatCurrency(transaction.fee_cents, currency)}
      </p>
    {/if}
  </div>
</button>
