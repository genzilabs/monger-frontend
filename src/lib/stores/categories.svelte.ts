/**
 * Categories Store - Enterprise-grade state management
 * 
 * Features:
 * - Caching with TTL (time-to-live)
 * - Lazy loading
 * - Type filtering
 * - Error handling
 */

import { categoriesApi } from '$lib/api/categories';
import type { Category } from '$lib/types/category';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

interface CategoriesState {
	categories: Category[];
	isLoading: boolean;
	error: string | null;
	lastFetched: number | null;
}

function createCategoriesStore() {
	let state = $state<CategoriesState>({
		categories: [],
		isLoading: false,
		error: null,
		lastFetched: null
	});

	// Derived: check if cache is valid
	const isCacheValid = $derived(
		state.lastFetched !== null && 
		Date.now() - state.lastFetched < CACHE_TTL_MS
	);

	// Derived: filter by type
	const incomeCategories = $derived(
		state.categories.filter(c => c.type === 'income')
	);

	const expenseCategories = $derived(
		state.categories.filter(c => c.type === 'expense')
	);

	return {
		// Getters
		get categories() { return state.categories; },
		get isLoading() { return state.isLoading; },
		get error() { return state.error; },
		get incomeCategories() { return incomeCategories; },
		get expenseCategories() { return expenseCategories; },

		/**
		 * Get categories by type
		 */
		getByType(type: 'income' | 'expense') {
			return state.categories.filter(c => c.type === type);
		},

		/**
		 * Get category by ID
		 */
		getById(id: string) {
			return state.categories.find(c => c.id === id);
		},

		/**
		 * Load categories with caching
		 * @param forceRefresh - bypass cache
		 */
		async load(forceRefresh = false) {
			// Return cached if valid and not forcing refresh
			if (!forceRefresh && isCacheValid && state.categories.length > 0) {
				return state.categories;
			}

			state.isLoading = true;
			state.error = null;

			try {
				const result = await categoriesApi.list();
				
				if (result.error) {
					throw new Error(result.error.error || 'Failed to load categories');
				}

				if (result.data?.categories) {
					state.categories = result.data.categories;
					state.lastFetched = Date.now();
				}

				return state.categories;
			} catch (e: any) {
				state.error = e.message || 'Failed to load categories';
				console.error('Categories load error:', e);
				return [];
			} finally {
				state.isLoading = false;
			}
		},

		/**
		 * Invalidate cache (force next load to fetch fresh data)
		 */
		invalidateCache() {
			state.lastFetched = null;
		},

		/**
		 * Clear all state
		 */
		reset() {
			state.categories = [];
			state.isLoading = false;
			state.error = null;
			state.lastFetched = null;
		}
	};
}

export const categoriesStore = createCategoriesStore();
