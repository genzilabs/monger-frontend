/**
 * Pockets API service
 */

import { apiClient } from './client';
import type {
	Pocket,
	PocketListResponse,
	CreatePocketRequest,
	UpdatePocketRequest,
	SetVaultRequest,
	ReconcileRequest,
	MessageResponse
} from '$lib/types';

export const pocketsApi = {
	/**
	 * List all pockets in a book
	 */
	listByBook(bookId: string) {
		return apiClient.get<PocketListResponse>(`/books/${bookId}/pockets`, true);
	},

	/**
	 * Get a pocket by ID
	 */
	get(id: string) {
		return apiClient.get<Pocket>(`/pockets/${id}`, true);
	},

	/**
	 * Create a new pocket in a book
	 */
	create(bookId: string, data: CreatePocketRequest) {
		return apiClient.post<Pocket>(`/books/${bookId}/pockets`, data, true);
	},

	/**
	 * Update a pocket
	 */
	update(id: string, data: UpdatePocketRequest) {
		return apiClient.patch<Pocket>(`/pockets/${id}`, data, true);
	},

	/**
	 * Delete a pocket
	 */
	delete(id: string) {
		return apiClient.delete(`/pockets/${id}`, true);
	},

	/**
	 * Set vault (bank account) data for a pocket
	 */
	setVault(id: string, data: SetVaultRequest) {
		return apiClient.post<MessageResponse>(`/pockets/${id}/vault`, data, true);
	},

	/**
	 * Reconcile pocket balance
	 */
	reconcile(id: string, data: ReconcileRequest) {
		return apiClient.post<MessageResponse>(`/pockets/${id}/reconcile`, data, true);
	}
};
