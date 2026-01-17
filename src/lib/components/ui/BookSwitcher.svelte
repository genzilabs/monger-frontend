<script lang="ts">
	/**
	 * BookSwitcher - Horizontal carousel overlay for switching between books
	 */
	import { Button } from '$lib/components/ui';
	import { booksStore } from '$lib/stores';
	import type { Book } from '$lib/types';

	let { isOpen = $bindable(false), onClose = () => {}, onCreate = () => {} } = $props<{
		isOpen: boolean;
		onClose: () => void;
		onCreate: () => void;
	}>();

	function selectBook(book: Book) {
		booksStore.setActiveBook(book);
		onClose();
	}

	function formatBalance(cents: number, currency: string = 'IDR') {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0
		}).format(cents / 100);
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in"
		role="dialog"
		aria-modal="true"
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-6 pt-12 pb-4">
			<h2 class="text-xl font-bold text-foreground">Switch Book</h2>
			<button
				onclick={onClose}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border transition-colors hover:bg-border"
			>
				<svg class="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Context Label -->
		<div class="px-6 mb-4">
			<p class="text-muted text-sm font-medium uppercase tracking-widest">Select Context</p>
		</div>

		<!-- Horizontal Scroll Container -->
		<div class="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory px-6 gap-4 pb-8 no-scrollbar">
			{#if booksStore.isLoading && booksStore.books.length === 0}
				<!-- Loading skeleton -->
				{#each [1, 2] as _}
					<div class="snap-center shrink-0 w-[85%] max-w-[340px] h-[60vh] rounded-3xl bg-surface animate-pulse"></div>
				{/each}
			{:else}
				<!-- Book Cards -->
				{#each booksStore.books as book}
					<button
						onclick={() => selectBook(book)}
						class="snap-center shrink-0 w-[85%] max-w-[340px] h-[60vh] rounded-3xl relative overflow-hidden flex flex-col group transition-all duration-300 text-left
							{booksStore.activeBook?.id === book.id 
								? 'border-2 border-primary bg-surface' 
								: 'border border-border bg-surface opacity-80 hover:opacity-100'}"
					>
						<!-- Header Image Area -->
						<div class="h-1/2 w-full relative bg-gradient-to-br from-primary/30 to-primary/10">
							<div class="absolute inset-0 bg-gradient-to-b from-transparent to-surface"></div>
							
							{#if booksStore.activeBook?.id === book.id}
								<div class="absolute top-4 right-4 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30">
									<p class="text-primary text-xs font-bold">ACTIVE</p>
								</div>
							{/if}
						</div>

						<!-- Content Area -->
						<div class="flex-1 p-6 flex flex-col justify-end">
							<div class="mb-auto mt-4">
								<div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
									<svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
								</div>
							</div>

							<div class="space-y-1">
								<h3 class="text-foreground text-2xl font-bold">{book.name}</h3>
								{#if book.description}
									<p class="text-secondary text-sm">{book.description}</p>
								{:else}
									<p class="text-secondary text-sm">{book.base_currency} Account</p>
								{/if}
							</div>

							<div class="mt-6 pt-6 border-t border-border flex justify-between items-end">
								<div>
									<p class="text-muted text-xs mb-1">Current Balance</p>
									<p class="text-foreground text-xl font-mono">
										{formatBalance(0, book.base_currency)}
									</p>
								</div>
								<div class="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
									<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
									</svg>
									<span class="text-xs font-bold">Healthy</span>
								</div>
							</div>
						</div>
					</button>
				{/each}

			{/if}

			<!-- Right spacer -->
			<div class="w-4 shrink-0"></div>
		</div>

		<!-- Bottom Action -->
		<div class="p-6 pt-2 pb-8 bg-background">
			<button
				onclick={onCreate}
				class="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 group transition-all duration-200"
			>
				<div class="w-8 h-8 rounded-full bg-surface group-hover:bg-primary/10 flex items-center justify-center transition-colors">
					<svg class="w-5 h-5 text-muted group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
				</div>
				<span class="text-foreground font-medium">Create New Book</span>
			</button>
		</div>
	</div>
{/if}

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
