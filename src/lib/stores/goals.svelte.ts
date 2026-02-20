import { goalsApi } from '$lib/api';
import type {
	Goal,
	GoalContribution,
	CreateGoalRequest,
	UpdateGoalRequest,
	AddContributionRequest
} from '$lib/types/goal';

function createGoalsStore() {
	let goals = $state<Goal[]>([]);
	let selectedGoal = $state<Goal | null>(null);
	let contributions = $state<GoalContribution[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	async function loadGoals(bookId: string) {
		isLoading = true;
		error = null;

		const result = await goalsApi.listByBook(bookId);
		if (result.error) {
			error = (result.error as any).error || 'Gagal memuat goals';
		} else if (result.data) {
			goals = result.data.goals || [];
		}

		isLoading = false;
	}

	async function loadGoal(id: string) {
		isLoading = true;
		error = null;

		const result = await goalsApi.getById(id);
		if (result.error) {
			error = (result.error as any).error || 'Gagal memuat goal';
		} else if (result.data) {
			selectedGoal = result.data;
		}

		isLoading = false;
	}

	async function createGoal(bookId: string, data: CreateGoalRequest): Promise<Goal | null> {
		error = null;
		const result = await goalsApi.create(bookId, data);
		if (result.error) {
			error = (result.error as any).error || 'Gagal membuat goal';
			return null;
		}
		if (result.data) {
			goals = [...goals, result.data];
			return result.data;
		}
		return null;
	}

	async function updateGoal(id: string, data: UpdateGoalRequest): Promise<Goal | null> {
		error = null;
		const result = await goalsApi.update(id, data);
		if (result.error) {
			error = (result.error as any).error || 'Gagal mengupdate goal';
			return null;
		}
		if (result.data) {
			goals = goals.map((g) => (g.id === id ? result.data! : g));
			if (selectedGoal?.id === id) selectedGoal = result.data;
			return result.data;
		}
		return null;
	}

	async function deleteGoal(id: string): Promise<boolean> {
		error = null;
		const result = await goalsApi.delete(id);
		if (result.error) {
			error = (result.error as any).error || 'Gagal menghapus goal';
			return false;
		}
		goals = goals.filter((g) => g.id !== id);
		if (selectedGoal?.id === id) selectedGoal = null;
		return true;
	}

	async function addContribution(goalId: string, data: AddContributionRequest): Promise<GoalContribution | null> {
		error = null;
		const result = await goalsApi.addContribution(goalId, data);
		if (result.error) {
			error = (result.error as any).error || 'Gagal menambah kontribusi';
			return null;
		}
		if (result.data) {
			contributions = [result.data, ...contributions];
			await loadGoal(goalId);
			return result.data;
		}
		return null;
	}

	async function loadContributions(goalId: string) {
		const result = await goalsApi.listContributions(goalId);
		if (result.error) {
			error = (result.error as any).error || 'Gagal memuat kontribusi';
		} else if (result.data) {
			contributions = result.data.contributions || [];
		}
	}

	function reset() {
		goals = [];
		selectedGoal = null;
		contributions = [];
		isLoading = false;
		error = null;
	}

	return {
		get goals() { return goals; },
		get selectedGoal() { return selectedGoal; },
		get contributions() { return contributions; },
		get isLoading() { return isLoading; },
		get error() { return error; },
		get activeGoals() { return goals.filter((g) => g.status === 'active'); },
		get completedGoals() { return goals.filter((g) => g.status === 'completed'); },
		loadGoals,
		loadGoal,
		createGoal,
		updateGoal,
		deleteGoal,
		addContribution,
		loadContributions,
		reset
	};
}

export const goalsStore = createGoalsStore();
