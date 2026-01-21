import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sentrySvelteKit } from "@sentry/sveltekit";

import { VitePWA } from 'vite-plugin-pwa';

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
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
			manifest: {
				name: 'Monger - Keuangan Gen Z',
				short_name: 'Monger',
				description: 'Aplikasi keuangan collaborative untuk Gen Z',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				scope: '/',
				start_url: '/',
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
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
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
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Vendor chunks for better caching
					if (id.includes('node_modules')) {
						if (id.includes('bits-ui') || id.includes('lucide')) {
							return 'ui-vendor';
						}
						if (id.includes('sentry')) {
							return 'sentry';
						}
						// Group remaining vendor deps
						return 'vendor';
					}
				}
			}
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
		drop: ['console', 'debugger'] // Remove in production
	}
});
