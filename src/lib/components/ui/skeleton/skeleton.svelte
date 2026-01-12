<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Show skeleton loading animation */
		loading?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		loading = true,
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

{#if loading}
	<div
		class={cn(
			'animate-pulse rounded-lg bg-surface',
			className
		)}
		{...restProps}
	></div>
{:else if children}
	{@render children()}
{/if}
