<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLLabelAttributes {
		/** Make label appear inactive */
		disabled?: boolean;
		/** Mark as required field */
		required?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		disabled = false,
		required = false,
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<label
	class={cn(
		'text-sm font-medium leading-none',
		'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		disabled && 'cursor-not-allowed opacity-70',
		className
	)}
	{...restProps}
>
	{@render children()}
	{#if required}
		<span class="text-error ml-0.5">*</span>
	{/if}
</label>
