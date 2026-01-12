<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn, generateId } from '$lib/utils';

	interface Props extends HTMLTextareaAttributes {
		/** Field label */
		label?: string;
		/** Error message */
		error?: string;
		/** Helper text */
		hint?: string;
		/** Two-way binding for value */
		value?: string;
		class?: string;
		wrapperClass?: string;
	}

	let {
		name,
		label,
		error,
		hint,
		rows = 3,
		disabled = false,
		required = false,
		value = $bindable(''),
		class: className,
		wrapperClass,
		...restProps
	}: Props = $props();

	const textareaId = name ?? generateId('textarea');
	const errorId = `${textareaId}-error`;

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		value = target.value;
	}
</script>

<div class={cn('flex flex-col gap-1.5', wrapperClass)}>
	{#if label}
		<label for={textareaId} class="text-sm font-medium text-foreground">
			{label}
			{#if required}
				<span class="text-error ml-0.5">*</span>
			{/if}
		</label>
	{/if}

	<textarea
		id={textareaId}
		{name}
		{rows}
		{value}
		{disabled}
		{required}
		oninput={handleInput}
		aria-invalid={!!error}
		aria-describedby={error ? errorId : undefined}
		class={cn(
			'flex min-h-[80px] w-full',
			'rounded-input border border-border bg-surface',
			'px-4 py-3 text-sm text-foreground',
			'placeholder:text-muted',
			'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'resize-y',
			error && 'border-error focus-visible:border-error focus-visible:ring-error/20',
			className
		)}
		{...restProps}
	></textarea>

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
