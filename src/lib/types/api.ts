/**
 * Generic API response types
 */

export interface ApiError {
	error: string;
	code?: string;
	details?: Record<string, string>;
}

export type ApiResult<T> = 
	| { data: T; error?: never }
	| { data?: never; error: ApiError };

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	hasMore: boolean;
}
