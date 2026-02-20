import { transactionsApi, type ListByBookOptions } from '$lib/api/transactions';
import type {
	Transaction,
	CreateTransactionRequest,
	CreateTransferRequest
} from '$lib/types/transaction';
import { toastStore } from './toast.svelte';
import { db } from '$lib/db';
import { networkStatus } from '$lib/sync/networkStatus.svelte';

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

	async function cacheTransactions(transactions: Transaction[]) {
		try {
			if (transactions.length) {
				await db.transactions.bulkPut(JSON.parse(JSON.stringify(transactions)));
			}
		} catch {
			// Dexie failures are non-critical
		}
	}

	async function loadFromCache(bookId: string): Promise<Transaction[]> {
		try {
			const pockets = await db.pockets.where('book_id').equals(bookId).toArray();
			const pocketIds = pockets.map(p => p.id);
			if (pocketIds.length === 0) return [];
			return await db.transactions
				.where('pocket_id')
				.anyOf(pocketIds)
				.reverse()
				.sortBy('updated_at');
		} catch {
			return [];
		}
	}

	return {
		get transactions() { return state.transactions; },
		get isLoading() { return state.isLoading; },
		get isCreating() { return state.isCreating; },
		get error() { return state.error; },
		get hasMore() { return state.hasMore; },

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
					...options
				});

				if (result.error) {
					throw new Error(result.error.error || 'Failed to load transactions');
				}

				if (result.data) {
					const response = result.data;
					const newTransactions = response.transactions || [];

					if (reset) {
						state.transactions = newTransactions;
					} else {
						state.transactions = [...state.transactions, ...newTransactions];
					}

					state.hasMore = response.has_more ?? (newTransactions.length >= state.limit);
					state.offset += newTransactions.length;

					await cacheTransactions(newTransactions);
				}

				return state.transactions;
			} catch (e: any) {
				state.error = e.message || 'Failed to load transactions';
				return [];
			} finally {
				state.isLoading = false;
			}
		},

		async loadByBook(bookId: string, options: ListByBookOptions = {}, reset = true) {
			state.isLoading = true;
			state.error = null;
			state.activeContext = { type: 'book', id: bookId };

			if (reset) {
				state.offset = 0;
				state.transactions = [];
			}

			try {
				if (networkStatus.isOffline) {
					const cached = await loadFromCache(bookId);
					state.transactions = cached;
					state.hasMore = false;
					return cached;
				}

				const result = await transactionsApi.listByBook(bookId, {
					limit: state.limit,
					...options
				});

				if (result.error) {
					throw new Error(result.error.error || 'Failed to load transactions');
				}

				if (result.data) {
					const response = result.data;
					const newTransactions = response.transactions || [];

					if (reset) {
						state.transactions = newTransactions;
					} else {
						state.transactions = [...state.transactions, ...newTransactions];
					}

					state.hasMore = response.has_more ?? (newTransactions.length >= state.limit);
					state.offset += newTransactions.length;

					await cacheTransactions(newTransactions);
				}

				return state.transactions;
			} catch (e: any) {
				if (e.message === 'Network error' || e.message?.includes('fetch')) {
					const cached = await loadFromCache(bookId);
					if (cached.length) {
						state.transactions = cached;
						state.error = null;
						return cached;
					}
				}
				state.error = e.message || 'Failed to load transactions';
				return [];
			} finally {
				state.isLoading = false;
			}
		},

		async refresh() {
			if (!state.activeContext) return;

			if (state.activeContext.type === 'pocket') {
				return this.loadByPocket(state.activeContext.id, {}, true);
			} else {
				return this.loadByBook(state.activeContext.id, {}, true);
			}
		},

		async loadMoreByPocket(pocketId: string) {
			if (!state.hasMore || state.isLoading) return;
			return this.loadByPocket(pocketId, {}, false);
		},

		async createTransaction(data: CreateTransactionRequest) {
			state.isCreating = true;
			state.error = null;

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
				updated_at: new Date().toISOString(),
				version: 0
			};

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

					await cacheTransactions([result.data]);
					toastStore.success('Transaksi berhasil dibuat!');
					return result.data;
				}

				return null;
			} catch (e: any) {
				state.transactions = state.transactions.filter(tx => tx.id !== optimisticId);
				state.error = e.message || 'Failed to create transaction';
				toastStore.error('Gagal membuat transaksi');
				return null;
			} finally {
				state.isCreating = false;
			}
		},

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

		async deleteTransaction(id: string) {
			const previousTransactions = [...state.transactions];
			state.transactions = state.transactions.filter(tx => tx.id !== id);

			try {
				const result = await transactionsApi.delete(id);

				if (result.error) {
					throw new Error(result.error.error || 'Failed to delete transaction');
				}

				try { await db.transactions.delete(id); } catch { /* non-critical */ }
				toastStore.success('Transaksi dihapus');
				return true;
			} catch (e: any) {
				state.transactions = previousTransactions;
				state.error = e.message || 'Failed to delete transaction';
				toastStore.error('Gagal menghapus transaksi');
				return false;
			}
		},

		clearError() {
			state.error = null;
		},

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
