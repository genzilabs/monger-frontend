<script lang="ts">
  import { booksStore, budgetsStore, categoriesStore } from "$lib/stores";
  import { formatCurrency } from "$lib/utils/currency";
  import { PieChartIcon } from "$lib/icons";
  import { EmptyState } from "$lib/components/ui";
  import { Plus, AlertTriangle, Trash2 } from "lucide-svelte";
  import CreateBudgetModal from "$lib/components/modals/CreateBudgetModal.svelte";

  let showCreateModal = $state(false);
  let confirmDeleteId = $state<string | null>(null);

  const activeBook = $derived(booksStore.activeBook);

  $effect(() => {
    if (activeBook?.id) {
      budgetsStore.loadBudgets(activeBook.id);
      categoriesStore.load(activeBook.id);
    }
  });

  function getProgressColor(progress: number): string {
    if (progress > 100) return "bg-red-500";
    if (progress >= 80) return "bg-amber-400";
    if (progress >= 50) return "bg-primary";
    return "bg-emerald-400";
  }

  function getProgressBg(progress: number): string {
    if (progress > 100) return "bg-red-500/10";
    if (progress >= 80) return "bg-amber-400/10";
    return "bg-muted/10";
  }

  async function handleDelete(id: string) {
    const success = await budgetsStore.deleteBudget(id);
    if (success) {
      confirmDeleteId = null;
    }
  }
</script>

<svelte:head>
  <title>Anggaran — Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Anggaran</h1>
      <p class="text-secondary">Atur batas pengeluaran per kategori.</p>
    </div>
  </div>

  <button
    onclick={() => (showCreateModal = true)}
    class="w-full border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex items-center justify-center gap-2 group min-h-15"
  >
    <div
      class="w-8 h-8 rounded-full bg-surface-elevated group-hover:bg-primary/10 flex items-center justify-center transition-colors"
    >
      <Plus size={18} class="text-muted group-hover:text-primary" />
    </div>
    <span
      class="text-sm font-semibold text-muted group-hover:text-primary transition-colors"
      >Buat Anggaran Baru</span
    >
  </button>

  {#if !activeBook}
    <EmptyState
      title="Pilih Buku Dulu"
      description="Pilih buku di header dulu ya."
    >
      {#snippet icon()}
        <PieChartIcon size={32} class="text-primary" />
      {/snippet}
    </EmptyState>
  {:else if budgetsStore.isLoading && budgetsStore.budgets.length === 0}
    <div class="flex justify-center py-12">
      <div
        class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"
      ></div>
    </div>
  {:else if budgetsStore.budgets.length === 0}
    <EmptyState
      title="Belum Ada Anggaran"
      description="Mulai atur batas pengeluaran per kategori."
    >
      {#snippet icon()}
        <PieChartIcon size={32} class="text-primary" />
      {/snippet}
    </EmptyState>
  {:else}
    {#if budgetsStore.budgets.length > 0}
      <div class="p-4 bg-surface border border-border rounded-2xl">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-muted">Total Anggaran Bulan Ini</p>
          {#if budgetsStore.overBudgetCount > 0}
            <span
              class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400"
            >
              <AlertTriangle size={12} />
              {budgetsStore.overBudgetCount} melebihi batas
            </span>
          {/if}
        </div>
        <div class="flex items-end justify-between mb-2">
          <p class="text-2xl font-bold text-foreground">
            {formatCurrency(budgetsStore.totalSpent)}
          </p>
          <p class="text-sm text-muted">
            dari {formatCurrency(budgetsStore.totalLimit)}
          </p>
        </div>
        <div class="w-full h-3 bg-muted/20 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 {getProgressColor(
              budgetsStore.totalProgress,
            )}"
            style="width: {Math.min(budgetsStore.totalProgress, 100)}%"
          ></div>
        </div>
      </div>
    {/if}

    <div class="flex flex-col gap-3">
      {#each budgetsStore.budgets as budget (budget.id)}
        <div
          class="p-4 bg-surface border border-border rounded-2xl {budget.is_over_budget
            ? 'border-red-500/30'
            : ''}"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl {getProgressBg(
                  budget.progress,
                )} flex items-center justify-center text-lg"
              >
                {budget.category_icon || "📂"}
              </div>
              <div>
                <p class="font-semibold text-foreground">
                  {budget.category_name}
                </p>
                <p class="text-xs text-muted">
                  Mulai tanggal {budget.start_day} setiap bulan
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              {#if confirmDeleteId === budget.id}
                <button
                  onclick={() => handleDelete(budget.id)}
                  class="text-xs px-2 py-1 bg-red-500 text-white rounded-lg"
                >
                  Hapus
                </button>
                <button
                  onclick={() => (confirmDeleteId = null)}
                  class="text-xs px-2 py-1 text-muted"
                >
                  Batal
                </button>
              {:else}
                <button
                  onclick={() => (confirmDeleteId = budget.id)}
                  class="p-1.5 text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              {/if}
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-muted">Terpakai</span>
              <span
                class="font-medium {budget.is_over_budget
                  ? 'text-red-400'
                  : 'text-foreground'}"
              >
                {formatCurrency(budget.spent_cents)} / {formatCurrency(
                  budget.limit_cents,
                )}
              </span>
            </div>
            <div class="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500 {getProgressColor(
                  budget.progress,
                )}"
                style="width: {Math.min(budget.progress, 100)}%"
              ></div>
            </div>
            {#if budget.is_over_budget}
              <p class="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                Melebihi batas {formatCurrency(
                  budget.spent_cents - budget.limit_cents,
                )}
              </p>
            {:else}
              <p class="text-xs text-muted text-right">
                Sisa {formatCurrency(budget.limit_cents - budget.spent_cents)}
              </p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if activeBook}
  <CreateBudgetModal
    open={showCreateModal}
    onClose={() => (showCreateModal = false)}
    bookId={activeBook.id}
    categories={categoriesStore.categories}
  />
{/if}
