import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

function createToastStore() {
	let toasts = $state<Toast[]>([]);

	function add(type: ToastType, message: string, duration = 3000) {
		const id = Math.random().toString(36).substring(2);
		const toast: Toast = { id, type, message, duration };
		
		toasts = [...toasts, toast];

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}
	}

	function remove(id: string) {
		toasts = toasts.filter(t => t.id !== id);
	}

	return {
		get toasts() { return toasts; },
		success: (message: string, duration?: number) => add('success', message, duration),
		error: (message: string, duration?: number) => add('error', message, duration),
		info: (message: string, duration?: number) => add('info', message, duration),
		remove
	};
}

export const toastStore = createToastStore();
