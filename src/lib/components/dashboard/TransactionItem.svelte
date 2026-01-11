<script lang="ts">
	import type { Transaction } from '$lib/types/transaction';
	import { formatCurrency } from '$lib/utils/currency';

	interface Props {
		transaction: Transaction;
		currency?: string;
		onclick?: () => void;
	}

	let { transaction, currency = 'IDR', onclick }: Props = $props();

	const isIncome = $derived(transaction.type === 'income');
	const isTransfer = $derived(transaction.type === 'transfer');
	
	// Get icon color based on type
	const iconClass = $derived(
		isTransfer 
			? 'bg-blue-500/10 text-blue-500' 
			: isIncome 
				? 'bg-emerald-500/10 text-emerald-500' 
				: 'bg-red-500/10 text-red-500'
	);
	
	const amountClass = $derived(
		isTransfer
			? 'text-blue-500'
			: isIncome 
				? 'text-emerald-500' 
				: 'text-foreground'
	);
</script>

<button
	type="button"
	class="w-full flex items-center justify-between py-3 group hover:bg-surface/50 -mx-2 px-2 rounded-xl transition-colors cursor-pointer text-left"
	onclick={onclick}
>
	<div class="flex items-center gap-3">
		<div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 {iconClass}">
			{#if isTransfer}
				<!-- Transfer icon -->
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
				</svg>
			{:else if isIncome}
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
				</svg>
			{:else}
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
				</svg>
			{/if}
		</div>
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				<h4 class="text-sm font-medium text-foreground truncate">{transaction.name}</h4>
				{#if transaction.category}
					<span class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-surface border border-border text-muted shrink-0">
						{transaction.category.icon || '📁'} {transaction.category.name}
					</span>
				{/if}
			</div>
			<p class="text-xs text-muted truncate">
				{new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
				{#if isTransfer && transaction.related_pocket}
					• → {transaction.related_pocket.name}
				{:else if transaction.pocket}
					• {transaction.pocket.name}
				{/if}
			</p>
		</div>
	</div>
	<span class="text-sm font-semibold ml-2 shrink-0 {amountClass}">
		{isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(transaction.amount_cents, currency)}
	</span>
</button>
