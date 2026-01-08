<script lang="ts">
	import { BottomNavbar, BookSwitcher } from '$lib/components/ui';
	import { CreateBookModal } from '$lib/components/modals';
	import { authStore, booksStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { children } = $props();
	
	let showBookSwitcher = $state(false);
	let showCreateBookModal = $state(false);

	const showBackButton = $derived($page.url.pathname !== '/dashboard');

	onMount(() => {
		if (!authStore.isInitialized) authStore.initialize();
		if (!booksStore.isInitialized) booksStore.initialize();
	});

	function goBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back();
		} else {
			goto('/dashboard');
		}
	}

	async function handleLogout() {
		await authStore.logout();
		goto('/auth');
	}
</script>

<div class="min-h-screen bg-background pb-28">
	<!-- Header -->
	<header class="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
		<div class="flex-between px-4 py-3">
			<div class="flex items-center gap-2">
				{#if showBackButton}
					<button onclick={goBack} class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface transition-colors" aria-label="Go back">
						<svg class="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
				{/if}

				<!-- Book Selector -->
				<button onclick={() => (showBookSwitcher = true)} class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface hover:bg-border transition-colors">
					{#if booksStore.activeBook}
						<div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
							<svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
							</svg>
						</div>
						<p class="text-sm font-medium text-foreground truncate max-w-[120px]">{booksStore.activeBook.name}</p>
					{:else if booksStore.books.length > 0}
						<div class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
							<svg class="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
							</svg>
						</div>
						<p class="text-sm text-muted">Select Book</p>
					{:else}
						<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
							<svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
						</div>
						<p class="text-sm text-primary font-medium">Create Book</p>
					{/if}
					<svg class="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
			</div>

			<div class="flex items-center gap-3">
				{#if authStore.user}
					<span class="text-sm text-secondary animate-fade-in hidden sm:block">{authStore.user.name || authStore.user.email}</span>
					<button onclick={handleLogout} class="p-2 text-muted hover:text-foreground transition-colors" aria-label="Logout">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
					</button>
				{:else}
					<div class="h-4 w-24 bg-surface rounded-full animate-pulse"></div>
					<div class="w-9 h-9 bg-surface rounded-full animate-pulse"></div>
				{/if}
			</div>
		</div>
	</header>

	<main class="px-6 py-8">
		{@render children()}
	</main>

	<BottomNavbar />
</div>

<!-- Book Switcher -->
<BookSwitcher 
	bind:isOpen={showBookSwitcher} 
	onClose={() => (showBookSwitcher = false)}
	onCreate={() => { showBookSwitcher = false; showCreateBookModal = true; }}
/>

<!-- Create Book Modal -->
<CreateBookModal open={showCreateBookModal} onClose={() => (showCreateBookModal = false)} />
