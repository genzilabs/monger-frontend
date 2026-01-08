/**
 * Book and Pocket type definitions
 */

export interface Vault {
	bank_name?: string;
	account_number?: string;
	account_holder?: string;
	qris?: string;
}

export interface Book {
	id: string;
	owner_id: string;
	name: string;
	description?: string;
	icon_slug: string;
	base_currency: string;
	version: number;
	created_at: string;
	updated_at: string;
}

export interface Pocket {
	id: string;
	book_id: string;
	name: string;
	type_slug: string;
	icon_slug: string;
	color: string;
	balance_cents: number;
	vault?: Vault;
	is_frozen: boolean;
	created_at: string;
	updated_at: string;
}

// Request types
export interface CreateBookRequest {
	name: string;
	description?: string;
	icon_slug?: string;
	base_currency?: string;
}

export interface UpdateBookRequest {
	name?: string;
	description?: string;
	icon_slug?: string;
	base_currency?: string;
	version: number;
}

export interface CreatePocketRequest {
	name: string;
	type_slug?: string;
	icon_slug?: string;
	color?: string;
	balance?: number;
}

export interface UpdatePocketRequest {
	name?: string;
	type_slug?: string;
	icon_slug?: string;
	color?: string;
	is_frozen?: boolean;
}

export interface SetVaultRequest {
	bank_name?: string;
	account_number?: string;
	account_holder?: string;
	qris?: string;
}

export interface ReconcileRequest {
	new_balance: number;
}

// Response types
export interface BookListResponse {
	books: Book[];
	total: number;
}

export interface PocketListResponse {
	pockets: Pocket[];
	total: number;
}
