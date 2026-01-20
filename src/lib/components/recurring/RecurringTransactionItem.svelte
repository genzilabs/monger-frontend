<script lang="ts">
  import type { RecurringTransaction } from "$lib/types/recurring";
  import { formatCurrency } from "$lib/utils/currency";
  import { CalendarIcon, RepeatIcon, TrashIcon, EditIcon } from "$lib/icons";

  let { transaction, onEdit, onDelete } = $props<{
    transaction: RecurringTransaction;
    onEdit: (t: RecurringTransaction) => void;
    onDelete: (id: string) => void;
  }>();

  const frequencyLabels: Record<string, string> = {
    daily: "Harian",
    weekly: "Mingguan",
    monthly: "Bulanan",
    yearly: "Tahunan",
  };

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
</script>

<div class="p-4 bg-surface rounded-xl border border-border hover:border-primary/20 transition-colors group">
  <div class="flex items-start justify-between gap-4">
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0">
        <RepeatIcon size={20} class="text-primary" />
      </div>
      <div>
        <h3 class="font-bold text-foreground line-clamp-1">{transaction.name}</h3>
        <p class="text-sm text-secondary flex items-center gap-1 mt-0.5">
          <span class="capitalize">{frequencyLabels[transaction.frequency]}</span>
          <span class="text-muted">•</span>
          <span class="text-muted">Next: {formatDate(transaction.next_date)}</span>
        </p>
      </div>
    </div>
    <div class="text-right">
      <p class="font-bold {transaction.type === 'expense' ? 'text-error' : transaction.type === 'income' ? 'text-success' : 'text-foreground'}">
        {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}
        {formatCurrency(transaction.amount_cents, "IDR")}
      </p>
      <div class="flex items-center justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
            class="p-1.5 text-muted hover:text-primary transition-colors rounded-md hover:bg-surface-elevated"
            onclick={() => onEdit(transaction)}
            title="Edit"
        >
            <EditIcon size={14} />
        </button>
        <button 
            class="p-1.5 text-muted hover:text-error transition-colors rounded-md hover:bg-surface-elevated"
            onclick={() => onDelete(transaction.id)}
            title="Hapus"
        >
            <TrashIcon size={14} />
        </button>
      </div>
    </div>
  </div>
</div>
