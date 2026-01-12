<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<DialogPrimitive.Description class={cn('text-sm text-secondary', className)}>
	{@render children()}
</DialogPrimitive.Description>
