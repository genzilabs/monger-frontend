import { booksStore, uiStore } from '$lib/stores';
import { transactionsApi, type ListByBookOptions } from '$lib/api/transactions';
import type { Transaction } from '$lib/types/transaction';
import { untrack } from 'svelte';

export function createTransactionListState() {
	let transactions = $state<Transaction[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let hasMore = $state(true);
	let nextCursor = $state<string | undefined>(undefined);
	
	let selectedPocketId = $state<string | null>(null);
	let selectedType = $state<'all' | 'income' | 'expense' | 'transfer'>('all');
	let selectedCategoryId = $state<string | null>(null);
	let searchQuery = $state('');
	let startDate = $state('');
	let endDate = $state('');

	const limit = 50;

	const hasActiveFilters = $derived(
		selectedPocketId !== null ||
		selectedType !== 'all' ||
		selectedCategoryId !== null ||
		searchQuery !== '' ||
		startDate !== '' ||
		endDate !== ''
	);

	async function load(reset = false) {
		const activeBook = booksStore.activeBook;
		if (!activeBook) return;

		if (reset) {
			nextCursor = undefined;
			transactions = [];
			hasMore = true;
		}

		// Don't fetch if already fetching or if we hit the end
		if (isLoading || (!reset && !hasMore)) return;

		isLoading = true;
		error = null;

		try {
			const options: ListByBookOptions = {
				limit,
				cursor: reset ? undefined : nextCursor,
				search: searchQuery || undefined,
				type: selectedType !== 'all' ? selectedType : undefined,
				categoryId: selectedCategoryId || undefined,
				startDate: startDate || undefined,
				endDate: endDate || undefined,
			};

			let result;

			if (selectedPocketId) {
				result = await transactionsApi.listByPocket(selectedPocketId, options);
			} else {
				result = await transactionsApi.listByBook(activeBook.id, options);
			}

			if (result.data) {
				const response = result.data;
				const newTxs = response.transactions || [];

				if (reset) {
					transactions = newTxs;
				} else {
					transactions = [...transactions, ...newTxs];
				}

				nextCursor = response.next_cursor;
				hasMore = response.has_more;
			} else if (result.error) {
				error = result.error.error;
			}
		} catch (e: any) {
			error = e.message || "Gagal memuat transaksi";
		} finally {
			isLoading = false;
		}
	}

	async function loadAllRemaining() {
		// Used for monthly/calendar views that need all data
		while (hasMore && !isLoading && !error) {
			await load(false);
			if (error) break;
			// Small delay to prevent blocking main thread
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	function resetFilters() {
		selectedPocketId = null;
		selectedType = 'all';
		selectedCategoryId = null;
		searchQuery = '';
		startDate = '';
		endDate = '';
	}

	function applyFilters(filters: {
		pocketId: string | null;
		type: "all" | "income" | "expense" | "transfer";
		categoryId: string | null;
		search: string;
		startDate: string;
		endDate: string;
	}) {
		selectedPocketId = filters.pocketId;
		selectedType = filters.type;
		selectedCategoryId = filters.categoryId;
		searchQuery = filters.search;
		startDate = filters.startDate;
		endDate = filters.endDate;
		load(true);
	}

	return {
		get transactions() { return transactions; },
		get isLoading() { return isLoading; },
		get error() { return error; },
		get hasMore() { return hasMore; },
		
		get selectedPocketId() { return selectedPocketId; },
		get selectedType() { return selectedType; },
		get selectedCategoryId() { return selectedCategoryId; },
		get searchQuery() { return searchQuery; },
		get startDate() { return startDate; },
		get endDate() { return endDate; },
		get hasActiveFilters() { return hasActiveFilters; },

		load,
		loadAllRemaining,
		resetFilters,
		applyFilters
	};
}
