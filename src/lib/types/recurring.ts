import type { TransactionType } from './transaction';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  pocket_id: string;
  name: string;
  amount_cents: number;
  type: TransactionType;
  frequency: Frequency;
  start_date: string;
  next_date: string;
  description?: string;
  category_id?: string;
  subcategory_id?: string;
  to_pocket_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringTransactionRequest {
  pocket_id: string;
  name: string;
  amount_cents: number;
  type: TransactionType;
  frequency: Frequency;
  start_date: string; // ISO String
  description?: string;
  category_id?: string;
  subcategory_id?: string;
  to_pocket_id?: string;
}

export interface UpdateRecurringTransactionRequest {
  name?: string;
  amount_cents?: number;
  type?: TransactionType;
  frequency?: Frequency;
  start_date?: string;
  description?: string;
  category_id?: string;
  subcategory_id?: string;
  to_pocket_id?: string;
}
