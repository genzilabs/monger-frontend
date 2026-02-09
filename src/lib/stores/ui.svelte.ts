function createUIStore() {
	let _isTransactionModalOpen = $state(false);
	let _transactionModalDefaultType = $state<'income' | 'expense'>('expense');
	let _transactionModalPocketId = $state<string | undefined>(undefined);
	let _openReceiptScanner: (() => void) | null = $state(null);
	let _transactionRefreshTrigger = $state(0);

	return {
		get isTransactionModalOpen() { return _isTransactionModalOpen; },
		get transactionModalDefaultType() { return _transactionModalDefaultType; },
		get transactionModalPocketId() { return _transactionModalPocketId; },
		get transactionRefreshTrigger() { return _transactionRefreshTrigger; },

		openTransactionModal(type: 'income' | 'expense' = 'expense', pocketId?: string) {
			_transactionModalDefaultType = type;
			_transactionModalPocketId = pocketId;
			_isTransactionModalOpen = true;
		},

		closeTransactionModal() {
			_isTransactionModalOpen = false;
			// Reset defaults after short delay to allow transition to finish
			setTimeout(() => {
				_transactionModalDefaultType = 'expense';
				_transactionModalPocketId = undefined;
			}, 300);
		},

		// Signal that transactions were modified and pages should refresh
		triggerTransactionRefresh() {
			_transactionRefreshTrigger++;
		},

		// Receipt scanner - function is set by layout component
		set openReceiptScanner(fn: (() => void) | null) {
			_openReceiptScanner = fn;
		},

		scanReceipt() {
			if (_openReceiptScanner) {
				_openReceiptScanner();
			}
		}
	};
}

export const uiStore = createUIStore();

