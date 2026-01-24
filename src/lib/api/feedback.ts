/**
 * Feedback API - Submit user feedback
 */

import { apiClient } from './client';
import type { FeedbackRequest, FeedbackResponse } from '$lib/types/feedback';

export const feedbackApi = {
	/**
	 * Submit user feedback
	 */
	async submit(data: FeedbackRequest) {
		return apiClient.post<FeedbackResponse>('/feedback', data, true);
	}
};
