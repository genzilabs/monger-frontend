<script lang="ts">
	import '../app.css';
	import { authStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	onMount(() => {
		authStore.initialize();
		
		// Lazy load fonts after initial render
		if (browser) {
			const fontLink = document.createElement('link');
			fontLink.rel = 'stylesheet';
			fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
			document.head.appendChild(fontLink);
		}
	});
</script>

<svelte:head>
	<title>Monger - Financial Zen</title>
	<meta name="description" content="Master your assets. Organize your life into Books and Pockets with Monger." />
	
	<!-- Preconnect to Google Fonts (improves connection time) -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	
	<!-- Preload font CSS (highest priority, non-blocking) -->
	<link 
		rel="preload"
		as="style"
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
	/>
	
	<!-- Fallback for browsers without JS -->
	<noscript>
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
	</noscript>
</svelte:head>

{@render children()}
