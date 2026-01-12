<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { X } from 'lucide-svelte';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();
</script>

<DialogPrimitive.Close
	class={cn(
		'absolute right-4 top-4',
		'rounded-sm opacity-70 ring-offset-background transition-opacity',
		'hover:opacity-100',
		'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
		'disabled:pointer-events-none',
		className
	)}
>
	<X class="h-4 w-4" />
	<span class="sr-only">Close</span>
</DialogPrimitive.Close>
