import { apiClient } from './client';
import type { RecurringTransaction, CreateRecurringTransactionRequest, UpdateRecurringTransactionRequest } from '$lib/types/recurring';

const BASE_PATH = '/recurring-transactions';

export const recurringApi = {
  create: async (data: CreateRecurringTransactionRequest) => {
    return apiClient.post<RecurringTransaction>(BASE_PATH, data, true);
  },

  list: async () => {
    return apiClient.get<RecurringTransaction[]>(BASE_PATH, true);
  },

  getById: async (id: string) => {
    return apiClient.get<RecurringTransaction>(`${BASE_PATH}/${id}`, true);
  },

  update: async (id: string, data: UpdateRecurringTransactionRequest) => {
    return apiClient.patch<RecurringTransaction>(`${BASE_PATH}/${id}`, data, true);
  },

  delete: async (id: string) => {
    return apiClient.delete<{ message: string }>(`${BASE_PATH}/${id}`, true);
  }
};
