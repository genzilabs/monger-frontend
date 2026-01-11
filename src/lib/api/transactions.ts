import { apiClient as client } from './client';
import type { CreateTransactionRequest, CreateTransferRequest, UpdateTransactionRequest, Transaction } from '$lib/types/transaction';

export interface ListByBookOptions {
	limit?: number;
	offset?: number;
	search?: string;
	type?: 'income' | 'expense' | 'transfer';
}

export const transactionsApi = {
	create: (data: CreateTransactionRequest) => 
		client.post<Transaction>('/transactions', data, true),
	
	getById: (id: string) =>
		client.get<Transaction>(`/transactions/${id}`, true),

	update: (id: string, data: UpdateTransactionRequest) =>
		client.patch<Transaction>(`/transactions/${id}`, data, true),

	delete: (id: string) =>
		client.delete<void>(`/transactions/${id}`, true),
	
	transfer: (data: CreateTransferRequest) =>
		client.post<{ message: string }>('/transfers', data, true),

	listByPocket: (pocketId: string, limit = 20, offset = 0) =>
		client.get<Transaction[]>(`/pockets/${pocketId}/transactions?limit=${limit}&offset=${offset}`, true),

	listByBook: (bookId: string, options: ListByBookOptions = {}) => {
		const params = new URLSearchParams();
		params.set('limit', String(options.limit ?? 20));
		params.set('offset', String(options.offset ?? 0));
		if (options.search) params.set('search', options.search);
		if (options.type) params.set('type', options.type);
		return client.get<Transaction[]>(`/books/${bookId}/transactions?${params.toString()}`, true);
	}
};

