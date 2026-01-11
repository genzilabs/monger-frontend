import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { sentrySvelteKit } from "@sentry/sveltekit";

export default defineConfig({
	plugins: [sentrySvelteKit({
		sourceMapsUploadOptions: {
			org: "monger", // Placeholder, user can update
			project: "frontend", // Placeholder
			authToken: process.env.SENTRY_AUTH_TOKEN, // Optional
		}
	}), tailwindcss(), sveltekit()]
});
