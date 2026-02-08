/**
 * Books store using Svelte 5 runes for reactive state management
 * Persists active book to localStorage for session continuity
 */

import { booksApi } from '$lib/api/books';
import { pocketsApi, pocketTypesApi } from '$lib/api/pockets';
import type { Book, Pocket, PocketType } from '$lib/types';
import { toastStore } from './toast.svelte';

const ACTIVE_BOOK_KEY = 'monger_active_book_id';

interface BooksState {
	books: Book[];
	activeBook: Book | null;
	pockets: Pocket[];
	isLoading: boolean;
	error: string | null;
	isInitialized: boolean;
	pocketTypes: PocketType[];
}

function createBooksStore() {
	let state = $state<BooksState>({
		books: [],
		activeBook: null,
		pockets: [],
		isLoading: false,
		error: null,
		isInitialized: false,
		pocketTypes: []
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
		get pocketTypes() {
			return state.pocketTypes;
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

				const booksResult = await booksApi.list();

				if (booksResult.data) {
					state.books = booksResult.data.books || [];

					// Restore active book from localStorage
					if (typeof window !== 'undefined') {
						const savedBookId = localStorage.getItem(ACTIVE_BOOK_KEY);
						if (savedBookId) {
							const book = state.books.find(b => b.id === savedBookId);
							if (book) {
								state.activeBook = book;
								await Promise.all([
									this.loadPockets(book.id),
									this.loadPocketTypes(book.id)
								]);
							} else if (state.books.length > 0) {
								// Saved book not found, use first book
								state.activeBook = state.books[0];
								localStorage.setItem(ACTIVE_BOOK_KEY, state.books[0].id);
								await Promise.all([
									this.loadPockets(state.books[0].id),
									this.loadPocketTypes(state.books[0].id)
								]);
							}
						} else if (state.books.length > 0) {
							// No saved book, use first book
							state.activeBook = state.books[0];
							localStorage.setItem(ACTIVE_BOOK_KEY, state.books[0].id);
							await Promise.all([
								this.loadPockets(state.books[0].id),
								this.loadPocketTypes(state.books[0].id)
							]);
						}
					}
				} else if (booksResult.error) {
					state.error = booksResult.error.error;
				}
			} catch {
				state.error = 'Failed to load initial data';
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
				await Promise.all([
					this.loadPockets(book.id),
					this.loadPocketTypes(book.id)
				]);
			} else {
				state.pockets = [];
				state.pocketTypes = [];
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
		 * Load pocket types
		 */
		async loadPocketTypes(bookId: string) {
			try {
				const result = await pocketTypesApi.list(bookId);
				if (result.data) {
					state.pocketTypes = result.data.types || [];
				}
			} catch (e) {
				console.error("Failed to load pocket types", e);
			}
		},

		/**
		 * Create a new pocket type
		 */
		async createPocketType(bookId: string, data: { name: string; slug: string; icon_slug: string }) {
			state.isLoading = true;
			try {
				const result = await pocketTypesApi.create(bookId, data);
				if (result.data) {
					state.pocketTypes = [...state.pocketTypes, result.data];
					toastStore.success('Tipe dompet berhasil dibuat!');
					return result.data;
				} else if (result.error) {
					toastStore.error(result.error.error);
				}
			} catch {
				toastStore.error('Gagal membuat tipe dompet');
			} finally {
				state.isLoading = false;
			}
			return null;
		},

		/**
		 * Update a pocket type
		 */
		async updatePocketType(id: string, data: { name: string; slug: string; icon_slug: string }) {
			state.isLoading = true;
			try {
				const result = await pocketTypesApi.update(id, data);
				if (result.data) {
					state.pocketTypes = state.pocketTypes.map(t => t.id === id ? result.data! : t);
					toastStore.success('Tipe dompet berhasil diperbarui!');
					return result.data;
				} else if (result.error) {
					toastStore.error(result.error.error);
				}
			} catch {
				toastStore.error('Gagal memperbarui tipe dompet');
			} finally {
				state.isLoading = false;
			}
			return null;
		},

		/**
		 * Delete a pocket type
		 */
		async deletePocketType(id: string) {
			state.isLoading = true;
			try {
				const result = await pocketTypesApi.delete(id);
				if (!result.error) {
					state.pocketTypes = state.pocketTypes.filter(t => t.id !== id);
					toastStore.success('Tipe dompet berhasil dihapus!');
					return true;
				} else {
					toastStore.error(result.error.error);
				}
			} catch {
				toastStore.error('Gagal menghapus tipe dompet');
			} finally {
				state.isLoading = false;
			}
			return false;
		},

		/**
		 * Create a new book and automatically set it as active
		 */
		async createBook(data: { name: string; description?: string; icon_slug?: string; base_currency?: string }) {
			state.isLoading = true;
			state.error = null;
			try {
				const result = await booksApi.create(data);
				if (result.data) {
					state.books = [...state.books, result.data];

					// Auto-set new book as active
					state.activeBook = result.data;
					state.pockets = []; // New book has no pockets yet
					if (typeof window !== 'undefined') {
						localStorage.setItem(ACTIVE_BOOK_KEY, result.data.id);
					}

					toastStore.success('Buku berhasil dibuat!');
					return result.data;
				} else if (result.error) {
					state.error = result.error.error;
					toastStore.error(result.error.error);
				}
			} catch {
				state.error = 'Failed to create book';
				toastStore.error('Gagal membuat buku');
			} finally {
				state.isLoading = false;
			}
			return null;
		},

		/**
		 * Delete a book
		 * Returns true on success, 'no-books' if no books left, false on error
		 */
		async deleteBook(id: string): Promise<boolean | 'no-books'> {
			state.isLoading = true;
			state.error = null;
			try {
				const result = await booksApi.delete(id);
				if (!result.error) {
					state.books = state.books.filter((b) => b.id !== id);

					// If deleting the active book, select next available book
					if (state.activeBook?.id === id) {
						if (state.books.length > 0) {
							// Set first available book as active
							const nextBook = state.books[0];
							state.activeBook = nextBook;
							state.pockets = [];
							if (typeof window !== 'undefined') {
								localStorage.setItem(ACTIVE_BOOK_KEY, nextBook.id);
							}
							// Load pockets for new active book
							this.loadPockets(nextBook.id);
						} else {
							// No books left
							state.activeBook = null;
							state.pockets = [];
							if (typeof window !== 'undefined') {
								localStorage.removeItem(ACTIVE_BOOK_KEY);
							}
							toastStore.success('Buku berhasil dihapus');
							return 'no-books';
						}
					}

					toastStore.success('Buku berhasil dihapus');
					return true;
				} else {
					state.error = result.error.error;
					toastStore.error(result.error.error);
				}
			} catch {
				state.error = 'Failed to delete book';
				toastStore.error('Gagal menghapus buku');
			} finally {
				state.isLoading = false;
			}
			return false;
		},

		/**
		 * Leave a book (for members, not owners)
		 * Returns true on success, 'no-books' if no books left, false on error
		 */
		async leaveBook(id: string): Promise<boolean | 'no-books'> {
			state.isLoading = true;
			state.error = null;
			try {
				const result = await booksApi.leave(id);
				if (!result.error) {
					state.books = state.books.filter((b) => b.id !== id);

					// If leaving the active book, select next available book
					if (state.activeBook?.id === id) {
						if (state.books.length > 0) {
							// Set first available book as active
							const nextBook = state.books[0];
							state.activeBook = nextBook;
							state.pockets = [];
							if (typeof window !== 'undefined') {
								localStorage.setItem(ACTIVE_BOOK_KEY, nextBook.id);
							}
							// Load pockets for new active book
							this.loadPockets(nextBook.id);
						} else {
							// No books left
							state.activeBook = null;
							state.pockets = [];
							if (typeof window !== 'undefined') {
								localStorage.removeItem(ACTIVE_BOOK_KEY);
							}
							toastStore.success('Berhasil keluar dari buku');
							return 'no-books';
						}
					}

					toastStore.success('Berhasil keluar dari buku');
					return true;
				} else {
					state.error = result.error.error;
					toastStore.error(result.error.error);
				}
			} catch {
				state.error = 'Failed to leave book';
				toastStore.error('Gagal keluar dari buku');
			} finally {
				state.isLoading = false;
			}
			return false;
		},

		/**
		 * Create a new pocket
		 */
		async createPocket(bookId: string, data: { name: string; type_slug?: string; icon_slug?: string; color?: string; balance?: number }) {
			state.isLoading = true;
			state.error = null;
			try {
				const result = await pocketsApi.create(bookId, data);
				if (result.data) {
					state.pockets = [...state.pockets, result.data];
					toastStore.success('Kantong berhasil dibuat!');
					return result.data;
				} else if (result.error) {
					state.error = result.error.error;
					toastStore.error(result.error.error);
				}
			} catch {
				state.error = 'Failed to create pocket';
				toastStore.error('Gagal membuat kantong');
			} finally {
				state.isLoading = false;
			}
			return null;
		},


		/**
		 * Delete a pocket
		 */
		async deletePocket(id: string) {
			state.isLoading = true;
			state.error = null;
			try {
				const result = await pocketsApi.delete(id);
				if (!result.error) {
					state.pockets = state.pockets.filter((p) => p.id !== id);
					toastStore.success('Kantong berhasil dihapus!');
					return true;
				} else {
					state.error = result.error.error;
					toastStore.error(result.error.error);
				}
			} catch {
				state.error = 'Failed to delete pocket';
				toastStore.error('Gagal menghapus kantong');
			} finally {
				state.isLoading = false;
			}
			return false;
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
