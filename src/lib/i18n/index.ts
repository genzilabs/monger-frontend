import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';
import { browser } from '$app/environment';

// Register translations
register('id', () => import('./locales/id.json'));
register('en', () => import('./locales/en.json'));

// Initialize i18n
export function setupI18n() {
	init({
		fallbackLocale: 'id',
		initialLocale: browser ? (localStorage.getItem('monger:locale') || getLocaleFromNavigator() || 'id') : 'id',
	});
}

// Helper to change locale
export function setLocale(newLocale: string) {
	locale.set(newLocale);
	if (browser) {
		localStorage.setItem('monger:locale', newLocale);
	}
}

// Re-export useful functions
export { locale, t, _ } from 'svelte-i18n';
