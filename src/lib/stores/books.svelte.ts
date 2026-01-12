/**
 * Books store using Svelte 5 runes for reactive state management
 * Persists active book to localStorage for session continuity
 */

import { booksApi } from '$lib/api/books';
import { pocketsApi } from '$lib/api/pockets';
import type { Book, Pocket } from '$lib/types';

const ACTIVE_BOOK_KEY = 'monger_active_book_id';

interface BooksState {
	books: Book[];
	activeBook: Book | null;
	pockets: Pocket[];
	isLoading: boolean;
	error: string | null;
	isInitialized: boolean;
}

function createBooksStore() {
	let state = $state<BooksState>({
		books: [],
		activeBook: null,
		pockets: [],
		isLoading: false,
		error: null,
		isInitialized: false
	});

	return {
		get books() {
			return state.books;
		},
		get activeBook() {
			return state.activeBook;
		},
		get pockets() {
			return state.pockets;
		},
		get isLoading() {
			return state.isLoading;
		},
		get error() {
			return state.error;
		},
		get isInitialized() {
			return state.isInitialized;
		},

		/**
		 * Initialize and load all books, restore active book from localStorage
		 */
		async initialize() {
			if (state.isInitialized) return;
			
			state.isLoading = true;
			state.error = null;
			try {
				const result = await booksApi.list();
				if (result.data) {
					state.books = result.data.books || [];
					
					// Restore active book from localStorage
					if (typeof window !== 'undefined') {
						const savedBookId = localStorage.getItem(ACTIVE_BOOK_KEY);
						if (savedBookId) {
							const book = state.books.find(b => b.id === savedBookId);
							if (book) {
								state.activeBook = book;
								await this.loadPockets(book.id);
							} else if (state.books.length > 0) {
								// Saved book not found, use first book
								state.activeBook = state.books[0];
								localStorage.setItem(ACTIVE_BOOK_KEY, state.books[0].id);
								await this.loadPockets(state.books[0].id);
							}
						} else if (state.books.length > 0) {
							// No saved book, use first book
							state.activeBook = state.books[0];
							localStorage.setItem(ACTIVE_BOOK_KEY, state.books[0].id);
							await this.loadPockets(state.books[0].id);
						}
					}
				} else if (result.error) {
					state.error = result.error.error;
				}
			} catch {
				state.error = 'Failed to load books';
			} finally {
				state.isLoading = false;
				state.isInitialized = true;
			}
		},

		/**
		 * Load all books for the current user
		 */
		async loadBooks() {
			state.isLoading = true;
			state.error = null;
			try {
				const result = await booksApi.list();
				if (result.data) {
					state.books = result.data.books || [];
				} else if (result.error) {
					state.error = result.error.error;
				}
			} catch {
				state.error = 'Failed to load books';
			} finally {
				state.isLoading = false;
			}
		},

		/**
		 * Set the active book and load its pockets
		 */
		async setActiveBook(book: Book | null) {
			state.activeBook = book;
			
			// Persist to localStorage
			if (typeof window !== 'undefined') {
				if (book) {
					localStorage.setItem(ACTIVE_BOOK_KEY, book.id);
				} else {
					localStorage.removeItem(ACTIVE_BOOK_KEY);
				}
			}
			
			if (book) {
				await this.loadPockets(book.id);
			} else {
				state.pockets = [];
			}
		},

		/**
		 * Load pockets for a book
		 */
		async loadPockets(bookId: string) {
			state.isLoading = true;
			state.error = null;
			try {
				const result = await pocketsApi.listByBook(bookId);
				if (result.data) {
					state.pockets = result.data.pockets || [];
				} else if (result.error) {
					state.error = result.error.error;
				}
			} catch {
				state.error = 'Failed to load pockets';
			} finally {
				state.isLoading = false;
			}
		},

		/**
		 * Create a new book
		 */
		async createBook(data: { name: string; description?: string; icon_slug?: string; base_currency?: string }) {
			state.isLoading = true;
			state.error = null;
			try {
				const result = await booksApi.create(data);
				if (result.data) {
					state.books = [...state.books, result.data];
					return result.data;
				} else if (result.error) {
					state.error = result.error.error;
				}
			} catch {
				state.error = 'Failed to create book';
			} finally {
				state.isLoading = false;
			}
			return null;
		},

		/**
		 * Delete a book
		 */
		async deleteBook(id: string) {
			state.isLoading = true;
			state.error = null;
			try {
				const result = await booksApi.delete(id);
				if (!result.error) {
					state.books = state.books.filter((b) => b.id !== id);
					if (state.activeBook?.id === id) {
						state.activeBook = null;
						state.pockets = [];
						if (typeof window !== 'undefined') {
							localStorage.removeItem(ACTIVE_BOOK_KEY);
						}
					}
					return true;
				} else {
					state.error = result.error.error;
				}
			} catch {
				state.error = 'Failed to delete book';
			} finally {
				state.isLoading = false;
			}
			return false;
		},

		/**
		 * Create a new pocket
		 */
		async createPocket(bookId: string, data: { name: string; type_slug?: string; color?: string; balance?: number }) {
			state.isLoading = true;
			state.error = null;
			try {
				const result = await pocketsApi.create(bookId, data);
				if (result.data) {
					state.pockets = [...state.pockets, result.data];
					return result.data;
				} else if (result.error) {
					state.error = result.error.error;
				}
			} catch {
				state.error = 'Failed to create pocket';
			} finally {
				state.isLoading = false;
			}
			return null;
		},

		/**
		 * Clear store state
		 */
		reset() {
			state.books = [];
			state.activeBook = null;
			state.pockets = [];
			state.error = null;
			state.isInitialized = false;
			if (typeof window !== 'undefined') {
				localStorage.removeItem(ACTIVE_BOOK_KEY);
			}
		}
	};
}

export const booksStore = createBooksStore();
