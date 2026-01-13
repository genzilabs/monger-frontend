<script lang="ts">
	import { booksStore, authStore } from '$lib/stores';
	import { booksApi } from '$lib/api';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { CreatePocketModal, InviteMemberModal, MembersListModal } from '$lib/components/modals';

	let bookId = $derived($page.params.id);
	let showCreatePocketModal = $state(false);
	let showInviteModal = $state(false);
	let showMembersModal = $state(false);
	let activeFilter = $state('all');

	// Check if current user is owner
	const isOwner = $derived(booksStore.activeBook?.owner_id === authStore.user?.id);

	const filters = [
		{ id: 'all', label: 'All Pockets' },
		{ id: 'savings', label: 'Savings' },
		{ id: 'expenses', label: 'Expenses' }
	];

	const pocketIcons: Record<string, string> = {
		'cash': '💵',
		'bank': '🏦',
		'e-wallet': '📱',
		'credit': '💳'
	};

	onMount(async () => {
		if (!bookId) {
			goto('/dashboard');
			return;
		}
		const result = await booksApi.get(bookId);
		if (result.data) {
			await booksStore.setActiveBook(result.data);
		} else {
			goto('/dashboard');
		}
	});

	function formatBalance(cents: number, currency: string = 'IDR') {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0
		}).format(cents / 100);
	}

	function getTotalBalance() {
		return booksStore.pockets.reduce((sum, p) => sum + p.balance_cents, 0);
	}

	function getPocketIcon(typeSlug: string) {
		return pocketIcons[typeSlug] || '💰';
	}

	function handleInviteFromMembers() {
		showMembersModal = false;
		showInviteModal = true;
	}
</script>

<svelte:head>
	<title>{booksStore.activeBook?.name || 'Book'} - Monger</title>
</svelte:head>

<div class="animate-fade-in">
	<main class="flex-1 flex flex-col gap-6">
		{#if booksStore.activeBook}
			<!-- Hero Card -->
			<div class="w-full bg-gradient-to-br from-surface to-background rounded-3xl border border-border p-6 relative overflow-hidden">
				<div class="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
				
				<div class="relative z-10">
					<div class="flex justify-between items-start mb-4">
						<div>
							<span class="text-primary text-sm font-semibold tracking-wider uppercase">BOOK</span>
							<h1 class="text-2xl font-bold text-foreground">{booksStore.activeBook.name}</h1>
						</div>
						<button
							onclick={() => (showMembersModal = true)}
							class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
							aria-label="View members"
						>
							<svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</button>
					</div>
					
					<p class="text-sm text-muted">Total Balance</p>
					<div class="flex items-baseline gap-3 mt-1">
						<span class="text-4xl font-bold tracking-tight text-foreground">
							{formatBalance(getTotalBalance(), booksStore.activeBook.base_currency)}
						</span>
						{#if booksStore.pockets.length > 0}
							<span class="flex items-center text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">
								<svg class="w-4 h-4 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
								Healthy
							</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Filter Chips -->
			<div class="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
				{#each filters as filter}
					<button
						onclick={() => (activeFilter = filter.id)}
						class="flex h-10 shrink-0 items-center justify-center px-5 rounded-full text-sm font-medium transition-all active:scale-95 {activeFilter === filter.id 
							? 'bg-primary text-white' 
							: 'bg-surface border border-border text-muted'}"
					>
						{filter.label}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Pockets List -->
		<div class="flex flex-col gap-3">
			{#if booksStore.pockets.length === 0}
				<div class="flex flex-col items-center justify-center py-10 text-center">
					<div class="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
						<svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-foreground">No Pockets Yet</h3>
					<p class="text-sm text-muted mt-1">Create your first pocket to start tracking</p>
				</div>
			{:else}
				{#each booksStore.pockets as pocket}
					<a href="/pockets/{pocket.id}" class="group w-full flex flex-col gap-4 p-4 rounded-2xl bg-surface border border-border hover:border-muted transition-colors text-left block">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="flex items-center justify-center w-12 h-12 rounded-xl text-2xl" style="background: {pocket.color}20">
									{getPocketIcon(pocket.type_slug)}
								</div>
								<div>
									<h3 class="text-base font-semibold text-foreground">{pocket.name}</h3>
									<p class="text-sm text-muted capitalize">{pocket.type_slug.replace('-', ' ')}</p>
								</div>
							</div>
							<p class="text-lg font-bold text-foreground" class:text-red-500={pocket.balance_cents < 0}>
								{formatBalance(pocket.balance_cents, booksStore.activeBook?.base_currency)}
							</p>
						</div>
						<div class="w-full h-1.5 bg-border rounded-full overflow-hidden">
							<div class="h-full rounded-full" style="background: {pocket.color}; width: 45%"></div>
						</div>
					</a>
				{/each}
			{/if}

			<!-- Add New Pocket Button -->
			<button
				onclick={() => (showCreatePocketModal = true)}
				class="group flex items-center justify-center gap-3 p-5 rounded-3xl border border-dashed border-border hover:border-muted hover:bg-surface transition-all h-[100px]"
			>
				<svg class="w-6 h-6 text-muted group-hover:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span class="text-muted font-medium group-hover:text-secondary">Create new pocket</span>
			</button>
		</div>
	</main>
</div>

<!-- Create Pocket Modal -->
<CreatePocketModal open={showCreatePocketModal} onClose={() => (showCreatePocketModal = false)} />

<!-- Collaboration Modals -->
{#if bookId}
	<MembersListModal 
		open={showMembersModal} 
		onClose={() => (showMembersModal = false)} 
		{bookId}
		{isOwner}
		onInvite={handleInviteFromMembers}
	/>

	<InviteMemberModal 
		open={showInviteModal} 
		onClose={() => (showInviteModal = false)} 
		{bookId}
	/>
{/if}

<style>
	.no-scrollbar::-webkit-scrollbar { display: none; }
	.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
