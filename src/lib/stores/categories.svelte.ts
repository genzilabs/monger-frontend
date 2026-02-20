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
import { db } from '$lib/db';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

import { AsyncStore } from "./asyncStore.svelte";

function createCategoriesStore() {
	const store = new AsyncStore<Category>(CACHE_TTL_MS);

	// Derived: filter by type
	const incomeCategories = $derived(
		store.data.filter(c => c.type === 'income')
	);

	const expenseCategories = $derived(
		store.data.filter(c => c.type === 'expense')
	);

	return {
		// Getters
		get categories() { return store.data; },
		get isLoading() { return store.isLoading; },
		get error() { return store.error; },
		get incomeCategories() { return incomeCategories; },
		get expenseCategories() { return expenseCategories; },

		/**
		 * Get categories by type
		 */
		getByType(type: 'income' | 'expense') {
			return store.data.filter(c => c.type === type);
		},

		/**
		 * Get category by ID
		 */
		getById(id: string) {
			return store.data.find(c => c.id === id);
		},

		/**
		 * Load categories with caching
		 * @param bookId - The ID of the book to load categories for
		 * @param forceRefresh - bypass cache
		 */
		async load(bookId: string, forceRefresh = false) {
			const hasCategoriesForBook = store.data.length > 0 && store.data[0].book_id === bookId;
			const needsRefresh = forceRefresh || !hasCategoriesForBook;

			await store.load(async () => {
				try {
					const result = await categoriesApi.list(bookId);
					
					if (result.error) {
						throw new Error((result.error as any).error || 'Failed to load categories');
					}

					if (result.data?.categories) {
						try { await db.categories.bulkPut(JSON.parse(JSON.stringify(result.data.categories))); } catch { /* non-critical */ }
						return result.data.categories;
					}

					return [];
				} catch (e: any) {
					// Fallback to offline Dexie cache if we cannot hit the network 
					// and we don't already have the categories loaded in memory.
					if (!hasCategoriesForBook) {
						try {
							const cached = await db.categories.where('book_id').equals(bookId).toArray();
							if (cached.length > 0) {
								return cached;
							}
						} catch { /* Dexie failure non-critical */ }
					}
					
					// Re-throw to let AsyncStore capture the error
					throw e;
				}
			}, needsRefresh);

			return store.data;
		},
		
		/**
		 * Invalidate cache (force next load to fetch fresh data)
		 */
		invalidateCache() {
			store.invalidate();
		},

		/**
		 * Clear all state
		 */
		reset() {
			store.reset();
		}
	};
}

export const categoriesStore = createCategoriesStore();
