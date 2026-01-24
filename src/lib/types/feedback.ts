/**
 * Feedback types for user feedback submission
 */

export type FeedbackType = 'saran' | 'masalah' | 'lainnya';

export interface FeedbackRequest {
	user_id: string;
	feedback_type: FeedbackType;
	description: string;
}

export interface FeedbackResponse {
	id: string;
	message: string;
}
