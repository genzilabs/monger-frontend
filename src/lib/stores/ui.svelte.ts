function createUIStore() {
	let _isTransactionModalOpen = $state(false);
	let _transactionModalDefaultType = $state<'income' | 'expense'>('expense');
	let _transactionModalPocketId = $state<string | undefined>(undefined);

	return {
		get isTransactionModalOpen() { return _isTransactionModalOpen; },
		get transactionModalDefaultType() { return _transactionModalDefaultType; },
		get transactionModalPocketId() { return _transactionModalPocketId; },

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
		}
	};
}

export const uiStore = createUIStore();
