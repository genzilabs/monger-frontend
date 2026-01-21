/// <reference types="@sveltejs/kit" />

declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

declare module '$env/static/public' {
	export const PUBLIC_API_URL: string;
}

declare module 'virtual:pwa-info' {
	export const pwaInfo: {
		webManifest: {
			linkTag: string;
		};
	};
}
declare module 'virtual:pwa-register' {
	export interface RegisterSWOptions {
		immediate?: boolean;
		onNeedRefresh?: () => void;
		onOfflineReady?: () => void;
		onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
		onRegisterError?: (error: any) => void;
	}

	export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

