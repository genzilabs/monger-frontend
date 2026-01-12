<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Padding size */
		padding?: 'none' | 'sm' | 'default' | 'lg';
		/** Shadow intensity */
		shadow?: 'none' | 'sm' | 'default' | 'lg';
		/** Border style */
		bordered?: boolean;
		/** Interactive hover state */
		interactive?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Card content */
		children: Snippet;
	}

	let {
		padding = 'default',
		shadow = 'sm',
		bordered = true,
		interactive = false,
		class: className,
		children,
		...restProps
	}: Props = $props();

	const paddingClasses = {
		none: '',
		sm: 'p-3',
		default: 'p-5',
		lg: 'p-6'
	};

	const shadowClasses = {
		none: '',
		sm: 'shadow-sm',
		default: 'shadow-card',
		lg: 'shadow-lg'
	};
</script>

<div
	class={cn(
		'bg-surface rounded-card',
		paddingClasses[padding],
		shadowClasses[shadow],
		bordered && 'border border-border/50',
		interactive && 'cursor-pointer hover:shadow-lg hover:border-border transition-all duration-200',
		className
	)}
	{...restProps}
>
	{@render children()}
</div>
