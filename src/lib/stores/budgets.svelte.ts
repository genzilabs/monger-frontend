import { budgetsApi } from '$lib/api';
import type {
	Budget,
	CreateBudgetRequest,
	UpdateBudgetRequest,
	BudgetsListResponse
} from '$lib/types/budget';

import { AsyncStore } from "./asyncStore.svelte";

function createBudgetsStore() {
	const store = new AsyncStore<Budget>();
	
	let totalLimit = $state(0);
	let totalSpent = $state(0);
	let periodStart = $state('');
	let periodEnd = $state('');

	async function loadBudgets(bookId: string) {
		await store.load(async () => {
			const result = await budgetsApi.listByBook(bookId);
			if (result.error) {
				throw new Error((result.error as any).error || 'Gagal memuat anggaran');
			}
			if (result.data) {
				totalLimit = result.data.total_limit;
				totalSpent = result.data.total_spent;
				periodStart = result.data.period_start;
				periodEnd = result.data.period_end;
				return result.data.budgets || [];
			}
			return [];
		}, true); // forceRefresh by default for budgets to get latest limits
	}

	async function createBudget(bookId: string, data: CreateBudgetRequest): Promise<Budget | null> {
		store.error = null;
		const result = await budgetsApi.create(bookId, data);
		if (result.error) {
			store.error = (result.error as any).error || 'Gagal membuat anggaran';
			return null;
		}
		if (result.data) {
			store.add(result.data);
			totalLimit += result.data.limit_cents;
			totalSpent += result.data.spent_cents;
			return result.data;
		}
		return null;
	}

	async function updateBudget(id: string, data: UpdateBudgetRequest): Promise<Budget | null> {
		store.error = null;
		const result = await budgetsApi.update(id, data);
		if (result.error) {
			store.error = (result.error as any).error || 'Gagal mengupdate anggaran';
			return null;
		}
		if (result.data) {
			store.update((b) => b.id === id, () => result.data!);
			return result.data;
		}
		return null;
	}

	async function deleteBudget(id: string): Promise<boolean> {
		store.error = null;
		const budgetToRemove = store.data.find((b) => b.id === id);
		const result = await budgetsApi.delete(id);
		if (result.error) {
			store.error = (result.error as any).error || 'Gagal menghapus anggaran';
			return false;
		}
		if (budgetToRemove) {
			totalLimit -= budgetToRemove.limit_cents;
			totalSpent -= budgetToRemove.spent_cents;
		}
		store.remove((b) => b.id === id);
		return true;
	}

	function reset() {
		store.reset();
		totalLimit = 0;
		totalSpent = 0;
		periodStart = '';
		periodEnd = '';
	}

	return {
		get budgets() { return store.data; },
		get isLoading() { return store.isLoading; },
		get error() { return store.error; },
		get totalLimit() { return totalLimit; },
		get totalSpent() { return totalSpent; },
		get periodStart() { return periodStart; },
		get periodEnd() { return periodEnd; },
		get overBudgetCount() { return store.data.filter((b) => b.is_over_budget).length; },
		get totalProgress() {
			return totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
		},
		loadBudgets,
		createBudget,
		updateBudget,
		deleteBudget,
		reset
	};
}

export const budgetsStore = createBudgetsStore();
