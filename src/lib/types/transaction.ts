import type { Category, Subcategory } from './category';
import type { Pocket } from './book';

export interface Transaction {
	id: string;
	pocket_id: string;
	name: string;
	amount_cents: number;
	type: 'income' | 'expense' | 'transfer';
	date: string;
	description?: string;
	category_id?: string;
	subcategory_id?: string;
	transfer_id?: string;
	related_transaction_id?: string;
	is_source?: boolean;
	fee_cents?: number;
	transfer_fee_cents?: number;
	transfer_amount_cents?: number;
	related_pocket_id?: string;
	source_pocket?: Pocket;
	dest_pocket?: Pocket;
	created_at: string;
	updated_at: string;
	// Populated for display (optional)
	category?: Category;
	subcategory?: Subcategory;
	related_pocket?: Pocket;
	pocket?: Pocket;
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
