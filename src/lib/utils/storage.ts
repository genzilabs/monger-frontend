/**
 * Secure token storage abstraction
 */

const ACCESS_TOKEN_KEY = 'monger_access_token';
const REFRESH_TOKEN_KEY = 'monger_refresh_token';
const USER_KEY = 'monger_user';

function isClient(): boolean {
	return typeof window !== 'undefined';
}

export const tokenStorage = {
	getAccessToken(): string | null {
		if (!isClient()) return null;
		return localStorage.getItem(ACCESS_TOKEN_KEY);
	},

	setAccessToken(token: string): void {
		if (!isClient()) return;
		localStorage.setItem(ACCESS_TOKEN_KEY, token);
	},

	getRefreshToken(): string | null {
		if (!isClient()) return null;
		return localStorage.getItem(REFRESH_TOKEN_KEY);
	},

	setRefreshToken(token: string): void {
		if (!isClient()) return;
		localStorage.setItem(REFRESH_TOKEN_KEY, token);
	},

	clearTokens(): void {
		if (!isClient()) return;
		localStorage.removeItem(ACCESS_TOKEN_KEY);
		localStorage.removeItem(REFRESH_TOKEN_KEY);
	},

	setUser(user: unknown): void {
		if (!isClient()) return;
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	},

	getUser<T>(): T | null {
		if (!isClient()) return null;
		const data = localStorage.getItem(USER_KEY);
		if (!data) return null;
		try {
			return JSON.parse(data) as T;
		} catch {
			return null;
		}
	},

	clearUser(): void {
		if (!isClient()) return;
		localStorage.removeItem(USER_KEY);
	},

	clearAll(): void {
		this.clearTokens();
		this.clearUser();
	}
};
