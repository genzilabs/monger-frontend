import { apiClient } from './client';
import type { SyncResponse } from '$lib/types/sync';
import type { ApiResult } from '$lib/types';

export const syncApi = {
	getChanges(bookId: string, since?: string): Promise<ApiResult<SyncResponse>> {
		const query = since ? `?since=${encodeURIComponent(since)}` : '';
		return apiClient.get<SyncResponse>(`/books/${bookId}/sync${query}`, true);
	}
};
