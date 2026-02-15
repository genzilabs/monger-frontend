<script lang="ts">
  import { ResponsiveModal, Button } from "$lib/components/ui";
  import { budgetsStore } from "$lib/stores";
  import type { Category } from "$lib/types/category";
  import type { CreateBudgetRequest } from "$lib/types/budget";

  interface Props {
    open: boolean;
    onClose: () => void;
    bookId: string;
    categories: Category[];
  }

  let { open, onClose, bookId, categories }: Props = $props();

  let categoryId = $state("");
  let limitAmount = $state("");
  let startDay = $state("1");
  let isSubmitting = $state(false);
  let formError = $state<string | null>(null);

  const expenseCategories = $derived(
    categories.filter((c) => c.type === "expense"),
  );

  async function handleSubmit() {
    if (!categoryId) {
      formError = "Pilih kategori";
      return;
    }
    const amount = parseFloat(limitAmount);
    if (!amount || amount <= 0) {
      formError = "Batas nominal harus lebih dari 0";
      return;
    }
    const day = parseInt(startDay);
    if (day < 1 || day > 31) {
      formError = "Tanggal mulai harus antara 1-31";
      return;
    }

    isSubmitting = true;
    formError = null;

    const data: CreateBudgetRequest = {
      category_id: categoryId,
      limit_cents: Math.round(amount * 100),
      start_day: day,
    };

    const result = await budgetsStore.createBudget(bookId, data);
    isSubmitting = false;

    if (result) {
      resetForm();
      onClose();
    } else {
      formError = budgetsStore.error;
    }
  }

  function resetForm() {
    categoryId = "";
    limitAmount = "";
    startDay = "1";
    formError = null;
  }
</script>

<ResponsiveModal {open} onClose={() => { resetForm(); onClose(); }} title="Buat Anggaran Baru">
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="flex flex-col gap-4">
    {#if formError}
      <div class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
        {formError}
      </div>
    {/if}

    <div>
      <label for="budget-category" class="block text-sm font-medium text-foreground mb-1">
        Kategori Pengeluaran
      </label>
      <select
        id="budget-category"
        bind:value={categoryId}
        class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
      >
        <option value="">Pilih kategori...</option>
        {#each expenseCategories as cat}
          <option value={cat.id}>
            {cat.icon || "📂"} {cat.name}
          </option>
        {/each}
      </select>
    </div>

    <div>
      <label for="budget-limit" class="block text-sm font-medium text-foreground mb-1">
        Batas Pengeluaran
      </label>
      <input
        id="budget-limit"
        type="number"
        bind:value={limitAmount}
        placeholder="2000000"
        min="0"
        step="1"
        class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
      />
    </div>

    <div>
      <label for="budget-start" class="block text-sm font-medium text-foreground mb-1">
        Mulai Tanggal
      </label>
      <input
        id="budget-start"
        type="number"
        bind:value={startDay}
        min="1"
        max="31"
        class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
      />
      <p class="text-xs text-muted mt-1">
        Anggaran akan dihitung dari tanggal ini setiap bulan
      </p>
    </div>

    <div class="flex gap-3 pt-2">
      <Button
        variant="secondary"
        class="flex-1"
        onclick={() => { resetForm(); onClose(); }}
      >
        Batal
      </Button>
      <Button variant="primary" class="flex-1" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Buat Anggaran"}
      </Button>
    </div>
  </form>
</ResponsiveModal>
