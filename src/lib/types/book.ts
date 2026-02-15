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
	month_start_day: number;
	version: number;
	created_at: string;
	updated_at: string;
	member_count: number;
}

export interface Pocket {
	id: string;
	book_id: string;
	name: string;
	type_slug: string;
	icon_slug: string;
	color: string;
	balance_cents: number;
	is_frozen: boolean;
	role: "owner" | "editor" | "viewer";
	created_at: string;
	updated_at: string;
	version: number;
	vault?: Vault;
	currency?: string;
}

export interface PocketType {
	id: string;
	user_id?: string;
	name: string;
	slug: string;
	icon_slug: string;
	is_system: boolean;
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
	version: number;
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

export interface CreatePocketTypeRequest {
	name: string;
	slug: string;
	icon_slug: string;
}

export interface UpdatePocketTypeRequest {
	name: string;
	slug: string;
	icon_slug: string;
}

export interface PocketTypeListResponse {
	types: PocketType[];
}
