import { apiClient as api } from "./client";
import type { PendingTransfer } from "$lib/types/transaction";

export const p2pApi = {
  create: (data: {
    sender_pocket_id: string;
    recipient_email: string;
    amount_cents: number;
    fee_cents?: number;
    name: string;
    description?: string;
  }) => api.post<{ id: string }>("/p2p-transfers", data, true),

  list: (type?: 'sent' | 'received') => 
    api.get<{ sent: PendingTransfer[], received: PendingTransfer[] }>(
      `/p2p-transfers${type ? `?type=${type}` : ''}`,
      true
    ),

  accept: (id: string, recipient_pocket_id: string) =>
    api.post(`/p2p-transfers/${id}/accept`, { recipient_pocket_id }, true),

  reject: (id: string) => api.post(`/p2p-transfers/${id}/reject`, {}, true),

  cancel: (id: string) => api.post(`/p2p-transfers/${id}/cancel`, {}, true),
};
