<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type Side = 'top' | 'bottom' | 'left' | 'right';

	interface Props {
		/** Side from which the sheet appears */
		side?: Side;
		class?: string;
		children: Snippet;
	}

	let { side = 'bottom', class: className, children }: Props = $props();

	const sideClasses: Record<Side, string> = {
		top: 'inset-x-0 top-0 border-b rounded-b-2xl data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
		bottom: 'inset-x-0 bottom-0 border-t rounded-t-2xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
		left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
		right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
	};
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
			'fixed z-50 bg-background shadow-lg',
			'p-6',
			'duration-300 ease-out',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			sideClasses[side],
			className
		)}
	>
		<!-- Drag handle for bottom sheets -->
		{#if side === 'bottom'}
			<div class="absolute left-1/2 top-2 -translate-x-1/2">
				<div class="h-1 w-10 rounded-full bg-border"></div>
			</div>
		{/if}
		<div class={side === 'bottom' ? 'pt-2' : ''}>
			{@render children()}
		</div>
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
