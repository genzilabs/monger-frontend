<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Control dialog open state */
		open?: boolean;
		/** Callback when open state changes */
		onOpenChange?: (open: boolean) => void;
		/** Dialog content */
		children: Snippet;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		children
	}: Props = $props();

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}
</script>

<DialogPrimitive.Root bind:open onOpenChange={handleOpenChange}>
	{@render children()}
</DialogPrimitive.Root>
