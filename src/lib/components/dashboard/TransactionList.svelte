<script lang="ts">
	import type { Transaction } from '$lib/types/transaction';
	import TransactionItem from './TransactionItem.svelte';

	interface Props {
		transactions: Transaction[];
		currency?: string;
		loading?: boolean;
	}

	let { transactions, currency = 'IDR', loading = false }: Props = $props();
</script>

<div class="space-y-1">
	{#if loading}
		{#each Array(3) as _}
			<div class="flex items-center justify-between py-3 animate-pulse">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-full bg-border"></div>
					<div class="space-y-2">
						<div class="w-24 h-3 bg-border rounded"></div>
						<div class="w-16 h-2 bg-border rounded"></div>
					</div>
				</div>
				<div class="w-20 h-4 bg-border rounded"></div>
			</div>
		{/each}
	{:else if transactions.length === 0}
		<div class="py-10 text-center">
			<p class="text-muted text-sm">No transactions yet.</p>
		</div>
	{:else}
		{#each transactions as tx (tx.id)}
			<TransactionItem transaction={tx} {currency} />
		{/each}
	{/if}
</div>
