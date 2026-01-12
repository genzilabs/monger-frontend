<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Default active tab value */
		value?: string;
		/** Callback when tab changes */
		onValueChange?: (value: string) => void;
		class?: string;
		children: Snippet;
	}

	let {
		value = $bindable(''),
		onValueChange,
		class: className,
		children
	}: Props = $props();
</script>

<TabsPrimitive.Root
	bind:value
	onValueChange={onValueChange}
	class={className}
>
	{@render children()}
</TabsPrimitive.Root>
