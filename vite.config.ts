import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sentrySvelteKit } from "@sentry/sveltekit";

import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
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
				globPatterns: ['client/**/*.{js,css,html,ico,png,svg,woff2}'],
				navigateFallback: null,
				navigateFallbackDenylist: [/^\/api\//],
				skipWaiting: true,
				clientsClaim: true,
				cleanupOutdatedCaches: true
			},
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	],
	
	// Performance optimizations
	build: {
		// Enable minification (esbuild is default and faster)
		minify: 'esbuild',
		
		// Code splitting - create smaller chunks
		// Code splitting is handled automatically by Vite
		rollupOptions: {
            // explicit empty to clear previous config if needed, or just remove the block
        },
		
		// Increase chunk size warning limit
		chunkSizeWarningLimit: 500,
		
		// Target modern browsers for smaller output
		target: 'es2020'
	},
	
	// Optimize dependencies
	optimizeDeps: {
		include: ['bits-ui', 'lucide-svelte', 'clsx', 'tailwind-merge']
	},
	
	// Enable esbuild optimizations
	esbuild: {
		drop: ['debugger'] // Keep console for server logs, only drop debugger
	}
});
