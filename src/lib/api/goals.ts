import { apiClient } from './client';
import type { ApiResult } from '$lib/types';
import type {
	Goal,
	GoalContribution,
	GoalsListResponse,
	ContributionsListResponse,
	CreateGoalRequest,
	UpdateGoalRequest,
	AddContributionRequest
} from '$lib/types/goal';

export const goalsApi = {
	create(bookId: string, data: CreateGoalRequest): Promise<ApiResult<Goal>> {
		return apiClient.post<Goal>(`/books/${bookId}/goals`, data, true);
	},

	listByBook(bookId: string): Promise<ApiResult<GoalsListResponse>> {
		return apiClient.get<GoalsListResponse>(`/books/${bookId}/goals`, true);
	},

	getById(id: string): Promise<ApiResult<Goal>> {
		return apiClient.get<Goal>(`/goals/${id}`, true);
	},

	update(id: string, data: UpdateGoalRequest): Promise<ApiResult<Goal>> {
		return apiClient.patch<Goal>(`/goals/${id}`, data, true);
	},

	delete(id: string): Promise<ApiResult<void>> {
		return apiClient.delete<void>(`/goals/${id}`, true);
	},

	addContribution(goalId: string, data: AddContributionRequest): Promise<ApiResult<GoalContribution>> {
		return apiClient.post<GoalContribution>(`/goals/${goalId}/contributions`, data, true);
	},

	listContributions(goalId: string): Promise<ApiResult<ContributionsListResponse>> {
		return apiClient.get<ContributionsListResponse>(`/goals/${goalId}/contributions`, true);
	}
};
