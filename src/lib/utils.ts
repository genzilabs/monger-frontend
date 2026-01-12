import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper conflict resolution.
 * This is the core utility for all shadcn-svelte components.
 *
 * @example
 * cn('px-4 py-2', 'px-6') // → 'py-2 px-6'
 * cn('bg-red-500', condition && 'bg-blue-500')
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

/**
 * Format currency with proper locale and symbol.
 * Follows enterprise standards for financial applications.
 */
export function formatCurrency(
	amountCents: number,
	currency: string = 'IDR',
	locale: string = 'id-ID'
): string {
	const formatter = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});
	return formatter.format(amountCents / 100);
}

/**
 * Format a date string to locale-specific format.
 */
export function formatDate(
	date: string | Date,
	options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}
): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('id-ID', options);
}

/**
 * Format a datetime string with time included.
 */
export function formatDateTime(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('id-ID', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	fn: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

/**
 * Generate a random ID for component instances.
 */
export function generateId(prefix: string = 'id'): string {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Type-safe object keys helper.
 */
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
	return Object.keys(obj) as (keyof T)[];
}
