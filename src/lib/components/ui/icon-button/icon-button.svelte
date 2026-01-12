<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { tv, type VariantProps } from 'tailwind-variants';

	const iconButtonVariants = tv({
		base: [
			'inline-flex items-center justify-center',
			'rounded-full',
			'transition-colors duration-200',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
			'disabled:pointer-events-none disabled:opacity-50'
		],
		variants: {
			variant: {
				default: 'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary',
				secondary: 'bg-surface text-foreground border border-border hover:bg-border/50 focus-visible:ring-primary',
				ghost: 'text-muted hover:bg-surface hover:text-foreground focus-visible:ring-primary',
				destructive: 'bg-error text-white hover:bg-red-600 focus-visible:ring-error'
			},
			size: {
				sm: 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4',
				default: 'h-10 w-10 [&_svg]:h-5 [&_svg]:w-5',
				lg: 'h-12 w-12 [&_svg]:h-6 [&_svg]:w-6'
			}
		},
		defaultVariants: {
			variant: 'ghost',
			size: 'default'
		}
	});

	type IconButtonVariants = VariantProps<typeof iconButtonVariants>;

	interface Props extends HTMLButtonAttributes {
		variant?: IconButtonVariants['variant'];
		size?: IconButtonVariants['size'];
		/** Accessible label */
		label: string;
		class?: string;
		children: Snippet;
	}

	let {
		variant = 'ghost',
		size = 'default',
		type = 'button',
		disabled = false,
		label,
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<button
	{type}
	{disabled}
	aria-label={label}
	class={cn(iconButtonVariants({ variant, size }), className)}
	{...restProps}
>
	{@render children()}
</button>
