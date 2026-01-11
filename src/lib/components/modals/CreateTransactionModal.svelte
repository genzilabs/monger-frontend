<script lang="ts">
	import { Button } from '$lib/components/ui';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import { booksStore, transactionsStore } from '$lib/stores';
	import { categoriesApi } from '$lib/api/categories';
	import type { Category, Subcategory } from '$lib/types/category';
	import { onMount, untrack } from 'svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		defaultType?: 'income' | 'expense' | 'transfer';
		defaultPocketId?: string;
	}

	let { open, onClose, defaultType = 'expense', defaultPocketId }: Props = $props();

	let name = $state('');
	let amount = $state('');
	let type = $state<'income' | 'expense' | 'transfer'>(defaultType);
	let pocketId = $state(defaultPocketId || ''); // Acts as "From Pocket" for transfers
	let toPocketId = $state(''); // "To Pocket" for transfers
	let categoryId = $state('');
	let subcategoryId = $state('');
	
	// Categories state
	let categories = $state<Category[]>([]);
	let isLoadingCategories = $state(false);
	
	function getLocalDateTime() {
		const now = new Date();
		now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
		return now.toISOString().slice(0, 16);
	}

	let date = $state(getLocalDateTime());

	let isSubmitting = $state(false);

	// Load categories when component mounts or opens
	async function loadCategories() {
		if (categories.length > 0) return; // Already loaded
		isLoadingCategories = true;
		try {
			const response = await categoriesApi.list();
			if (response.data?.categories) {
				categories = response.data.categories;
			}
		} catch (e) {
			console.error('Failed to load categories', e);
		}
		isLoadingCategories = false;
	}

	// Reset form when opening
	$effect(() => {
		if (open) {
			loadCategories();
			untrack(() => {
				type = defaultType;
				// Default to first pocket if available and none selected
				if (defaultPocketId) {
					pocketId = defaultPocketId;
				} else if (!pocketId && booksStore.pockets.length > 0) {
					pocketId = booksStore.pockets[0].id;
				}
				// Default destination pocket (try to pick a different one if possible)
				if (booksStore.pockets.length > 1 && !toPocketId) {
					const other = booksStore.pockets.find(p => p.id !== pocketId);
					if (other) toPocketId = other.id;
				} else if (booksStore.pockets.length > 0 && !toPocketId) {
					toPocketId = booksStore.pockets[0].id;
				}
				// update date to now
				if (!date) date = getLocalDateTime();
			});
		}
	});

	// Filter categories by current type
	const filteredCategories = $derived(
		type === 'transfer' 
			? [] 
			: categories.filter(c => c.type === type)
	);
	
	// Get subcategories for selected category
	const selectedCategory = $derived(
		categories.find(c => c.id === categoryId)
	);
	
	const subcategories = $derived(
		selectedCategory?.subcategories || []
	);

	// Reset category when type changes
	$effect(() => {
		if (type === 'transfer') {
			categoryId = '';
			subcategoryId = '';
		} else {
			// Check if current category matches new type
			const currentCat = categories.find(c => c.id === categoryId);
			if (currentCat && currentCat.type !== type) {
				categoryId = '';
				subcategoryId = '';
			}
		}
	});

	async function handleSubmit() {
		if (!name || !amount) return;

		isSubmitting = true;
		const amountCents = Math.round(parseFloat(amount) * 100);

		let success = false;
		const isoDate = new Date(date).toISOString();

		if (type === 'transfer') {
			if (!pocketId || !toPocketId) {
				isSubmitting = false;
				return;
			}
			success = await transactionsStore.createTransfer({
				from_pocket_id: pocketId,
				to_pocket_id: toPocketId,
				name: name,
				amount_cents: amountCents,
				date: isoDate,
				description: ''
			});
		} else {
			if (!pocketId) {
				isSubmitting = false;
				return;
			}
			const tx = await transactionsStore.createTransaction({
				pocket_id: pocketId,
				name: name,
				amount_cents: amountCents,
				type: type as 'income' | 'expense',
				date: isoDate,
				category_id: categoryId || undefined,
				subcategory_id: subcategoryId || undefined
			});
			success = !!tx;
		}

		isSubmitting = false;

		if (success) {
			// Refresh pockets to update balance
			if (booksStore.activeBook) {
				await booksStore.loadPockets(booksStore.activeBook.id);
			}
			resetForm();
			onClose();
		}
	}

	function resetForm() {
		name = '';
		amount = '';
		type = defaultType;
		toPocketId = '';
		categoryId = '';
		subcategoryId = '';
		date = getLocalDateTime();
	}

	const pocketOptions = $derived(booksStore.pockets);
</script>

<BottomSheet {open} onClose={onClose} title={type === 'transfer' ? 'New Transfer' : 'New Transaction'}>
	<div class="space-y-4">
		<!-- Type Switcher -->
		<div class="flex p-1 bg-surface rounded-xl border border-border">
			<button 
				class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted hover:text-foreground'}"
				onclick={() => type = 'income'}
			>
				Income
			</button>
			<button 
				class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'text-muted hover:text-foreground'}"
				onclick={() => type = 'expense'}
			>
				Expense
			</button>
			<button 
				class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'transfer' ? 'bg-blue-500 text-white shadow-sm' : 'text-muted hover:text-foreground'}"
				onclick={() => type = 'transfer'}
			>
				Transfer
			</button>
		</div>

		<!-- Amount -->
		<div>
			<label for="amount" class="block text-sm font-medium text-secondary mb-1.5">Amount</label>
			<div class="relative">
				<span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">Rp</span>
				<input
					id="amount"
					type="number"
					bind:value={amount}
					placeholder="0"
					class="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground text-lg font-semibold placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>
		</div>

		<!-- Name -->
		<div>
			<label for="name" class="block text-sm font-medium text-secondary mb-1.5">Description</label>
			<input
				id="name"
				type="text"
				bind:value={name}
				placeholder="What is this for?"
				class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
			/>
		</div>

		<!-- Category Selector (only for income/expense) -->
		{#if type !== 'transfer'}
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="category" class="block text-sm font-medium text-secondary mb-1.5">Category</label>
					<select
						id="category"
						bind:value={categoryId}
						onchange={() => subcategoryId = ''}
						class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
					>
						<option value="">Select category</option>
						{#each filteredCategories as cat}
							<option value={cat.id}>{cat.icon} {cat.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="subcategory" class="block text-sm font-medium text-secondary mb-1.5">Subcategory</label>
					<select
						id="subcategory"
						bind:value={subcategoryId}
						disabled={!categoryId || subcategories.length === 0}
						class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none disabled:opacity-50"
					>
						<option value="">Optional</option>
						{#each subcategories as sub}
							<option value={sub.id}>{sub.name}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}

		<!-- Pocket Selector(s) -->
		<div class="grid grid-cols-1 gap-4">
			<div>
				<label for="pocket" class="block text-sm font-medium text-secondary mb-1.5">
					{type === 'transfer' ? 'From Pocket' : 'Pocket'}
				</label>
				<select
					id="pocket"
					bind:value={pocketId}
					class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
				>
					{#if pocketOptions.length === 0}
						<option value="" disabled>No pockets found</option>
					{/if}
					{#each pocketOptions as pocket}
						<option value={pocket.id}>{pocket.name}</option>
					{/each}
				</select>
			</div>

			{#if type === 'transfer'}
				<!-- Swap Button -->
				<div class="flex justify-center -my-2">
					<button
						type="button"
						class="p-2 bg-surface border border-border rounded-full hover:bg-border transition-colors"
						onclick={() => {
							const temp = pocketId;
							pocketId = toPocketId;
							toPocketId = temp;
						}}
						aria-label="Swap pockets"
					>
						<svg class="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
						</svg>
					</button>
				</div>

				<div>
					<label for="toPocket" class="block text-sm font-medium text-secondary mb-1.5">
						To Pocket
					</label>
					<select
						id="toPocket"
						bind:value={toPocketId}
						class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
					>
						{#if pocketOptions.length === 0}
							<option value="" disabled>No pockets found</option>
						{/if}
						{#each pocketOptions as pocket}
							<option value={pocket.id}>{pocket.name}</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>

		<!-- Date -->
		<div>
			<label for="date" class="block text-sm font-medium text-secondary mb-1.5">Date</label>
			<input
				id="date"
				type="datetime-local"
				bind:value={date}
				class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
			/>
		</div>
	</div>

	<div class="flex gap-3 mt-6">
		<Button variant="secondary" fullWidth onclick={onClose}>Cancel</Button>
		<Button variant="primary" fullWidth loading={isSubmitting} onclick={handleSubmit}>
			{#if type === 'transfer'}
				Transfer
			{:else}
				Add {type === 'income' ? 'Income' : 'Expense'}
			{/if}
		</Button>
	</div>
</BottomSheet>

