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

<DialogPrimitive.Title
	class={cn('text-lg font-semibold text-foreground leading-none tracking-tight', className)}
>
	{@render children()}
</DialogPrimitive.Title>
