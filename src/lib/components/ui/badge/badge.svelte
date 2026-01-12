<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { badgeVariants, type BadgeVariant, type BadgeSize } from './badge.variants';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: BadgeVariant;
		size?: BadgeSize;
		class?: string;
		children: Snippet;
	}

	let {
		variant = 'default',
		size = 'default',
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<span class={cn(badgeVariants({ variant, size }), className)} {...restProps}>
	{@render children()}
</span>
