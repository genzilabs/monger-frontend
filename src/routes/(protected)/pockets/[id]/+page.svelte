<script lang="ts">
	import { page } from '$app/stores';
	import { transactionsApi } from '$lib/api';
	import { booksStore, uiStore } from '$lib/stores';
	import { formatCurrency } from '$lib/utils/currency';
	import { TransactionList } from '$lib/components/dashboard';
	import type { Transaction, Pocket } from '$lib/types';
	import { onMount } from 'svelte';

	let pocketId = $derived($page.params.id);
	let pocket = $state<Pocket | null>(null);
	let transactions = $state<Transaction[]>([]);
	let isLoading = $state(true);

	onMount(async () => {
		if (!pocketId) return;
		await loadData();
	});

	async function loadData() {
		isLoading = true;
		try {
			// Find pocket in store first to show immediate data
			const storedPocket = booksStore.pockets.find(p => p.id === pocketId);
			if (storedPocket) {
				pocket = storedPocket;
			}

			// If no pocket (refresh/direct link), fetching logic would go here
			// For now, rely on booksStore or assume user navigated from dashboard
			if (!storedPocket && booksStore.activeBook) {
				await booksStore.loadPockets(booksStore.activeBook.id);
				const found = booksStore.pockets.find(p => p.id === pocketId);
				if (found) pocket = found;
			}

			// Fetch transactions
			if (pocketId) {
				const result = await transactionsApi.listByPocket(pocketId);
				if (result.data) {
					transactions = result.data || [];
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>{pocket?.name || 'Pocket'} - Monger</title>
</svelte:head>

<div class="animate-fade-in pb-20">
	<!-- Header -->
	<header class="flex flex-between items-center gap-4 mb-6 sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 -mx-6 px-6">
		<h1 class="text-lg font-bold text-foreground flex-1 truncate">{pocket?.name || 'Pocket Details'}</h1>
	</header>

	{#if pocket}
		<div class="flex flex-col items-center justify-center py-6 mb-8">
			<span class="text-sm text-muted mb-1">Total Balance</span>
			<h2 class="text-4xl font-bold text-foreground mb-4">
				{formatCurrency(pocket.balance_cents, booksStore.activeBook?.base_currency)}
			</h2>
	<div class="flex gap-3">
				<button 
					class="px-6 py-2.5 bg-emerald-500/10 text-emerald-500 font-semibold rounded-full text-sm hover:bg-emerald-500/20 transition-colors"
					onclick={() => uiStore.openTransactionModal('income', pocket?.id)}
				>
					+ Add Income
				</button>
				<button 
					class="px-6 py-2.5 bg-red-500/10 text-red-500 font-semibold rounded-full text-sm hover:bg-red-500/20 transition-colors"
					onclick={() => uiStore.openTransactionModal('expense', pocket?.id)}
				>
					- Add Expense
				</button>
			</div>
		</div>

		<div class="bg-surface rounded-3xl p-6 min-h-[50vh]">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-bold text-foreground">Transactions</h3>
				<button class="text-xs text-primary font-medium">View All</button>
			</div>
			
			<TransactionList {transactions} loading={isLoading} currency={booksStore.activeBook?.base_currency} />
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center h-[50vh]">
			<div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
		</div>
	{/if}
</div>
