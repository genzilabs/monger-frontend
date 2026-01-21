<script lang="ts">
  import { ArrowUpIcon, ArrowDownIcon, EyeIcon, EyeOffIcon } from "$lib/icons";
  import { privacyStore } from "$lib/stores";
  import { onMount } from "svelte";

  interface Props {
    balance: number;
    income?: number;
    expense?: number;
    currency?: string;
    bookName: string;
    loading?: boolean;
  }

  let {
    balance,
    income = 0,
    expense = 0,
    currency = "IDR",
    bookName,
    loading = false,
  }: Props = $props();

  let isMounted = $state(false);

  onMount(() => {
    isMounted = true;
  });

  function formatMoney(cents: number) {
    if (privacyStore.hideAmounts) return "••••";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }
</script>

<div
  class="w-full bg-surface rounded-2xl border border-border p-5 relative overflow-hidden"
>
  <!-- Abstract background decoration -->
  <div
    class="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
  ></div>

  <div class="relative z-10 flex flex-col gap-4">
    <div>
      <div class="flex items-center justify-between mb-1">
        <p class="text-sm font-medium text-muted flex items-center gap-2">
          Total Nilai Bersih
        </p>
        <button
          onclick={() => privacyStore.toggle()}
          class="text-muted hover:text-primary transition-colors p-1 -mr-1"
          aria-label={privacyStore.hideAmounts
            ? "Tampilkan nominal"
            : "Sembunyikan nominal"}
        >
          {#if privacyStore.hideAmounts}
            <EyeOffIcon size={18} />
          {:else}
            <EyeIcon size={18} />
          {/if}
        </button>
      </div>

      {#if loading || !isMounted}
        <div class="h-9 w-48 bg-border rounded animate-pulse"></div>
      {:else}
        <h1
          class="text-3xl font-bold tracking-tight text-foreground transition-all duration-300"
        >
          {formatMoney(balance)}
        </h1>
      {/if}
    </div>

    <!-- Income / Expense Grid - Monthly -->
    <div class="space-y-2">
      <p class="text-xs font-medium text-muted">Bulan Ini</p>
      <div class="grid grid-cols-2 gap-3">
        <!-- Income -->
        <div class="bg-emerald-500/10 rounded-xl p-3 flex flex-col gap-1">
          <div class="flex items-center gap-1.5">
            <div class="p-1 rounded-full bg-emerald-500/20">
              <ArrowUpIcon class="w-3 h-3 text-emerald-600" />
            </div>
            <span class="text-xs font-medium text-emerald-600">Pemasukan</span>
          </div>
          {#if loading || !isMounted}
            <div
              class="h-6 w-24 bg-current opacity-20 rounded animate-pulse"
            ></div>
          {:else}
            <span class="text-sm font-medium text-foreground"
              >{formatMoney(income)}</span
            >
          {/if}
        </div>

        <!-- Expense -->
        <div class="bg-red-500/10 rounded-xl p-3 flex flex-col gap-1">
          <div class="flex items-center gap-1.5">
            <div class="p-1 rounded-full bg-red-500/20">
              <ArrowDownIcon class="w-3 h-3 text-red-600" />
            </div>
            <span class="text-xs font-medium text-red-600">Pengeluaran</span>
          </div>
          {#if loading || !isMounted}
            <div
              class="h-6 w-24 bg-current opacity-20 rounded animate-pulse"
            ></div>
          {:else}
            <span class="text-sm font-medium text-foreground"
              >{formatMoney(expense)}</span
            >
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
