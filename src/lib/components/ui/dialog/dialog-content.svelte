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

<DialogPrimitive.Portal>
	<DialogPrimitive.Overlay
		class={cn(
			'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
		)}
	/>
	<DialogPrimitive.Content
		class={cn(
			'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
			'w-full max-w-lg max-h-[90vh] overflow-y-auto',
			'bg-background rounded-2xl shadow-lg border border-border',
			'p-6',
			'duration-200',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
		'data-[state=closed]:slide-out-to-left-half data-[state=closed]:slide-out-to-top-48',
			'data-[state=open]:slide-in-from-left-half data-[state=open]:slide-in-from-top-48',
			className
		)}
	>
		{@render children()}
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
