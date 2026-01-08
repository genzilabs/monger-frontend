/**
 * Books API service
 */

import { apiClient } from './client';
import type {
	Book,
	BookListResponse,
	CreateBookRequest,
	UpdateBookRequest
} from '$lib/types';

export const booksApi = {
	/**
	 * List all books for the current user
	 */
	list() {
		return apiClient.get<BookListResponse>('/books', true);
	},

	/**
	 * Get a book by ID
	 */
	get(id: string) {
		return apiClient.get<Book>(`/books/${id}`, true);
	},

	/**
	 * Create a new book
	 */
	create(data: CreateBookRequest) {
		return apiClient.post<Book>('/books', data, true);
	},

	/**
	 * Update a book
	 */
	update(id: string, data: UpdateBookRequest) {
		return apiClient.patch<Book>(`/books/${id}`, data, true);
	},

	/**
	 * Delete a book
	 */
	delete(id: string) {
		return apiClient.delete(`/books/${id}`, true);
	}
};
