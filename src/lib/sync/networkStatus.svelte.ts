import { browser } from '$app/environment';

export type NetworkState = 'online' | 'offline';

function createNetworkStatus() {
	let status = $state<NetworkState>(browser ? (navigator.onLine ? 'online' : 'offline') : 'online');

	if (browser) {
		window.addEventListener('online', () => { status = 'online'; });
		window.addEventListener('offline', () => { status = 'offline'; });
	}

	return {
		get current() { return status; },
		get isOnline() { return status === 'online'; },
		get isOffline() { return status === 'offline'; }
	};
}

export const networkStatus = createNetworkStatus();
