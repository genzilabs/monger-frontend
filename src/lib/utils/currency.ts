export function formatCurrency(amountCents: number, currency = 'IDR', locale = 'id-ID'): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amountCents / 100);
}
