import Dexie, { type EntityTable } from 'dexie';
import type { Transaction } from '$lib/types/transaction';
import type { Pocket, Book } from '$lib/types/book';
import type { Category } from '$lib/types/category';

export interface SyncMeta {
	bookId: string;
	lastSyncedAt: string;
}

export interface PendingChange {
	id: string;
	entityType: 'transaction' | 'pocket' | 'category';
	entityId: string;
	bookId: string;
	action: 'create' | 'update' | 'delete';
	payload?: Record<string, unknown>;
	createdAt: string;
}

class MongerDB extends Dexie {
	transactions!: EntityTable<Transaction, 'id'>;
	pockets!: EntityTable<Pocket, 'id'>;
	categories!: EntityTable<Category, 'id'>;
	books!: EntityTable<Book, 'id'>;
	syncMeta!: EntityTable<SyncMeta, 'bookId'>;
	pendingChanges!: EntityTable<PendingChange, 'id'>;

	constructor() {
		super('monger');

		this.version(1).stores({
			transactions: 'id, pocket_id, updated_at',
			pockets: 'id, book_id, updated_at',
			categories: 'id, book_id, updated_at',
			books: 'id',
			syncMeta: 'bookId',
			pendingChanges: 'id, entityType, bookId, createdAt'
		});
	}
}

export const db = new MongerDB();
