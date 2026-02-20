import type { Transaction } from '$lib/types/transaction';
import type { Pocket } from '$lib/types/book';
import type { Category } from '$lib/types/category';

export interface SyncResponse {
	transactions: Transaction[];
	pockets: Pocket[];
	categories: Category[];
	server_time: string;
}
