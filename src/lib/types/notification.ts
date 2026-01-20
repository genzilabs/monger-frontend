export type NotificationType = 'invitation' | 'activity' | 'p2p_request' | 'p2p_status' | 'general';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any; // Flexible payload
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  data: Notification[];
  error?: string;
}

export interface UnreadCountResponse {
  count: number;
}
