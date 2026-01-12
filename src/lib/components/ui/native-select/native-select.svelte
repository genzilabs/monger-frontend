<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { cn, generateId } from '$lib/utils';
	import { ChevronDown } from 'lucide-svelte';

	interface Props extends Omit<HTMLSelectAttributes, 'class'> {
		/** Field label */
		label?: string;
		/** Error message */
		error?: string;
		/** Helper text */
		hint?: string;
		/** Placeholder/default option text */
		placeholder?: string;
		/** Two-way binding for value */
		value?: string;
		/** Additional CSS classes for the select */
		class?: string;
		/** Additional CSS classes for the wrapper */
		wrapperClass?: string;
		/** Select options */
		children: Snippet;
	}

	let {
		name,
		label,
		error,
		hint,
		placeholder = 'Select...',
		disabled = false,
		required = false,
		value = $bindable(''),
		class: className,
		wrapperClass,
		children,
		...restProps
	}: Props = $props();

	const selectId = name ?? generateId('select');
	const errorId = `${selectId}-error`;

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		value = target.value;
	}
</script>

<div class={cn('flex flex-col gap-1.5', wrapperClass)}>
	{#if label}
		<label for={selectId} class="text-sm font-medium text-foreground">
			{label}
			{#if required}
				<span class="text-error ml-0.5">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative">
		<select
			id={selectId}
			{name}
			{value}
			{disabled}
			{required}
			onchange={handleChange}
			aria-invalid={!!error}
			aria-describedby={error ? errorId : undefined}
			class={cn(
				'flex h-11 w-full appearance-none items-center',
				'rounded-input border border-border bg-surface',
				'px-4 py-2.5 pr-10 text-sm text-foreground',
				'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
				'disabled:cursor-not-allowed disabled:opacity-50',
				error && 'border-error focus-visible:border-error focus-visible:ring-error/20',
				!value && 'text-muted',
				className
			)}
			{...restProps}
		>
			{#if placeholder}
				<option value="" disabled class="text-muted">{placeholder}</option>
			{/if}
			{@render children()}
		</select>
		<div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
			<ChevronDown class="h-4 w-4" />
		</div>
	</div>

	{#if error}
		<p id={errorId} class="text-xs text-error animate-fade-in" role="alert">
			{error}
		</p>
	{:else if hint}
		<p class="text-xs text-muted">
			{hint}
		</p>
	{/if}
</div>
