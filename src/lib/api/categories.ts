import { apiClient as client } from './client';
import type { 
	Category, 
	Subcategory, 
	CreateCategoryRequest, 
	UpdateCategoryRequest, 
	CreateSubcategoryRequest 
} from '$lib/types/category';

interface CategoriesResponse {
	categories: Category[];
}

export const categoriesApi = {
	// List all categories for a book
	list: (bookId: string) => 
		client.get<CategoriesResponse>(`/books/${bookId}/categories`, true),

	// List categories by type
	listByType: (bookId: string, type: 'income' | 'expense') =>
		client.get<CategoriesResponse>(`/books/${bookId}/categories/by-type?type=${type}`, true),

	// Create a new category
	create: (bookId: string, data: CreateCategoryRequest) =>
		client.post<Category>(`/books/${bookId}/categories`, data, true),

	// Update a category
	update: (id: string, data: UpdateCategoryRequest) =>
		client.patch<Category>(`/categories/${id}`, data, true),

	// Delete a category
	delete: (id: string) =>
		client.delete<void>(`/categories/${id}`, true),

	// Create a subcategory
	createSubcategory: (categoryId: string, data: CreateSubcategoryRequest) =>
		client.post<Subcategory>(`/categories/${categoryId}/subcategories`, data, true),

	// Update a subcategory
	updateSubcategory: (id: string, data: CreateSubcategoryRequest) =>
		client.patch<Subcategory>(`/subcategories/${id}`, data, true),

	// Delete a subcategory
	deleteSubcategory: (id: string) =>
		client.delete<void>(`/subcategories/${id}`, true),
};
