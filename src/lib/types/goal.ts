export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
	id: string;
	book_id: string;
	pocket_id?: string;
	name: string;
	description?: string;
	target_cents: number;
	current_cents: number;
	currency: string;
	icon_slug?: string;
	color?: string;
	deadline?: string;
	status: GoalStatus;
	created_by: string;
	creator_name?: string;
	progress: number;
	created_at: string;
	updated_at: string;
}

export interface GoalContribution {
	id: string;
	goal_id: string;
	user_id: string;
	user_name?: string;
	user_avatar?: string;
	amount_cents: number;
	note?: string;
	created_at: string;
}

export interface CreateGoalRequest {
	name: string;
	description?: string;
	pocket_id?: string;
	target_cents: number;
	currency?: string;
	icon_slug?: string;
	color?: string;
	deadline?: string;
}

export interface UpdateGoalRequest {
	name?: string;
	description?: string;
	pocket_id?: string;
	target_cents?: number;
	icon_slug?: string;
	color?: string;
	deadline?: string;
	status?: GoalStatus;
}

export interface AddContributionRequest {
	amount_cents: number;
	note?: string;
}

export interface GoalsListResponse {
	goals: Goal[];
	total: number;
}

export interface ContributionsListResponse {
	contributions: GoalContribution[];
	total: number;
}
