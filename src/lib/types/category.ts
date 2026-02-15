export interface Category {
	id: string;
	user_id?: string;
	book_id: string;
	name: string;
	icon?: string;
	type: 'income' | 'expense';
	is_default: boolean;
	version: number;
	created_at: string;
	subcategories?: Subcategory[];
}

export interface Subcategory {
	id: string;
	category_id: string;
	name: string;
	created_at: string;
}

export interface CreateCategoryRequest {
	name: string;
	icon?: string;
	type: 'income' | 'expense';
}

export interface UpdateCategoryRequest {
	name?: string;
	icon?: string;
	version: number;
}

export interface CreateSubcategoryRequest {
	name: string;
}
