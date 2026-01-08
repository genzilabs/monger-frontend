<script lang="ts">
	import type { Snippet } from 'svelte';

	type InputType = 'text' | 'email' | 'password' | 'tel' | 'number';
	type AutoFillValue = 'email' | 'tel' | 'name' | 'username' | 'current-password' | 'new-password' | 'off' | 'on';

	interface Props {
		type?: InputType;
		name?: string;
		value?: string;
		placeholder?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		autocomplete?: AutoFillValue;
		onchange?: (value: string) => void;
		oninput?: (value: string) => void;
		onblur?: () => void;
		onfocus?: () => void;
		icon?: Snippet;
	}

	let {
		type = 'text',
		name,
		value = $bindable(''),
		placeholder = '',
		label,
		error,
		disabled = false,
		required = false,
		autocomplete,
		onchange,
		oninput,
		onblur,
		onfocus,
		icon
	}: Props = $props();

	const inputId = name || `input-${Math.random().toString(36).slice(2, 9)}`;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		oninput?.(target.value);
	}

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onchange?.(target.value);
	}
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label
			for={inputId}
			class="text-sm font-medium text-slate-700"
		>
			{label}
			{#if required}
				<span class="text-error">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative">
		{#if icon}
			<div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
				{@render icon()}
			</div>
		{/if}

		<input
			id={inputId}
			{type}
			{name}
			{value}
			{placeholder}
			{disabled}
			{required}
			{autocomplete}
			oninput={handleInput}
			onchange={handleChange}
			onblur={onblur}
			onfocus={onfocus}
			class="
				w-full px-4 py-3
				{icon ? 'pl-12' : ''}
				bg-surface
				border border-border
				rounded-input
				text-foreground
				placeholder:text-slate-500
				transition-all duration-200
				focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
				disabled:opacity-50 disabled:cursor-not-allowed
				{error ? 'border-error focus:border-error focus:ring-error/20' : ''}
			"
		/>
	</div>

	{#if error}
		<p class="text-sm text-error animate-fade-in">
			{error}
		</p>
	{/if}
</div>
