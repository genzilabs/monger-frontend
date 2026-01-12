import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Button variants using tailwind-variants for type-safe styling.
 * 
 * Enterprise-grade button component with:
 * - Multiple visual variants
 * - Size options
 * - Full accessibility support
 * - Loading states
 */
export const buttonVariants = tv({
	base: [
		'inline-flex items-center justify-center gap-2',
		'font-semibold whitespace-nowrap',
		'transition-all duration-200 ease-out',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
		'disabled:pointer-events-none disabled:opacity-50',
		'[&_svg]:pointer-events-none [&_svg]:shrink-0'
	],
	variants: {
		variant: {
			default: [
				'bg-primary text-white',
				'hover:bg-primary-hover',
				'focus-visible:ring-primary',
				'shadow-button hover:shadow-lg'
			],
			// Alias for backward compatibility
			primary: [
				'bg-primary text-white',
				'hover:bg-primary-hover',
				'focus-visible:ring-primary',
				'shadow-button hover:shadow-lg'
			],
			destructive: [
				'bg-error text-white',
				'hover:bg-red-600',
				'focus-visible:ring-error',
				'shadow-md hover:shadow-lg'
			],
			// Alias for backward compatibility
			danger: [
				'bg-error text-white',
				'hover:bg-red-600',
				'focus-visible:ring-error',
				'shadow-md hover:shadow-lg'
			],
			outline: [
				'border border-border bg-transparent',
				'text-foreground',
				'hover:bg-surface hover:border-muted',
				'focus-visible:ring-primary'
			],
			secondary: [
				'bg-surface text-foreground',
				'border border-border',
				'hover:bg-border/50',
				'focus-visible:ring-primary'
			],
			ghost: [
				'bg-transparent text-secondary',
				'hover:bg-surface hover:text-foreground',
				'focus-visible:ring-primary'
			],
			link: [
				'text-primary underline-offset-4',
				'hover:underline',
				'focus-visible:ring-primary'
			]
		},
		size: {
			default: 'h-11 px-5 py-2.5 rounded-button text-sm',
			sm: 'h-9 px-4 py-2 rounded-lg text-xs',
			// Alias for backward compatibility
			md: 'h-11 px-5 py-2.5 rounded-button text-sm',
			lg: 'h-12 px-8 py-3 rounded-button text-base',
			xl: 'h-14 px-10 py-4 rounded-xl text-lg',
			icon: 'h-10 w-10 rounded-button'
		}
	},
	defaultVariants: {
		variant: 'default',
		size: 'default'
	}
});

export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
export type ButtonSize = VariantProps<typeof buttonVariants>['size'];
export type ButtonVariantsProps = VariantProps<typeof buttonVariants>;
