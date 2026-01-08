<script lang="ts">
	import { Button, Card } from '$lib/components/ui';
	import { CreateBookModal } from '$lib/components/modals';
	import { booksStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Book } from '$lib/types';

	let showCreateModal = $state(false);

	onMount(() => {
		booksStore.loadBooks();
	});

	function openBook(book: Book) {
		goto(`/books/${book.id}`);
	}
</script>

<svelte:head>
	<title>Books - Monger</title>
</svelte:head>

<div class="animate-fade-in">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Your Books</h1>
			<p class="text-secondary">Organize your finances</p>
		</div>
		<Button variant="primary" onclick={() => (showCreateModal = true)}>
			<svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
			New Book
		</Button>
	</div>

	<!-- Loading State -->
	{#if booksStore.isLoading && booksStore.books.length === 0}
		<div class="grid gap-4">
			{#each [1, 2, 3] as _}
				<div class="bg-surface rounded-2xl p-6 animate-pulse">
					<div class="h-6 bg-border rounded w-1/3 mb-2"></div>
					<div class="h-4 bg-border rounded w-1/2"></div>
				</div>
			{/each}
		</div>
	{:else if booksStore.books.length === 0}
		<!-- Empty State -->
		<Card class="text-center py-12">
			<div class="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
				<svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
			</div>
			<h2 class="text-lg font-semibold text-foreground mb-2">No Books Yet</h2>
			<p class="text-secondary mb-6 max-w-sm mx-auto">
				Create your first book to start tracking your finances with Pockets.
			</p>
			<Button variant="primary" onclick={() => (showCreateModal = true)}>
				Create Your First Book
			</Button>
		</Card>
	{:else}
		<!-- Books Grid -->
		<div class="grid gap-4">
			{#each booksStore.books as book}
				<button
					class="w-full text-left bg-surface rounded-2xl p-5 hover:shadow-lg transition-all duration-200 border border-transparent hover:border-primary/20"
					onclick={() => openBook(book)}
				>
					<div class="flex items-start gap-4">
						<div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
							<svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
							</svg>
						</div>
						<div class="flex-1 min-w-0">
							<h3 class="font-semibold text-foreground truncate">{book.name}</h3>
							{#if book.description}
								<p class="text-sm text-secondary truncate">{book.description}</p>
							{/if}
							<div class="flex items-center gap-4 mt-2 text-xs text-muted">
								<span class="flex items-center gap-1">
									<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
									</svg>
									{book.base_currency}
								</span>
							</div>
						</div>
						<svg class="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Error State -->
	{#if booksStore.error}
		<div class="mt-4 p-4 bg-red-100 text-red-700 rounded-xl text-sm">
			{booksStore.error}
		</div>
	{/if}
</div>

<!-- Create Book Modal -->
<CreateBookModal open={showCreateModal} onClose={() => (showCreateModal = false)} />
