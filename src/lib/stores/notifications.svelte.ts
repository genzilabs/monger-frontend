import { notificationsApi } from '$lib/api/notifications';
import type { Notification } from '$lib/types/notification';

interface NotificationsState {
	notifications: Notification[];
	unreadCount: number;
	isLoading: boolean;
	error: string | null;
}

function createNotificationsStore() {
	let state = $state<NotificationsState>({
		notifications: [],
		unreadCount: 0,
		isLoading: false,
		error: null
	});

	return {
		get notifications() { return state.notifications; },
		get unreadCount() { return state.unreadCount; },
		get isLoading() { return state.isLoading; },
		get error() { return state.error; },

		async load(limit = 20, offset = 0) {
			state.isLoading = true;
			state.error = null;
			try {
				const res = await notificationsApi.list(limit, offset);
				if (res.data) {
					state.notifications = res.data;
				}
                // Also update unread count
                this.loadUnreadCount();
			} catch (err: any) {
				state.error = err.message || 'Failed to load notifications';
			} finally {
				state.isLoading = false;
			}
		},

		async loadUnreadCount() {
			try {
				const res = await notificationsApi.countUnread();
				if (res.data) {
					state.unreadCount = res.data.count;
				}
			} catch (err) {
				console.error('Failed to load unread count', err);
			}
		},

		async markAsRead(id: string) {
			// Optimistic update
			const notif = state.notifications.find(n => n.id === id);
			if (notif && !notif.is_read) {
				notif.is_read = true;
				state.unreadCount = Math.max(0, state.unreadCount - 1);
			}

			try {
				await notificationsApi.markAsRead(id);
			} catch (err) {
				// Revert if failed (optional, but good practice)
				console.error('Failed to mark as read', err);
			}
		},

		async markAllAsRead() {
			// Optimistic update
			state.notifications.forEach(n => n.is_read = true);
			state.unreadCount = 0;

			try {
				await notificationsApi.markAllAsRead();
			} catch (err) {
				console.error('Failed to mark all as read', err);
                this.load(); // Reload on error to ensure correct state
			}
		},
        
        // Helper to add a notification (e.g. from websocket in future)
        add(notification: Notification) {
            state.notifications = [notification, ...state.notifications];
            if (!notification.is_read) {
                state.unreadCount++;
            }
        }
	};
}

export const notificationsStore = createNotificationsStore();
