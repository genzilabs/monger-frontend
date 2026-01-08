/**
 * Auth store using Svelte 5 runes for reactive state management
 */

import { authApi } from '$lib/api';
import type { User } from '$lib/types';
import { tokenStorage } from '$lib/utils/storage';

interface AuthState {
	user: User | null;
	isLoading: boolean;
	isInitialized: boolean;
}

function createAuthStore() {
	let state = $state<AuthState>({
		user: null,
		isLoading: false,
		isInitialized: false
	});

	const isAuthenticated = $derived(state.user !== null);

	return {
		get user() {
			return state.user;
		},
		get isLoading() {
			return state.isLoading;
		},
		get isAuthenticated() {
			return isAuthenticated;
		},
		get isInitialized() {
			return state.isInitialized;
		},

		/**
		 * Initialize auth state from localStorage
		 */
		async initialize() {
			if (state.isInitialized) return;

			state.isLoading = true;
			try {
				const storedUser = tokenStorage.getUser<User>();
				const accessToken = tokenStorage.getAccessToken();

				if (storedUser && accessToken) {
					// Validate token by fetching profile
					const result = await authApi.getProfile();
					if (result.data) {
						state.user = result.data;
						tokenStorage.setUser(result.data);
					} else {
						// Token invalid, clear storage
						tokenStorage.clearAll();
					}
				}
			} catch {
				tokenStorage.clearAll();
			} finally {
				state.isLoading = false;
				state.isInitialized = true;
			}
		},

		/**
		 * Set user after successful authentication
		 */
		setAuth(user: User, accessToken: string, refreshToken: string) {
			state.user = user;
			tokenStorage.setUser(user);
			tokenStorage.setAccessToken(accessToken);
			tokenStorage.setRefreshToken(refreshToken);
		},

		/**
		 * Update user data
		 */
		setUser(user: User) {
			state.user = user;
			tokenStorage.setUser(user);
		},

		/**
		 * Clear auth state and logout
		 */
		async logout() {
			state.isLoading = true;
			try {
				await authApi.logout();
			} catch {
				// Ignore logout errors
			} finally {
				state.user = null;
				tokenStorage.clearAll();
				state.isLoading = false;
			}
		},

		/**
		 * Set loading state
		 */
		setLoading(loading: boolean) {
			state.isLoading = loading;
		}
	};
}

export const authStore = createAuthStore();
