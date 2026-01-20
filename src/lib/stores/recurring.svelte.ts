import { recurringApi } from '$lib/api/recurring';
import type { RecurringTransaction, CreateRecurringTransactionRequest, UpdateRecurringTransactionRequest } from '$lib/types/recurring';
import { toastStore } from './toast.svelte';

interface RecurringState {
	transactions: RecurringTransaction[];
	isLoading: boolean;
	error: string | null;
}

function createRecurringStore() {
	let state = $state<RecurringState>({
		transactions: [],
		isLoading: false,
		error: null
	});

	return {
		get transactions() { return state.transactions; },
		get isLoading() { return state.isLoading; },
		get error() { return state.error; },

		async load() {
			state.isLoading = true;
			state.error = null;
			try {
				const res = await recurringApi.list();
				if (res.data) {
					state.transactions = res.data;
				}
			} catch (err: any) {
				state.error = err.message || 'Failed to load recurring transactions';
			} finally {
				state.isLoading = false;
			}
		},

		async create(data: CreateRecurringTransactionRequest) {
			state.isLoading = true;
			try {
				const res = await recurringApi.create(data);
				if (res.data) {
					state.transactions = [res.data, ...state.transactions];
                    toastStore.success('Transaksi berulang berhasil dibuat');
                    return res.data;
				}
			} catch (err: any) {
                const msg = err.message || 'Failed to create recurring transaction';
				state.error = msg;
                toastStore.error(msg);
			} finally {
				state.isLoading = false;
			}
            return null;
		},

        async update(id: string, data: UpdateRecurringTransactionRequest) {
            state.isLoading = true;
            try {
                const res = await recurringApi.update(id, data);
                if (res.data) {
                    state.transactions = state.transactions.map(t => t.id === id ? res.data! : t);
                    toastStore.success('Transaksi berulang berhasil diperbarui');
                    return res.data;
                }
            } catch (err: any) {
                const msg = err.message || 'Failed to update recurring transaction';
                state.error = msg;
                toastStore.error(msg);
            } finally {
                state.isLoading = false;
            }
            return null;
        },

        async delete(id: string) {
            // Optimistic update
            const original = [...state.transactions];
            state.transactions = state.transactions.filter(t => t.id !== id);

            try {
                await recurringApi.delete(id);
                toastStore.success('Transaksi berulang dihapus');
                return true;
            } catch (err: any) {
                // Revert
                state.transactions = original;
                const msg = err.message || 'Failed to delete recurring transaction';
                state.error = msg;
                toastStore.error(msg);
                return false;
            }
        }
	};
}

export const recurringStore = createRecurringStore();
