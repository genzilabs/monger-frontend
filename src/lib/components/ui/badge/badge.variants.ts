import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Badge variants for status indicators, labels, and tags.
 */
export const badgeVariants = tv({
	base: [
		'inline-flex items-center',
		'font-medium',
		'transition-colors',
		'focus:outline-none focus:ring-2 focus:ring-offset-2'
	],
	variants: {
		variant: {
			default: 'bg-primary text-white',
			secondary: 'bg-surface text-secondary border border-border',
			success: 'bg-success/10 text-success border border-success/20',
			warning: 'bg-warning/10 text-warning border border-warning/20',
			error: 'bg-error/10 text-error border border-error/20',
			info: 'bg-info/10 text-info border border-info/20',
			outline: 'text-foreground border border-border'
		},
		size: {
			default: 'px-2.5 py-0.5 text-xs rounded-full',
			sm: 'px-2 py-px text-[10px] rounded-full',
			lg: 'px-3 py-1 text-sm rounded-full'
		}
	},
	defaultVariants: {
		variant: 'default',
		size: 'default'
	}
});

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
export type BadgeSize = VariantProps<typeof badgeVariants>['size'];
