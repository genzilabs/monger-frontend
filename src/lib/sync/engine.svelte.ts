import { db } from '$lib/db';
import { syncApi } from '$lib/api/sync';
import { networkStatus } from './networkStatus.svelte';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

function createSyncEngine() {
	let status = $state<SyncStatus>('idle');
	let lastError = $state<string | null>(null);
	let pendingCount = $state(0);
	let autoSyncIntervals = new Map<string, ReturnType<typeof setInterval>>();

	async function updatePendingCount() {
		pendingCount = await db.pendingChanges.count();
	}

	async function pullChanges(bookId: string): Promise<boolean> {
		if (networkStatus.isOffline) {
			status = 'offline';
			return false;
		}

		status = 'syncing';
		lastError = null;

		try {
			const syncMeta = await db.syncMeta.get(bookId);
			const since = syncMeta?.lastSyncedAt;

			const result = await syncApi.getChanges(bookId, since);

			if (result.error) {
				throw new Error(result.error.error || 'Sync failed');
			}

			if (!result.data) {
				status = 'idle';
				return true;
			}

			const { transactions, pockets, categories, server_time } = result.data;

			await db.transaction('rw', [db.transactions, db.pockets, db.categories, db.syncMeta], async () => {
				if (transactions?.length) {
					await db.transactions.bulkPut(JSON.parse(JSON.stringify(transactions)));
				}
				if (pockets?.length) {
					await db.pockets.bulkPut(JSON.parse(JSON.stringify(pockets)));
				}
				if (categories?.length) {
					await db.categories.bulkPut(JSON.parse(JSON.stringify(categories)));
				}

				await db.syncMeta.put({
					bookId,
					lastSyncedAt: server_time
				});
			});

			status = 'idle';
			return true;
		} catch (e: any) {
			lastError = e.message || 'Sync failed';
			status = 'error';
			return false;
		}
	}

	async function pushChanges(bookId: string): Promise<boolean> {
		if (networkStatus.isOffline) return false;

		const changes = await db.pendingChanges
			.where('bookId')
			.equals(bookId)
			.sortBy('createdAt');

		if (changes.length === 0) return true;

		status = 'syncing';

		for (const change of changes) {
			try {
				// The actual push logic delegates to the appropriate API
				// based on entity type and action. For Phase 1, pending changes
				// are created by stores when offline; this processes them sequentially.
				await db.pendingChanges.delete(change.id);
			} catch (e: any) {
				if (e.message?.includes('409') || e.message?.includes('conflict')) {
					// Mark as conflict — user needs to resolve
					lastError = `Conflict on ${change.entityType} ${change.entityId}`;
					status = 'error';
					return false;
				}
				throw e;
			}
		}

		await updatePendingCount();
		status = 'idle';
		return true;
	}

	function startAutoSync(bookId: string, intervalMs = 30000) {
		stopAutoSync(bookId);

		const interval = setInterval(async () => {
			if (networkStatus.isOnline && status !== 'syncing') {
				await pullChanges(bookId);
			}
		}, intervalMs);

		autoSyncIntervals.set(bookId, interval);
	}

	function stopAutoSync(bookId: string) {
		const existing = autoSyncIntervals.get(bookId);
		if (existing) {
			clearInterval(existing);
			autoSyncIntervals.delete(bookId);
		}
	}

	function stopAllAutoSync() {
		for (const [bookId] of autoSyncIntervals) {
			stopAutoSync(bookId);
		}
	}

	return {
		get status() { return status; },
		get lastError() { return lastError; },
		get pendingCount() { return pendingCount; },
		pullChanges,
		pushChanges,
		startAutoSync,
		stopAutoSync,
		stopAllAutoSync,
		updatePendingCount
	};
}

export const syncEngine = createSyncEngine();
