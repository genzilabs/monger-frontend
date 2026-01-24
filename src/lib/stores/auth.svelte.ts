/**
 * Auth store using Svelte 5 runes for reactive state management
 */

import { authApi } from '$lib/api/auth';
import type { User } from '$lib/types';
import { tokenStorage } from '$lib/utils/storage';
import { booksStore } from './books.svelte';
import { categoriesStore } from './categories.svelte';
import { transactionsStore } from './transactions.svelte';

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

				console.log('[Auth Init] Stored user:', !!storedUser, 'Token:', !!accessToken);

				if (storedUser && accessToken) {
					// Set user immediately from storage (for offline/fast load)
					state.user = storedUser;
					
					// Validate token by fetching profile (but don't logout on network error)
					try {
						const result = await authApi.getProfile();
						if (result.data) {
							state.user = result.data;
							tokenStorage.setUser(result.data);
							console.log('[Auth Init] Profile validated');
						} else if (result.error) {
							// Only clear if server explicitly rejects (401/403), not network error
							const errorMsg = result.error.error || '';
							console.log('[Auth Init] Profile error:', errorMsg);
							if (errorMsg.includes('401') || errorMsg.toLowerCase().includes('unauthorized')) {
								tokenStorage.clearAll();
								state.user = null;
							}
						}
					} catch (networkError) {
						// Network error - keep user logged in with cached data
						console.log('[Auth Init] Network error, keeping cached user');
					}
				}
			} catch (err) {
				console.log('[Auth Init] Unexpected error:', err);
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
				
				// Reset all other stores to prevent data persistence
				booksStore.reset();
				categoriesStore.reset();
				transactionsStore.reset();

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
