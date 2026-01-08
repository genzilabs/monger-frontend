<script lang="ts">
	import { Logo } from '$lib/components/ui';
	import { page } from '$app/stores';

	let { children } = $props();

	// Pages that should show back button
	const showBackButton = $derived(
		$page.url.pathname !== '/auth' && $page.url.pathname !== '/'
	);
</script>

<div class="min-h-screen bg-background flex flex-col">
	<!-- Header -->
	<header class="flex items-center justify-between px-6 py-4">
		{#if showBackButton}
			<a
				href="/auth"
				class="p-2 -ml-2 text-secondary hover:text-foreground transition-colors"
				aria-label="Go back"
			>
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
			</a>
		{:else}
			<div class="w-10"></div>
		{/if}

		<!-- <Logo size="sm" /> -->

		<div class="w-10"></div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 flex flex-col px-6 pb-8">
		{@render children()}
	</main>
</div>
