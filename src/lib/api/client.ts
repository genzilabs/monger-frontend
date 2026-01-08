/**
 * Enterprise-grade HTTP client with error handling and token refresh
 */

import { PUBLIC_API_URL } from '$env/static/public';
import type { ApiError, ApiResult } from '$lib/types';
import { tokenStorage } from '$lib/utils/storage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
	method?: HttpMethod;
	body?: unknown;
	headers?: Record<string, string>;
	requireAuth?: boolean;
}

class HttpClient {
	private baseUrl: string;
	private isRefreshing = false;
	private refreshPromise: Promise<boolean> | null = null;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	private async refreshTokens(): Promise<boolean> {
		const refreshToken = tokenStorage.getRefreshToken();
		if (!refreshToken) return false;

		try {
			const response = await fetch(`${this.baseUrl}/auth/refresh`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refresh_token: refreshToken })
			});

			if (!response.ok) {
				tokenStorage.clearAll();
				return false;
			}

			const data = await response.json();
			tokenStorage.setAccessToken(data.access_token);
			tokenStorage.setRefreshToken(data.refresh_token);
			tokenStorage.setUser(data.user);
			return true;
		} catch {
			tokenStorage.clearAll();
			return false;
		}
	}

	private async handleTokenRefresh(): Promise<boolean> {
		if (this.isRefreshing) {
			return this.refreshPromise ?? Promise.resolve(false);
		}

		this.isRefreshing = true;
		this.refreshPromise = this.refreshTokens().finally(() => {
			this.isRefreshing = false;
			this.refreshPromise = null;
		});

		return this.refreshPromise;
	}

	async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResult<T>> {
		const { method = 'GET', body, headers = {}, requireAuth = false } = config;

		const requestHeaders: Record<string, string> = {
			'Content-Type': 'application/json',
			...headers
		};

		if (requireAuth) {
			const token = tokenStorage.getAccessToken();
			if (token) {
				requestHeaders['Authorization'] = `Bearer ${token}`;
			}
		}

		try {
			let response = await fetch(`${this.baseUrl}${endpoint}`, {
				method,
				headers: requestHeaders,
				body: body ? JSON.stringify(body) : undefined
			});

			// Handle 401 with token refresh
			if (response.status === 401 && requireAuth) {
				const refreshed = await this.handleTokenRefresh();
				if (refreshed) {
					const newToken = tokenStorage.getAccessToken();
					if (newToken) {
						requestHeaders['Authorization'] = `Bearer ${newToken}`;
						response = await fetch(`${this.baseUrl}${endpoint}`, {
							method,
							headers: requestHeaders,
							body: body ? JSON.stringify(body) : undefined
						});
					}
				}
			}

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({
					error: response.statusText || 'Request failed',
					code: `HTTP_${response.status}`
				}));
				
				return {
					error: {
						error: errorData.error || 'Request failed',
						code: errorData.code,
						details: errorData.details
					}
				};
			}

			// Handle empty responses (204 No Content)
			if (response.status === 204) {
				return { data: {} as T };
			}

			const data = await response.json();
			return { data };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Network error';
			return {
				error: {
					error: message,
					code: 'NETWORK_ERROR'
				}
			};
		}
	}

	get<T>(endpoint: string, requireAuth = false): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, { method: 'GET', requireAuth });
	}

	post<T>(endpoint: string, body?: unknown, requireAuth = false): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, { method: 'POST', body, requireAuth });
	}

	put<T>(endpoint: string, body?: unknown, requireAuth = false): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, { method: 'PUT', body, requireAuth });
	}

	patch<T>(endpoint: string, body?: unknown, requireAuth = false): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, { method: 'PATCH', body, requireAuth });
	}

	delete<T>(endpoint: string, requireAuth = false): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, { method: 'DELETE', requireAuth });
	}
}

export const apiClient = new HttpClient(PUBLIC_API_URL);
