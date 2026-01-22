<script lang="ts">
  import { recurringStore } from "$lib/stores/recurring.svelte";
  import RecurringTransactionItem from "./RecurringTransactionItem.svelte";

  let { onEdit, onDelete } = $props<{
    onEdit: (t: any) => void;
    onDelete: (id: string) => void;
  }>();
</script>

<!-- Only shows the list - empty states handled by page -->
<div class="space-y-3">
  {#each recurringStore.transactions as transaction (transaction.id)}
    <RecurringTransactionItem {transaction} {onEdit} {onDelete} />
  {/each}
</div>
