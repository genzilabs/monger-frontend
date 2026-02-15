import { budgetsApi } from '$lib/api';
import type {
	Budget,
	CreateBudgetRequest,
	UpdateBudgetRequest,
	BudgetsListResponse
} from '$lib/types/budget';

function createBudgetsStore() {
	let budgets = $state<Budget[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let totalLimit = $state(0);
	let totalSpent = $state(0);
	let periodStart = $state('');
	let periodEnd = $state('');

	async function loadBudgets(bookId: string) {
		isLoading = true;
		error = null;

		const result = await budgetsApi.listByBook(bookId);
		if (result.error) {
			error = (result.error as any).error || 'Gagal memuat anggaran';
		} else if (result.data) {
			budgets = result.data.budgets || [];
			totalLimit = result.data.total_limit;
			totalSpent = result.data.total_spent;
			periodStart = result.data.period_start;
			periodEnd = result.data.period_end;
		}

		isLoading = false;
	}

	async function createBudget(bookId: string, data: CreateBudgetRequest): Promise<Budget | null> {
		error = null;
		const result = await budgetsApi.create(bookId, data);
		if (result.error) {
			error = (result.error as any).error || 'Gagal membuat anggaran';
			return null;
		}
		if (result.data) {
			budgets = [...budgets, result.data];
			totalLimit += result.data.limit_cents;
			totalSpent += result.data.spent_cents;
			return result.data;
		}
		return null;
	}

	async function updateBudget(id: string, data: UpdateBudgetRequest): Promise<Budget | null> {
		error = null;
		const result = await budgetsApi.update(id, data);
		if (result.error) {
			error = (result.error as any).error || 'Gagal mengupdate anggaran';
			return null;
		}
		if (result.data) {
			budgets = budgets.map((b) => (b.id === id ? result.data! : b));
			return result.data;
		}
		return null;
	}

	async function deleteBudget(id: string): Promise<boolean> {
		error = null;
		const budgetToRemove = budgets.find((b) => b.id === id);
		const result = await budgetsApi.delete(id);
		if (result.error) {
			error = (result.error as any).error || 'Gagal menghapus anggaran';
			return false;
		}
		if (budgetToRemove) {
			totalLimit -= budgetToRemove.limit_cents;
			totalSpent -= budgetToRemove.spent_cents;
		}
		budgets = budgets.filter((b) => b.id !== id);
		return true;
	}

	function reset() {
		budgets = [];
		isLoading = false;
		error = null;
		totalLimit = 0;
		totalSpent = 0;
		periodStart = '';
		periodEnd = '';
	}

	return {
		get budgets() { return budgets; },
		get isLoading() { return isLoading; },
		get error() { return error; },
		get totalLimit() { return totalLimit; },
		get totalSpent() { return totalSpent; },
		get periodStart() { return periodStart; },
		get periodEnd() { return periodEnd; },
		get overBudgetCount() { return budgets.filter((b) => b.is_over_budget).length; },
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
