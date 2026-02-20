import { booksStore, transactionsStore, categoriesStore, toastStore } from '$lib/stores';
import { uiStore } from '$lib/stores/ui.svelte';
import type { Category } from '$lib/types/category';
import type { Pocket } from '$lib/types';
import { pocketsApi } from '$lib/api/pockets';
import { p2pApi } from '$lib/api/p2p';

export function createTransactionFormState() {
	let type = $state<'income' | 'expense' | 'transfer'>('expense');
	let amount = $state('');
	let name = $state('');
	let date = $state(getLocalDateTime());
	
	let pocketId = $state('');
	let toPocketId = $state('');
	let categoryId = $state('');
	let subcategoryId = $state('');
	
	let isCrossBook = $state(false);
	let fromBookId = $state('');
	let toBookId = $state('');
	
	let fromBookPockets = $state<Pocket[]>([]);
	let isLoadingFromPockets = $state(false);
	
	let toBookPockets = $state<Pocket[]>([]);
	let isLoadingToPockets = $state(false);
	
	let isP2P = $state(false);
	let recipientEmail = $state('');
	
	let includeFee = $state(false);
	let fee = $state('');
	
	let isSubmitting = $state(false);

	function getLocalDateTime() {
		const now = new Date();
		const tzOffset = now.getTimezoneOffset() * 60000;
		const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
		return localISOTime;
	}

	function reset() {
		name = '';
		amount = '';
		// type is usually reset by the caller based on defaultType
		toPocketId = '';
		categoryId = '';
		subcategoryId = '';
		includeFee = false;
		fee = '';
		isCrossBook = false;
		isP2P = false;
		recipientEmail = '';
		fromBookId = booksStore.activeBook?.id || '';
		toBookId = booksStore.activeBook?.id || '';
		date = getLocalDateTime();
		pocketId = '';
	}

	async function loadPocketsForBook(targetBookId: string, setActive: boolean = false) {
		if (!targetBookId) return [];
		if (booksStore.activeBook && targetBookId === booksStore.activeBook.id) {
			return booksStore.pockets;
		}

		try {
			if (setActive) isLoadingToPockets = true;
			else isLoadingFromPockets = true;
			
			const res = await pocketsApi.listByBook(targetBookId);
			const loadedPockets = res.data?.pockets || [];
			
			if (setActive) toBookPockets = loadedPockets;
			else fromBookPockets = loadedPockets;
			
			return loadedPockets;
		} catch (e) {
			toastStore.error("Failed to load pockets for selected book");
			return [];
		} finally {
			if (setActive) isLoadingToPockets = false;
			else isLoadingFromPockets = false;
		}
	}

	async function submit() {
		if (!name || !amount) return false;

		isSubmitting = true;
		const amountCents = Math.round(parseFloat(amount) * 100);
		const feeCents = includeFee && fee ? Math.round(parseFloat(fee) * 100) : 0;

		try {
			// Ensure date is properly formatted as RFC3339
			const dateObj = new Date(date);
			const isoDate = dateObj.toISOString();

			if (type === 'transfer') {
				if (isP2P) {
					if (!recipientEmail || !fromBookId || !pocketId) return false;
					const response = await p2pApi.create({
						sender_pocket_id: pocketId,
						recipient_email: recipientEmail,
						name: name,
						amount_cents: amountCents,
						fee_cents: feeCents,
						description: ''
					});
					if (response.error || !response.data) throw new Error("P2P transfer failed");
				} else {
					if (!pocketId || !toPocketId) return false;
					const tx = await transactionsStore.createTransfer({
						from_pocket_id: pocketId,
						to_pocket_id: toPocketId,
						name: name,
						amount_cents: amountCents,
						fee_cents: feeCents,
						date: isoDate,
						description: ''
					});
					if (!tx) throw new Error("Transfer failed");
				}
			} else {
				if (!pocketId) return false;
				const tx = await transactionsStore.createTransaction({
					pocket_id: pocketId,
					name: name,
					amount_cents: amountCents,
					type: type as 'income' | 'expense',
					category_id: categoryId || undefined,
					subcategory_id: subcategoryId || undefined,
					date: isoDate,
					description: ''
				});
				if (!tx) throw new Error("Transaction failed");
			}

			// Clean up and notify
			await transactionsStore.refresh();
			uiStore.triggerTransactionRefresh();
			reset();
			return true;
		} catch (e: any) {
			toastStore.error(e.message || 'Gagal menyimpan transaksi');
			return false;
		} finally {
			isSubmitting = false;
		}
	}

	return {
		get type() { return type; },
		set type(val) { type = val; },
		get amount() { return amount; },
		set amount(val) { amount = val; },
		get name() { return name; },
		set name(val) { name = val; },
		get date() { return date; },
		set date(val) { date = val; },
		
		get pocketId() { return pocketId; },
		set pocketId(val) { pocketId = val; },
		get toPocketId() { return toPocketId; },
		set toPocketId(val) { toPocketId = val; },
		get categoryId() { return categoryId; },
		set categoryId(val) { categoryId = val; },
		get subcategoryId() { return subcategoryId; },
		set subcategoryId(val) { subcategoryId = val; },
		
		get isCrossBook() { return isCrossBook; },
		set isCrossBook(val) { isCrossBook = val; },
		get fromBookId() { return fromBookId; },
		set fromBookId(val) { fromBookId = val; },
		get toBookId() { return toBookId; },
		set toBookId(val) { toBookId = val; },
		
		get fromBookPockets() { return fromBookPockets; },
		get isLoadingFromPockets() { return isLoadingFromPockets; },
		get toBookPockets() { return toBookPockets; },
		get isLoadingToPockets() { return isLoadingToPockets; },
		
		get isP2P() { return isP2P; },
		set isP2P(val) { isP2P = val; },
		get recipientEmail() { return recipientEmail; },
		set recipientEmail(val) { recipientEmail = val; },
		
		get includeFee() { return includeFee; },
		set includeFee(val) { includeFee = val; },
		get fee() { return fee; },
		set fee(val) { fee = val; },
		
		get isSubmitting() { return isSubmitting; },
		
		getLocalDateTime,
		reset,
		loadPocketsForBook,
		submit
	};
}

export type TransactionFormState = ReturnType<typeof createTransactionFormState>;
