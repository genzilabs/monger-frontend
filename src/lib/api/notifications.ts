import { apiClient } from './client';
import type { Notification, UnreadCountResponse } from '$lib/types/notification';

const BASE_PATH = '/notifications';

export const notificationsApi = {
  list: async (limit = 20, offset = 0) => {
    return apiClient.get<Notification[]>(`${BASE_PATH}?limit=${limit}&offset=${offset}`, true);
  },

  countUnread: async () => {
    return apiClient.get<UnreadCountResponse>(`${BASE_PATH}/unread-count`, true);
  },

  markAsRead: async (id: string) => {
    return apiClient.post<{ message: string }>(`${BASE_PATH}/${id}/read`, {}, true);
  },

  markAllAsRead: async () => {
    return apiClient.post<{ message: string }>(`${BASE_PATH}/read-all`, {}, true);
  }
};
