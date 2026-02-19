import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sentrySvelteKit } from "@sentry/sveltekit";
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig(({ mode }) => ({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: "monger",
				project: "frontend",
				authToken: process.env.SENTRY_AUTH_TOKEN,
			}
		}), 
		tailwindcss(), 
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
			manifest: {
				name: 'Monger - Keuangan Gen Z',
				short_name: 'Monger',
				description: 'Aplikasi keuangan collaborative untuk Gen Z',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				scope: '/',
				start_url: '/dashboard',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				// Fix: "Couldn't find configuration for either precaching or runtime caching"
				// Ensure globPatterns match SvelteKit build output
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
				
				navigateFallback: null,
				navigateFallbackDenylist: [/^\/api\//],
				skipWaiting: true,
				clientsClaim: true,
				cleanupOutdatedCaches: true,
				
				// Add runtime caching for resilience
				runtimeCaching: [
					{
						urlPattern: ({ request }) => request.destination === 'image',
						handler: 'CacheFirst',
						options: {
							cacheName: 'images',
							expiration: {
								maxEntries: 60,
								maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
							}
						}
					},
					{
						urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'static-resources',
							expiration: {
								maxEntries: 60,
								maxAgeSeconds: 24 * 60 * 60 // 24 Hours
							}
						}
					}
				]
			},
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	],

	ssr: {
		// Fix for: [SERVER ERROR] error: Cannot find package 'dexie'
		// Force bundling of Dexie for the server build (production only)
		// Conditional to avoid breaking local dev with semantic versioning errors in Vite 7
		noExternal: mode === 'production' ? ['dexie'] : []
	},

	build: {
		sourcemap: true,
		minify: 'esbuild',
		chunkSizeWarningLimit: 500,
		target: 'es2020'
	},

	optimizeDeps: {
		include: ['bits-ui', 'lucide-svelte', 'clsx', 'tailwind-merge']
	},

	esbuild: {
		drop: ['debugger']
	}
}));
