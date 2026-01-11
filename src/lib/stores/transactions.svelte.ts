import { transactionsApi } from '$lib/api';
import type { CreateTransactionRequest, CreateTransferRequest } from '$lib/types/transaction';

function createTransactionsStore() {
    let _isLoading = $state(false);
    let _error = $state<string | null>(null);

    	return {
		get isLoading() { return _isLoading; },
		get error() { return _error; },

		async createTransaction(data: CreateTransactionRequest) {
			_isLoading = true;
			_error = null;
			try {
				const result = await transactionsApi.create(data);
				if (result.error) throw new Error(result.error.error);
				return result.data;
			} catch (e: any) {
				_error = e.message;
				return null;
			} finally {
				_isLoading = false;
			}
		},

		async createTransfer(data: CreateTransferRequest) {
			_isLoading = true;
			_error = null;
			try {
				const result = await transactionsApi.transfer(data);
				if (result.error) throw new Error(result.error.error);
				return true;
			} catch (e: any) {
				_error = e.message;
				return false;
			} finally {
				_isLoading = false;
			}
		}
	};
}

export const transactionsStore = createTransactionsStore();
