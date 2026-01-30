/**
 * Transactions Store - Enterprise-grade state management
 * 
 * Features:
 * - Optimistic updates
 * - Error handling with rollback
 * - Loading states per operation
 * - Transaction list management
 */

import { transactionsApi, type ListByBookOptions } from '$lib/api/transactions';
import type { 
	Transaction, 
	CreateTransactionRequest, 
	CreateTransferRequest
} from '$lib/types/transaction';
import { toastStore } from './toast.svelte';

interface TransactionsState {
	transactions: Transaction[];
	isLoading: boolean;
	isCreating: boolean;
	error: string | null;
	offset: number;
	limit: number;
	hasMore: boolean;
	activeContext: { type: 'book' | 'pocket'; id: string } | null;
}

function createTransactionsStore() {
	let state = $state<TransactionsState>({
		transactions: [],
		isLoading: false,
		isCreating: false,
		error: null,
		offset: 0,
		limit: 20,
		hasMore: true,
		activeContext: null
	});

	return {
		// Getters
		get transactions() { return state.transactions; },
		get isLoading() { return state.isLoading; },
		get isCreating() { return state.isCreating; },
		get error() { return state.error; },
		get hasMore() { return state.hasMore; },

		/**
		 * Load transactions for a pocket
		 */
		async loadByPocket(pocketId: string, options: ListByBookOptions = {}, reset = true) {
			state.isLoading = true;
			state.error = null;
			state.activeContext = { type: 'pocket', id: pocketId };

			if (reset) {
				state.offset = 0;
				state.transactions = [];
			}

			try {
				const result = await transactionsApi.listByPocket(pocketId, {
					limit: state.limit,
					offset: state.offset,
					...options
				});

				if (result.error) {
					throw new Error(result.error.error || 'Failed to load transactions');
				}

				if (result.data) {
					const newTransactions = result.data;
					
					if (reset) {
						state.transactions = newTransactions;
					} else {
						state.transactions = [...state.transactions, ...newTransactions];
					}

					state.hasMore = newTransactions.length >= state.limit;
					state.offset += newTransactions.length;
				}

				return state.transactions;
			} catch (e: any) {
				state.error = e.message || 'Failed to load transactions';
				return [];
			} finally {
				state.isLoading = false;
			}
		},

		/**
		 * Load transactions for a book
		 */
		async loadByBook(bookId: string, options: ListByBookOptions = {}, reset = true) {
			state.isLoading = true;
			state.error = null;
			state.activeContext = { type: 'book', id: bookId };

			if (reset) {
				state.offset = 0;
				state.transactions = [];
			}

			try {
				const result = await transactionsApi.listByBook(bookId, {
					limit: state.limit,
					offset: state.offset,
					...options
				});

				if (result.error) {
					throw new Error(result.error.error || 'Failed to load transactions');
				}

				if (result.data) {
					const newTransactions = result.data;
					
					if (reset) {
						state.transactions = newTransactions;
					} else {
						state.transactions = [...state.transactions, ...newTransactions];
					}

					state.hasMore = newTransactions.length >= state.limit;
					state.offset += newTransactions.length;
				}

				return state.transactions;
			} catch (e: any) {
				state.error = e.message || 'Failed to load transactions';
				return [];
			} finally {
				state.isLoading = false;
			}
		},

		/**
		 * Refresh current transaction list
		 */
		async refresh() {
			if (!state.activeContext) return;

			if (state.activeContext.type === 'pocket') {
				return this.loadByPocket(state.activeContext.id, {}, true);
			} else {
				// For book, we might lose filters if not stored, 
				// but for now simple refresh is better than nothing.
				// Ideally we should store active filters too.
				return this.loadByBook(state.activeContext.id, {}, true);
			}
		},

		/**
		 * Load more transactions (pagination)
		 */
		async loadMoreByPocket(pocketId: string) {
			if (!state.hasMore || state.isLoading) return;
			return this.loadByPocket(pocketId, {}, false);
		},

		/**
		 * Create transaction with optimistic update
		 */
		async createTransaction(data: CreateTransactionRequest) {
			state.isCreating = true;
			state.error = null;

			// Create optimistic transaction
			const optimisticId = `temp-${Date.now()}`;
			const optimisticTx: Transaction = {
				id: optimisticId,
				pocket_id: data.pocket_id,
				name: data.name,
				amount_cents: data.amount_cents,
				type: data.type,
				date: data.date || new Date().toISOString(),
				category_id: data.category_id,
				subcategory_id: data.subcategory_id,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};

			// Optimistically add to list (ensure transactions is an array)
			const currentTxs = Array.isArray(state.transactions) ? state.transactions : [];
			state.transactions = [optimisticTx, ...currentTxs];

			try {
				const result = await transactionsApi.create(data);
				
				if (result.error) {
					throw new Error(result.error.error || 'Failed to create transaction');
				}

				if (result.data) {
					state.transactions = state.transactions.map(tx =>
						tx.id === optimisticId ? result.data! : tx
					);
					toastStore.success('Transaksi berhasil dibuat!');
					return result.data;
				}

				return null;
			} catch (e: any) {
				// Rollback optimistic update
				state.transactions = state.transactions.filter(tx => tx.id !== optimisticId);
				state.error = e.message || 'Failed to create transaction';
				toastStore.error('Gagal membuat transaksi');
				return null;
			} finally {
				state.isCreating = false;
			}
		},

		/**
		 * Create transfer between pockets
		 */
		async createTransfer(data: CreateTransferRequest) {
			state.isCreating = true;
			state.error = null;

			try {
				const result = await transactionsApi.transfer(data);
				
				if (result.error) {
					throw new Error(result.error.error || 'Failed to create transfer');
				}

				toastStore.success('Transfer berhasil!');
				return true;
			} catch (e: any) {
				state.error = e.message || 'Failed to create transfer';
				toastStore.error('Gagal melakukan transfer');
				return false;
			} finally {
				state.isCreating = false;
			}
		},

		/**
		 * Delete transaction with optimistic update
		 */
		async deleteTransaction(id: string) {
			// Store for rollback
			const previousTransactions = [...state.transactions];
			
			// Optimistically remove
			state.transactions = state.transactions.filter(tx => tx.id !== id);

			try {
				const result = await transactionsApi.delete(id);
				
				if (result.error) {
					throw new Error(result.error.error || 'Failed to delete transaction');
				}

				toastStore.success('Transaksi dihapus');
				return true;
			} catch (e: any) {
				// Rollback
				state.transactions = previousTransactions;
				state.error = e.message || 'Failed to delete transaction';
				toastStore.error('Gagal menghapus transaksi');
				return false;
			}
		},

		/**
		 * Clear error
		 */
		clearError() {
			state.error = null;
		},

		/**
		 * Reset store state
		 */
		reset() {
			state.transactions = [];
			state.isLoading = false;
			state.isCreating = false;
			state.error = null;
			state.offset = 0;
			state.hasMore = true;
			state.activeContext = null;
		}
	};
}

export const transactionsStore = createTransactionsStore();
