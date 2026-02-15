export interface Budget {
	id: string;
	book_id: string;
	category_id: string;
	subcategory_id?: string;
	category_name: string;
	category_icon?: string;
	limit_cents: number;
	spent_cents: number;
	start_day: number;
	progress: number;
	is_over_budget: boolean;
	created_at: string;
	updated_at: string;
}

export interface CreateBudgetRequest {
	category_id: string;
	subcategory_id?: string;
	limit_cents: number;
	start_day: number;
}

export interface UpdateBudgetRequest {
	limit_cents?: number;
	start_day?: number;
}

export interface BudgetsListResponse {
	budgets: Budget[];
	total: number;
	total_limit: number;
	total_spent: number;
	period_start: string;
	period_end: string;
}
