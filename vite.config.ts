import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sentrySvelteKit } from "@sentry/sveltekit";

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
		sveltekit()
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
