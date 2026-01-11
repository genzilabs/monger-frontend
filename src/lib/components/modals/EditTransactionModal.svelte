<script lang="ts">
	import { Button } from '$lib/components/ui';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import { booksStore } from '$lib/stores';
	import { transactionsApi } from '$lib/api/transactions';
	import { categoriesApi } from '$lib/api/categories';
	import type { Transaction } from '$lib/types/transaction';
	import type { Category } from '$lib/types/category';

	interface Props {
		transaction: Transaction | null;
		open: boolean;
		onClose: () => void;
		onSaved?: () => void;
	}

	let { transaction, open, onClose, onSaved }: Props = $props();

	let name = $state('');
	let amount = $state('');
	let date = $state('');
	let description = $state('');
	let categoryId = $state('');
	let subcategoryId = $state('');
	let isSubmitting = $state(false);
	
	// Categories
	let categories = $state<Category[]>([]);
	let isLoadingCategories = $state(false);

	const isTransfer = $derived(transaction?.type === 'transfer');

	// Load categories
	async function loadCategories() {
		if (categories.length > 0 || isLoadingCategories) return;
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

	// Populate form when transaction changes
	$effect(() => {
		if (open && transaction) {
			loadCategories();
			name = transaction.name;
			amount = (transaction.amount_cents / 100).toString();
			// Format date for datetime-local input
			const d = new Date(transaction.date);
			d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
			date = d.toISOString().slice(0, 16);
			description = transaction.description || '';
			categoryId = transaction.category_id || '';
			subcategoryId = transaction.subcategory_id || '';
		}
	});

	// Filter categories by transaction type
	const filteredCategories = $derived(
		transaction && transaction.type !== 'transfer' 
			? categories.filter(c => c.type === transaction.type) 
			: []
	);
	
	// Get subcategories for selected category
	const selectedCategory = $derived(
		categories.find(c => c.id === categoryId)
	);
	
	const subcategories = $derived(
		selectedCategory?.subcategories || []
	);

	async function handleSubmit() {
		if (!transaction || !name || !amount) return;

		isSubmitting = true;
		const amountCents = Math.round(parseFloat(amount) * 100);
		const isoDate = new Date(date).toISOString();

		const result = await transactionsApi.update(transaction.id, {
			name,
			amount_cents: amountCents,
			date: isoDate,
			description,
			category_id: categoryId || undefined,
			subcategory_id: subcategoryId || undefined
		});

		isSubmitting = false;

		if (result.data) {
			// Refresh pockets to update balances
			if (booksStore.activeBook) {
				await booksStore.loadPockets(booksStore.activeBook.id);
			}
			onClose();
			if (onSaved) onSaved();
		}
	}
</script>

<BottomSheet {open} {onClose} title="Edit Transaction">
	{#if transaction}
		<div class="space-y-4">
			<!-- Amount -->
			<div>
				<label for="edit-amount" class="block text-sm font-medium text-secondary mb-1.5">Amount</label>
				<div class="relative">
					<span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">Rp</span>
					<input
						id="edit-amount"
						type="number"
						bind:value={amount}
						placeholder="0"
						disabled={isTransfer}
						class="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground text-lg font-semibold placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
					/>
				</div>
				{#if isTransfer}
					<p class="text-xs text-muted mt-1">Transfer amount cannot be changed</p>
				{/if}
			</div>

			<!-- Name -->
			<div>
				<label for="edit-name" class="block text-sm font-medium text-secondary mb-1.5">Description</label>
				<input
					id="edit-name"
					type="text"
					bind:value={name}
					placeholder="What is this for?"
					class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>

			<!-- Category Selector (only for income/expense) -->
			{#if !isTransfer}
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-category" class="block text-sm font-medium text-secondary mb-1.5">Category</label>
						<select
							id="edit-category"
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
						<label for="edit-subcategory" class="block text-sm font-medium text-secondary mb-1.5">Subcategory</label>
						<select
							id="edit-subcategory"
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

			<!-- Date -->
			<div>
				<label for="edit-date" class="block text-sm font-medium text-secondary mb-1.5">Date</label>
				<input
					id="edit-date"
					type="datetime-local"
					bind:value={date}
					class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>

			<!-- Description/Notes -->
			<div>
				<label for="edit-description" class="block text-sm font-medium text-secondary mb-1.5">Notes</label>
				<textarea
					id="edit-description"
					bind:value={description}
					rows="2"
					placeholder="Additional notes (optional)"
					class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
				></textarea>
			</div>
		</div>

		<div class="flex gap-3 mt-6">
			<Button variant="secondary" fullWidth onclick={onClose}>Cancel</Button>
			<Button variant="primary" fullWidth loading={isSubmitting} onclick={handleSubmit}>
				Save Changes
			</Button>
		</div>
	{/if}
</BottomSheet>
