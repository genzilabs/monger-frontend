<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { buttonVariants, type ButtonVariant, type ButtonSize } from './button.variants';
	import Loader from '../loader/loader.svelte';

	interface Props extends HTMLButtonAttributes {
		/** Visual style variant */
		variant?: ButtonVariant;
		/** Button size */
		size?: ButtonSize;
		/** Show loading spinner and disable button */
		loading?: boolean;
		/** Make button full width */
		fullWidth?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Button content */
		children: Snippet;
		/** Optional icon slot (left side) */
		icon?: Snippet;
	}

	let {
		variant = 'default',
		size = 'default',
		type = 'button',
		disabled = false,
		loading = false,
		fullWidth = false,
		class: className,
		children,
		icon,
		...restProps
	}: Props = $props();

	const isDisabled = $derived(disabled || loading);
</script>

<button
	{type}
	disabled={isDisabled}
	class={cn(
		buttonVariants({ variant, size }),
		fullWidth && 'w-full',
		className
	)}
	{...restProps}
>
	{#if loading}
		<Loader size="sm" />
	{:else if icon}
		{@render icon()}
	{/if}
	{@render children()}
</button>
