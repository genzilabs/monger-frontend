import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Avatar variants for user profile images and initials.
 */
export const avatarVariants = tv({
	base: [
		'relative flex shrink-0 overflow-hidden rounded-full',
		'bg-surface border border-border'
	],
	variants: {
		size: {
			xs: 'h-6 w-6 text-[10px]',
			sm: 'h-8 w-8 text-xs',
			default: 'h-10 w-10 text-sm',
			lg: 'h-12 w-12 text-base',
			xl: 'h-16 w-16 text-lg',
			'2xl': 'h-20 w-20 text-xl'
		}
	},
	defaultVariants: {
		size: 'default'
	}
});

export type AvatarSize = VariantProps<typeof avatarVariants>['size'];
