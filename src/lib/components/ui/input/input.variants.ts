import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Input variants for consistent styling across form inputs.
 */
export const inputVariants = tv({
	base: [
		'flex w-full',
		'bg-surface',
		'border border-border',
		'rounded-input',
		'text-foreground text-sm',
		'placeholder:text-muted',
		'transition-all duration-200',
		'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'file:border-0 file:bg-transparent file:text-sm file:font-medium',
		'read-only:bg-surface-elevated read-only:focus-visible:ring-0'
	],
	variants: {
		size: {
			default: 'h-11 px-4 py-2.5',
			sm: 'h-9 px-3 py-2 text-xs',
			lg: 'h-12 px-5 py-3'
		},
		hasError: {
			true: 'border-error focus-visible:border-error focus-visible:ring-error/20',
			false: ''
		},
		hasIcon: {
			true: 'pl-11',
			false: ''
		}
	},
	defaultVariants: {
		size: 'default',
		hasError: false,
		hasIcon: false
	}
});

export type InputSize = VariantProps<typeof inputVariants>['size'];
export type InputVariantsProps = VariantProps<typeof inputVariants>;
