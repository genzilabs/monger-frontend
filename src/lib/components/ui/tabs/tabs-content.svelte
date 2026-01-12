<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		/** Tab value this content belongs to */
		value: string;
		class?: string;
		children: Snippet;
	}

	let { value, class: className, children }: Props = $props();
</script>

<TabsPrimitive.Content
	{value}
	class={cn(
		'mt-4 ring-offset-background',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
		className
	)}
>
	{@render children()}
</TabsPrimitive.Content>
