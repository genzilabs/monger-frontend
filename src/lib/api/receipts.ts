import { apiClient as client } from './client';
import type { Transaction } from '$lib/types/transaction';

export interface ReceiptItem {
	name: string;
	quantity: number;
	price_cents: number;
}

export interface ParsedReceiptData {
	merchant_name: string;
	description?: string;
	date: string;
	total_cents: number;
	currency: string;
	items: ReceiptItem[];
	suggested_category: string;
	confidence: number;
	raw_text?: string;
}

export type ReceiptStatus = 'pending' | 'parsed' | 'confirmed' | 'failed';
export type ReceiptSource = 'app' | 'telegram' | 'whatsapp';

export interface ReceiptScan {
	id: string;
	user_id: string;
	book_id: string;
	image_url?: string;
	parsed_data?: ParsedReceiptData;
	status: ReceiptStatus;
	source: ReceiptSource;
	transaction_id?: string;
	error_message?: string;
	created_at: string;
	updated_at: string;
}

export interface ScanReceiptRequest {
	book_id: string;
	image: string;
	mime_type?: string;
	source?: ReceiptSource;
	context?: string; // User instructions like "only count my items"
}

export interface ConfirmReceiptRequest {
	pocket_id: string;
	name: string;
	amount_cents: number;
	type: 'income' | 'expense';
	category_id?: string;
	subcategory_id?: string;
	date?: string;
	description?: string;
}

export interface ReceiptListResponse {
	receipts: ReceiptScan[];
	limit: number;
	offset: number;
}

export const receiptsApi = {
	scan: (data: ScanReceiptRequest) =>
		client.post<ReceiptScan>('/receipts/scan', data, true),

	getById: (id: string) =>
		client.get<ReceiptScan>(`/receipts/${id}`, true),

	confirm: (id: string, data: ConfirmReceiptRequest) =>
		client.post<Transaction>(`/receipts/${id}/confirm`, data, true),

	list: (options: { limit?: number; offset?: number } = {}) => {
		const params = new URLSearchParams();
		params.set('limit', String(options.limit ?? 20));
		if (options.offset) params.set('offset', String(options.offset));
		return client.get<ReceiptListResponse>(`/receipts?${params.toString()}`, true);
	}
};
