<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<TabsPrimitive.List
	class={cn(
		'inline-flex h-11 items-center justify-center rounded-xl',
		'bg-surface p-1 text-secondary w-full',
		className
	)}
>
	{@render children()}
</TabsPrimitive.List>
