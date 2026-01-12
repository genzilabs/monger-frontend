<script lang="ts">
	import { Button, Combobox, type ComboboxOption } from '$lib/components/ui';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import { booksStore, transactionsStore } from '$lib/stores';
	import { transactionsApi } from '$lib/api/transactions';
	import { categoriesApi } from '$lib/api/categories';
	import type { Transaction } from '$lib/types/transaction';
	import type { Category } from '$lib/types/category';
	import { untrack } from 'svelte';

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
	
	// Transfer specific state
	let fromPocketId = $state('');
	let toPocketId = $state('');
	let includeFee = $state(false);
	let fee = $state('');
	
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

	// Available pockets for selection (all pockets + any external pockets referenced in this transaction)
	const pocketOptions = $derived.by(() => {
		const baseOptions = booksStore.pockets.map(p => ({
			value: p.id,
			label: p.name,
			icon: '💰'
		}));

		// If we have a related pocket (from cross-book transfer) that isn't in the list, add it
		if (transaction?.related_pocket && !baseOptions.find(o => o.value === transaction.related_pocket!.id)) {
			baseOptions.push({
				value: transaction.related_pocket.id,
				label: transaction.related_pocket.name,
				icon: '🌐' // Different icon for external pocket
			});
		}

		// Also check current pocket (though unlikely to be missing if we are viewing it)
		if (transaction?.pocket && !baseOptions.find(o => o.value === transaction.pocket!.id)) {
			baseOptions.push({
				value: transaction.pocket.id,
				label: transaction.pocket.name,
				icon: '💰'
			});
		}

		return baseOptions;
	});

	// Populate form when transaction changes
	$effect(() => {
		if (open && transaction) {
			untrack(() => loadCategories());
			
			// Initialize with passed transaction data first (optimistic)
			initializeForm(transaction);

			// Fetch full details to ensure we have related_pocket and fees
			fetchFullTransactionDetails(transaction.id);
		}
	});

	async function fetchFullTransactionDetails(id: string) {
		try {
			const res = await transactionsApi.getById(id);
			if (res.data) {
				// Re-initialize with full data
				initializeForm(res.data);
			}
		} catch (e) {
			console.error('Failed to fetch transaction details', e);
		}
	}

	function initializeForm(tx: Transaction) {
		name = tx.name;
		amount = (Math.abs(tx.amount_cents) / 100).toString();
		
		// Handle fee & pockets for transfers
		if (tx.type === 'transfer') {
			// Use transfer_amount_cents if available (always positive), fallback to absolute amount
			const amtVal = tx.transfer_amount_cents ?? Math.abs(tx.amount_cents);
			amount = (amtVal / 100).toString();
			
			// Check transfer_fee_cents first (populated by backend for transfer context), then fallback to fee_cents
			const feeVal = tx.transfer_fee_cents ?? tx.fee_cents ?? 0;
			if (feeVal > 0) {
				includeFee = true;
				fee = (feeVal / 100).toString();
			} else {
				includeFee = false;
				fee = '';
			}
			
			// DEBUG: Log what we received
			console.log('DEBUG TX:', { 
				source_pocket: tx.source_pocket, 
				dest_pocket: tx.dest_pocket,
				transfer_amount_cents: tx.transfer_amount_cents,
				transfer_fee_cents: tx.transfer_fee_cents,
				is_source: tx.is_source
			});
			
			// Use source_pocket/dest_pocket if available (ALWAYS consistent From/To)
			if (tx.source_pocket && tx.dest_pocket) {
				fromPocketId = tx.source_pocket.id;
				toPocketId = tx.dest_pocket.id;
			} else {
				// Fallback to old heuristic logic
				let isSource = tx.is_source ?? (tx.amount_cents < 0) ?? (tx.fee_cents && tx.fee_cents > 0);
				if (isSource) {
					fromPocketId = tx.pocket_id;
					toPocketId = tx.related_pocket_id || tx.related_pocket?.id || '';
				} else {
					fromPocketId = tx.related_pocket_id || tx.related_pocket?.id || '';
					toPocketId = tx.pocket_id;
				}
			}
		} else {
			includeFee = false;
			fee = '';
			fromPocketId = '';
			toPocketId = '';
		}

		// Format date for datetime-local input
		const d = new Date(tx.date);
		d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
		date = d.toISOString().slice(0, 16);
		description = tx.description || '';
		categoryId = tx.category_id || '';
		subcategoryId = tx.subcategory_id || '';
	}

	// Filter categories by transaction type
	const filteredCategories = $derived(
		transaction && transaction.type !== 'transfer' 
			? categories.filter(c => c.type === transaction.type) 
			: []
	);

	// Category Options for Combobox
	const categoryOptions = $derived<ComboboxOption[]>(
		filteredCategories.map(c => ({
			value: c.id,
			label: c.name,
			icon: c.icon
		}))
	);
	
	// Get subcategories for selected category
	const selectedCategory = $derived(
		categories.find(c => c.id === categoryId)
	);
	
	const subcategories = $derived(
		selectedCategory?.subcategories || []
	);

	// Subcategory Options for Combobox
	const subcategoryOptions = $derived<ComboboxOption[]>(
		subcategories.map(s => ({
			value: s.id,
			label: s.name
		}))
	);

	async function handleSubmit() {
		if (!transaction || !name || !amount) return;

		isSubmitting = true;
		
		let amountCents = Math.round(parseFloat(amount) * 100);
		
		// Determine which fields to send for pockets
		let finalPocketId: string | undefined;
		let finalRelatedPocketId: string | undefined;

		if (isTransfer) {
			// Logic:
			// If we are editing "Outgoing" (Original Amount < 0):
			// - Current Pocket should be `fromPocketId`
			// - Related Pocket should be `toPocketId`
			if (transaction.amount_cents < 0) {
				if (fromPocketId !== transaction.pocket_id) finalPocketId = fromPocketId;
				// Check related (safely handle if related_pocket object vs id)
				const currentRelated = transaction.related_pocket_id || transaction.related_pocket?.id;
				if (toPocketId !== currentRelated) finalRelatedPocketId = toPocketId;
			} else {
				// If we are editing "Incoming" (Original Amount > 0):
				// - Current Pocket should be `toPocketId`
				// - Related Pocket should be `fromPocketId`
				if (toPocketId !== transaction.pocket_id) finalPocketId = toPocketId;
				const currentRelated = transaction.related_pocket_id || transaction.related_pocket?.id;
				if (fromPocketId !== currentRelated) finalRelatedPocketId = fromPocketId;
			}
		}

		// Amount sign logic: Always send positive amount to backend (validation requires min=1)
		// Backend handles negation based on type/context.
		amountCents = Math.abs(amountCents);

		// If user swapped pockets completely (From became To, To became From), we might be inverting direction?
		// But here we are just editing the pockets associated with this transaction record.
		// If I edit "Transfer Out" (A->B) and swap to (B->A), 
		// "From" becomes B, "To" becomes A.
		// `finalPocketId` = B. `finalRelatedPocketId` = A.
		// Backend will update: Current (was A) -> B. Related (was B) -> A.
		// Result: Current is now "Transfer Out" from B to A.
		// Logic holds.

		const feeCents = includeFee && fee ? Math.round(parseFloat(fee) * 100) : 0;
		const isoDate = new Date(date).toISOString();

		const result = await transactionsApi.update(transaction.id, {
			name,
			amount_cents: amountCents,
			date: isoDate,
			description,
			category_id: categoryId || undefined,
			subcategory_id: subcategoryId || undefined,
			fee_cents: feeCents,
			related_pocket_id: finalRelatedPocketId,
			pocket_id: finalPocketId
		});

		isSubmitting = false;

		if (result.data) {
			// Refresh pockets to update balances
			if (booksStore.activeBook) {
				await booksStore.loadPockets(booksStore.activeBook.id);
			}
			// Refresh transaction list
			await transactionsStore.refresh();
			onClose();
			if (onSaved) onSaved();
		}
	}
</script>

<BottomSheet {open} {onClose} title="Edit {isTransfer ? 'Transfer' : 'Transaction'}">
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
						class="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground text-lg font-semibold placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
			</div>

			<!-- Transfer Fee (Visible only for transfers) -->
			{#if isTransfer}
				<div class="bg-surface border border-border rounded-xl p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-foreground">Transaction Fee</span>
						<button 
							type="button"
							role="switch" 
							aria-checked={includeFee}
							class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 {includeFee ? 'bg-primary' : 'bg-muted'}"
							onclick={() => includeFee = !includeFee}
						>
							<span class="{includeFee ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
						</button>
					</div>
					{#if includeFee}
						<div class="mt-3 relative">
							<span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">Rp</span>
							<input
								type="number"
								bind:value={fee}
								placeholder="0"
								class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm font-semibold placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
							/>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Description / Name -->
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

			<!-- Transfer Pocket Selector -->
			{#if isTransfer}
				<div class="grid grid-cols-1 gap-4">
					<Combobox
						label="From Pocket"
						options={pocketOptions}
						bind:value={fromPocketId}
						placeholder="Select pocket"
						searchPlaceholder="Search..."
						emptyMessage="No pockets found"
					/>

					<!-- Swap Button -->
					<div class="flex justify-center -my-2">
						<button
							type="button"
							class="p-2 bg-surface border border-border rounded-full hover:bg-border transition-colors z-10"
							onclick={() => {
								const temp = fromPocketId;
								fromPocketId = toPocketId;
								toPocketId = temp;
							}}
							aria-label="Swap pockets"
						>
							<svg class="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
							</svg>
						</button>
					</div>

					<Combobox
						label="To Pocket"
						options={pocketOptions}
						bind:value={toPocketId}
						placeholder="Select pocket"
						searchPlaceholder="Search..."
						emptyMessage="No pockets found"
					/>
				</div>
			{/if}

			<!-- Category Selector (only for income/expense) -->
			{#if !isTransfer}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Combobox
						label="Category"
						options={categoryOptions}
						bind:value={categoryId}
						onValueChange={() => subcategoryId = ''}
						placeholder="Select category"
						searchPlaceholder="Search..."
						emptyMessage="No categories"
					/>
					<Combobox
						label="Subcategory"
						options={subcategoryOptions}
						bind:value={subcategoryId}
						placeholder="Optional"
						searchPlaceholder="Search..."
						emptyMessage="No subcategories"
						disabled={!categoryId || subcategoryOptions.length === 0}
					/>
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
