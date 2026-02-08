/**
 * PIN Store for managing application lock state
 */
import { browser } from '$app/environment';
import { authApi } from '$lib/api/auth';
import { authStore } from './auth.svelte';

interface PinSettings {
	enabled: boolean;
	lock_timeout: string; // "immediate", "1m", "5m", etc.
}

interface PinState {
	isLocked: boolean;
	lastActive: number;
	settings: PinSettings;
	isInitialized: boolean;
}

function createPinStore() {
	// Try to restore from storage
	let savedSettings: PinSettings | null = null;
	let savedLastActive = Date.now();

	if (browser) {
		const stored = localStorage.getItem('monger_pin_settings');
		if (stored) {
			try {
				savedSettings = JSON.parse(stored);
			} catch { }
		}

		const lastActive = localStorage.getItem('monger_pin_last_active');
		if (lastActive) {
			savedLastActive = parseInt(lastActive, 10);
		}
	}

	// Determine initial lock state based on saved settings
	let initialLocked = false;
	if (savedSettings?.enabled) {
		if (savedSettings.lock_timeout === 'immediate') {
			initialLocked = true;
		} else {
			const timeoutMs = getTimeoutMs(savedSettings.lock_timeout);
			if (Date.now() - savedLastActive > timeoutMs) {
				initialLocked = true;
			}
		}
	}

	let state = $state<PinState>({
		isLocked: initialLocked,
		lastActive: savedLastActive,
		settings: savedSettings || {
			enabled: false,
			lock_timeout: 'immediate'
		},
		isInitialized: false
	});

	// Helper to parse timeout string to milliseconds (moved inside to access from constructor if needed, or kept outside)
	// Keeping it outside logic flow for cleanliness, but needed for initial check above. 
	// Duplicating for simplicity or hoisting functionality.
	// Actually, let's just define it here.
	function getTimeoutMs(timeout: string): number {
		switch (timeout) {
			case 'immediate':
				return 0;
			case '1m':
				return 60 * 1000;
			case '5m':
				return 5 * 60 * 1000;
			case '15m':
				return 15 * 60 * 1000;
			case '30m':
				return 30 * 60 * 1000;
			case 'never':
				return Infinity;
			default:
				return 0;
		}
	}

	function saveState() {
		if (!browser) return;
		localStorage.setItem('monger_pin_settings', JSON.stringify(state.settings));
		localStorage.setItem('monger_pin_last_active', state.lastActive.toString());
	}

	return {
		get isLocked() {
			return state.isLocked;
		},
		get settings() {
			return state.settings;
		},
		get hasPin() {
			return state.settings.enabled;
		},
		get isInitialized() {
			return state.isInitialized;
		},

		async initialize() {
			if (state.isInitialized || !browser) return;

			// Fetch latest settings from API to sync
			try {
				const res = await authApi.getPINStatus();
				if (res.data) {
					// Only update if changed to avoid unnecessary re-triggers
					state.settings = {
						enabled: res.data.enabled,
						lock_timeout: res.data.lock_timeout
					};
					saveState();

					// If we weren't locked initially but API says we should be (edge case: settings changed on another device)
					// We generally trust the local state for "active" session, but if enabled became true...
					// For now, let's stick to local visibility logic.
				}
			} catch (e) {
				console.error('Failed to fetch PIN settings', e);
			}

			// Setup visibility listener
			document.addEventListener('visibilitychange', () => {
				if (document.hidden) {
					// App went to background
					state.lastActive = Date.now();
					saveState();

					if (state.settings.enabled && state.settings.lock_timeout === 'immediate') {
						state.isLocked = true;
					}
				} else {
					// App came to foreground
					state.lastActive = Date.now(); // Update active time on return
					saveState();

					if (!state.settings.enabled) return;
					if (state.isLocked) return; // Already locked

					const timeoutMs = getTimeoutMs(state.settings.lock_timeout);
					const timeDiff = Date.now() - parseInt(localStorage.getItem('monger_pin_last_active') || state.lastActive.toString());

					// If immediate, it would have locked on hidden. 
					// But for other timeouts:
					if (state.settings.lock_timeout !== 'immediate' && timeDiff > timeoutMs) {
						state.isLocked = true;
					}
				}
			});

			// Also update lastActive on clicks/interactions? 
			// For "Idle" timeout (like banking apps), usually yes. 
			// For "Background" timeout (like 1Password), only background time counts.
			// The requirement said "PINLockTimeout", usually implies idle or background. 
			// "Immediate" usually means background.
			// Let's stick to background for now as it's less intrusive.

			state.isInitialized = true;
		},

		/**
		 * Update settings (called from Settings page)
		 */
		updateSettings(enabled: boolean, timeout: string) {
			state.settings = { enabled, lock_timeout: timeout };
			saveState();
		},

		/**
		 * Attempt to unlock with PIN
		 */
		async unlock(pin: string): Promise<boolean> {
			try {
				const res = await authApi.verifyPIN({ pin });
				if (res.data) {
					state.isLocked = false;
					state.lastActive = Date.now();
					saveState();
					return true;
				}
				return false;
			} catch {
				return false;
			}
		},

		/**
		 * Manually lock the app
		 */
		lock() {
			if (state.settings.enabled) {
				state.isLocked = true;
			}
		}
	};
}

export const pinStore = createPinStore();
