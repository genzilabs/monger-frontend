<script lang="ts">
  import type { TransactionFormState } from "./transactionForm.svelte";
  import { TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-svelte";

  let { form }: { form: TransactionFormState } = $props();
</script>

<div class="flex p-1 bg-muted/30 rounded-full ring-1 ring-border/50 shrink-0" role="tablist">
  <button
    role="tab"
    aria-label="Pemasukan"
    title="Pemasukan"
    aria-selected={form.type === "income"}
    class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-all rounded-full {form.type === 'income' ? 'bg-background text-emerald-500 shadow-sm' : 'text-muted hover:text-foreground'}"
    onclick={() => (form.type = "income")}
  >
    <TrendingUp size={16} class="shrink-0" />
    {#if form.type === 'income'}
      <span class="whitespace-nowrap">Pemasukan</span>
    {/if}
  </button>
  <button
    role="tab"
    aria-label="Pengeluaran"
    title="Pengeluaran"
    aria-selected={form.type === "expense"}
    class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-all rounded-full {form.type === 'expense' ? 'bg-background text-red-500 shadow-sm' : 'text-muted hover:text-foreground'}"
    onclick={() => (form.type = "expense")}
  >
    <TrendingDown size={16} class="shrink-0" />
    {#if form.type === 'expense'}
      <span class="whitespace-nowrap">Pengeluaran</span>
    {/if}
  </button>
  <button
    role="tab"
    aria-label="Transfer"
    title="Transfer"
    aria-selected={form.type === "transfer"}
    class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-all rounded-full {form.type === 'transfer' ? 'bg-background text-primary shadow-sm' : 'text-muted hover:text-foreground'}"
    onclick={() => (form.type = "transfer")}
  >
    <ArrowRightLeft size={16} class="shrink-0" />
    {#if form.type === 'transfer'}
      <span class="whitespace-nowrap">Transfer</span>
    {/if}
  </button>
</div>
