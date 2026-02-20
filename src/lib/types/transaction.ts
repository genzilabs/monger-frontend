import type { Category, Subcategory } from './category';
import type { Pocket } from './book';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
	id: string;
	pocket_id: string;
	name: string;
	amount_cents: number;
	type: TransactionType;
	date: string;
	description?: string;
	category_id?: string;
	subcategory_id?: string;
	transfer_id?: string;
	related_transaction_id?: string;
	is_source?: boolean;
	exclude_from_analytics?: boolean;
	fee_cents?: number;
	transfer_fee_cents?: number;
	transfer_amount_cents?: number;
	related_pocket_id?: string;
	source_pocket?: Pocket;
	dest_pocket?: Pocket;
	created_at: string;
	updated_at: string;
	version: number;
	// Populated for display (optional)
	category?: Category;
	subcategory?: Subcategory;
	related_pocket?: Pocket;
	pocket?: Pocket;
	pocket_book_owner_name?: string;
	related_pocket_book_owner_name?: string;
	creator_id?: string;
	creator_name?: string;
}

export interface CreateTransactionRequest {
	pocket_id: string;
	name: string;
	amount_cents: number;
	type: 'income' | 'expense';
	date?: string;
	description?: string;
	category_id?: string;
	subcategory_id?: string;
}

export interface UpdateTransactionRequest {
	name: string;
	amount_cents: number;
	date?: string;
	description?: string;
	category_id?: string;
	subcategory_id?: string;
	fee_cents?: number;
	related_pocket_id?: string;
	pocket_id?: string;
	exclude_from_analytics?: boolean;
	version: number;
}

export interface CreateTransferRequest {
	from_pocket_id: string;
	to_pocket_id: string;
	name: string;
	amount_cents: number;
	fee_cents?: number;
	date: string;
	description?: string;
}

