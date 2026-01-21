import { apiClient as client } from './client';
import type { CreateTransactionRequest, CreateTransferRequest, UpdateTransactionRequest, Transaction } from '$lib/types/transaction';

export interface ListByBookOptions {
	limit?: number;
	offset?: number;
	search?: string;
	type?: 'income' | 'expense' | 'transfer';
}

export interface MonthlySummary {
	total_income: number;
	total_expense: number;
	month: number;
	year: number;
}

export interface DailyBreakdown {
	date: string;
	income: number;
	expense: number;
}

export interface MonthlySummaryResponse {
	summary: MonthlySummary;
	daily: DailyBreakdown[];
}

export interface CategoryBreakdown {
	category_id: string | null;
	category_name: string;
	category_icon: string;
	amount: number;
	percentage: number;
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

	listByPocket: (pocketId: string, options: ListByBookOptions = {}) => {
		const params = new URLSearchParams();
		params.set('limit', String(options.limit ?? 20));
		params.set('offset', String(options.offset ?? 0));
		if (options.search) params.set('search', options.search);
		if (options.type) params.set('type', options.type);
		return client.get<Transaction[]>(`/pockets/${pocketId}/transactions?${params.toString()}`, true);
	},

	listByBook: (bookId: string, options: ListByBookOptions = {}) => {
		const params = new URLSearchParams();
		params.set('limit', String(options.limit ?? 20));
		params.set('offset', String(options.offset ?? 0));
		if (options.search) params.set('search', options.search);
		if (options.type) params.set('type', options.type);
		return client.get<Transaction[]>(`/books/${bookId}/transactions?${params.toString()}`, true);
	},

	getMonthlySummary: (bookId: string, month: number, year: number) =>
		client.get<MonthlySummaryResponse>(`/books/${bookId}/summary?month=${month}&year=${year}`, true),

	getCategoryBreakdown: (bookId: string, type: 'income' | 'expense', month: number, year: number) =>
		client.get<CategoryBreakdown[]>(`/books/${bookId}/categories/breakdown?type=${type}&month=${month}&year=${year}`, true)
};

