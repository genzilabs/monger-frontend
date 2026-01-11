<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { TransactionItem } from '$lib/components/dashboard';
	import { TransactionDetailSheet, EditTransactionModal } from '$lib/components/modals';
	import { booksStore } from '$lib/stores';
	import { transactionsApi, type ListByBookOptions } from '$lib/api/transactions';
	import type { Transaction } from '$lib/types/transaction';
	import { untrack } from 'svelte';

	// State
	let transactions = $state<Transaction[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let hasMore = $state(true);

	// Filters
	let searchQuery = $state('');
	let activeFilter = $state<'all' | 'income' | 'expense'>('all');
	let offset = $state(0);
	const limit = 20;

	// Track loaded book to prevent duplicate fetches
	let loadedBookId = $state<string | null>(null);

	// Debounce timer for search
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Transaction detail sheet
	let selectedTransaction = $state<Transaction | null>(null);
	let showDetailSheet = $state(false);

	// Edit modal
	let showEditModal = $state(false);

	function openDetail(tx: Transaction) {
		selectedTransaction = tx;
		showDetailSheet = true;
	}

	function closeDetail() {
		showDetailSheet = false;
	}

	function handleEdit(tx: Transaction) {
		selectedTransaction = tx;
		showDetailSheet = false;
		showEditModal = true;
	}

	function handleTransactionUpdated() {
		loadTransactions(true);
	}

	function handleTransactionDeleted() {
		loadTransactions(true);
	}

	async function loadTransactions(reset = false) {
		const activeBook = booksStore.activeBook;
		if (!activeBook) return;

		if (reset) {
			offset = 0;
			transactions = [];
			hasMore = true;
		}

		isLoading = true;
		error = null;

		try {
			const options: ListByBookOptions = {
				limit,
				offset,
				search: searchQuery || undefined,
				type: activeFilter !== 'all' ? activeFilter : undefined
			};

			const result = await transactionsApi.listByBook(activeBook.id, options);

			if (result.data) {
				const newTxs = result.data || [];
				if (reset) {
					transactions = newTxs;
				} else {
					transactions = [...transactions, ...newTxs];
				}
				hasMore = newTxs.length === limit;
				offset += newTxs.length;
			} else if (result.error) {
				error = result.error.error;
			}
		} catch (e: any) {
			error = e.message || 'Failed to load transactions';
		} finally {
			isLoading = false;
		}
	}

	function handleSearch(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchQuery = value;
		
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			loadTransactions(true);
		}, 300);
	}

	function handleFilterChange(filter: 'all' | 'income' | 'expense') {
		activeFilter = filter;
		loadTransactions(true);
	}

	function loadMore() {
		if (!isLoading && hasMore) {
			loadTransactions(false);
		}
	}

	// Load when active book changes (only when book ID actually changes)
	$effect(() => {
		const currentBookId = booksStore.activeBook?.id ?? null;
		
		// Only reload if the book ID changed
		if (currentBookId !== untrack(() => loadedBookId)) {
			loadedBookId = currentBookId;
			if (currentBookId) {
				untrack(() => loadTransactions(true));
			}
		}
	});
</script>

<svelte:head>
	<title>Transactions - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-4">
	<!-- Header -->
	<div>
		<h1 class="text-2xl font-bold text-foreground">Transactions</h1>
		<p class="text-secondary">
			{#if booksStore.activeBook}
				All transactions in {booksStore.activeBook.name}
			{:else}
				Select a book to view transactions
			{/if}
		</p>
	</div>

	{#if booksStore.activeBook}
		<!-- Search Bar -->
		<div class="relative">
			<svg 
				class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" 
				fill="none" 
				viewBox="0 0 24 24" 
				stroke="currentColor" 
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<input
				type="text"
				placeholder="Search transactions..."
				value={searchQuery}
				oninput={handleSearch}
				class="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
			/>
		</div>

		<!-- Filter Tabs -->
		<div class="flex gap-2">
			<button
				onclick={() => handleFilterChange('all')}
				class="px-4 py-2 rounded-full text-sm font-medium transition-all
					{activeFilter === 'all' 
						? 'bg-primary text-white' 
						: 'bg-surface text-secondary hover:bg-border'}"
			>
				All
			</button>
			<button
				onclick={() => handleFilterChange('income')}
				class="px-4 py-2 rounded-full text-sm font-medium transition-all
					{activeFilter === 'income' 
						? 'bg-emerald-500 text-white' 
						: 'bg-surface text-secondary hover:bg-border'}"
			>
				Income
			</button>
			<button
				onclick={() => handleFilterChange('expense')}
				class="px-4 py-2 rounded-full text-sm font-medium transition-all
					{activeFilter === 'expense' 
						? 'bg-red-500 text-white' 
						: 'bg-surface text-secondary hover:bg-border'}"
			>
				Expense
			</button>
		</div>

		<!-- Transaction List -->
		<Card class="p-4">
			{#if isLoading && transactions.length === 0}
				<!-- Loading State -->
				<div class="space-y-3">
					{#each Array(5) as _}
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
				</div>
			{:else if error}
				<!-- Error State -->
				<div class="py-10 text-center">
					<div class="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<p class="text-red-600 mb-2">{error}</p>
					<button 
						onclick={() => loadTransactions(true)}
						class="text-primary font-medium hover:underline"
					>
						Try again
					</button>
				</div>
			{:else if transactions.length === 0}
				<!-- Empty State -->
				<div class="py-10 text-center">
					<div class="w-12 h-12 mx-auto mb-3 bg-surface rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
						</svg>
					</div>
					<p class="text-muted text-sm">
						{#if searchQuery}
							No transactions found for "{searchQuery}"
						{:else}
							No transactions yet
						{/if}
					</p>
				</div>
			{:else}
				<!-- Transaction List -->
				<div class="space-y-1">
					{#each transactions as tx (tx.id)}
						<TransactionItem 
							transaction={tx} 
							currency={booksStore.activeBook?.base_currency}
							onclick={() => openDetail(tx)}
						/>
					{/each}
				</div>

				<!-- Load More -->
				{#if hasMore}
					<div class="pt-4 text-center">
						<button
							onclick={loadMore}
							disabled={isLoading}
							class="px-6 py-2 text-sm font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
						>
							{#if isLoading}
								Loading...
							{:else}
								Load More
							{/if}
						</button>
					</div>
				{/if}
			{/if}
		</Card>
	{:else}
		<!-- Loading Skeleton when books not yet initialized -->
		<div class="space-y-4">
			<!-- Search skeleton -->
			<div class="h-12 bg-surface rounded-xl animate-pulse"></div>
			
			<!-- Filter tabs skeleton -->
			<div class="flex gap-2">
				<div class="w-16 h-9 bg-surface rounded-full animate-pulse"></div>
				<div class="w-20 h-9 bg-surface rounded-full animate-pulse"></div>
				<div class="w-20 h-9 bg-surface rounded-full animate-pulse"></div>
			</div>

			<!-- Transaction list skeleton -->
			<Card class="p-4">
				<div class="space-y-3">
					{#each Array(5) as _}
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
				</div>
			</Card>
		</div>
	{/if}
</div>

<!-- Transaction Detail Sheet -->
<TransactionDetailSheet
	transaction={selectedTransaction}
	currency={booksStore.activeBook?.base_currency}
	open={showDetailSheet}
	onClose={closeDetail}
	onEdit={handleEdit}
	onDeleted={handleTransactionDeleted}
/>

<!-- Edit Transaction Modal -->
<EditTransactionModal
	transaction={selectedTransaction}
	open={showEditModal}
	onClose={() => showEditModal = false}
	onSaved={handleTransactionUpdated}
/>
