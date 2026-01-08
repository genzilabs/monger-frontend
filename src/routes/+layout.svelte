<script lang="ts">
	import '../app.css';
	import { authStore } from '$lib/stores';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		authStore.initialize();
	});
</script>

<svelte:head>
	<title>Monger - Financial Zen</title>
	<meta name="description" content="Master your assets. Organize your life into Books and Pockets with Monger." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

{@render children()}
