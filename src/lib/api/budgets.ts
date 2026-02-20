import { apiClient } from './client';
import type { ApiResult } from '$lib/types';
import type {
	Budget,
	BudgetsListResponse,
	CreateBudgetRequest,
	UpdateBudgetRequest
} from '$lib/types/budget';

export const budgetsApi = {
	create(bookId: string, data: CreateBudgetRequest): Promise<ApiResult<Budget>> {
		return apiClient.post<Budget>(`/books/${bookId}/budgets`, data, true);
	},

	listByBook(bookId: string): Promise<ApiResult<BudgetsListResponse>> {
		return apiClient.get<BudgetsListResponse>(`/books/${bookId}/budgets`, true);
	},

	getById(id: string): Promise<ApiResult<Budget>> {
		return apiClient.get<Budget>(`/budgets/${id}`, true);
	},

	update(id: string, data: UpdateBudgetRequest): Promise<ApiResult<Budget>> {
		return apiClient.patch<Budget>(`/budgets/${id}`, data, true);
	},

	delete(id: string): Promise<ApiResult<void>> {
		return apiClient.delete<void>(`/budgets/${id}`, true);
	}
};
