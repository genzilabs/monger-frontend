<script lang="ts">
	import { cn, generateId } from '$lib/utils';
	import { Check, ChevronDown, Search, X } from 'lucide-svelte';

	export interface ComboboxOption {
		value: string;
		label: string;
		icon?: string;
		disabled?: boolean;
	}

	interface Props {
		/** Available options */
		options: ComboboxOption[];
		/** Current value */
		value?: string;
		/** Callback when value changes */
		onValueChange?: (value: string) => void;
		/** Field label */
		label?: string;
		/** Placeholder text */
		placeholder?: string;
		/** Search input placeholder */
		searchPlaceholder?: string;
		/** Empty state message */
		emptyMessage?: string;
		/** Error message */
		error?: string;
		/** Helper text */
		hint?: string;
		/** Disabled state */
		disabled?: boolean;
		/** Required field */
		required?: boolean;
		/** Additional CSS classes for the trigger */
		class?: string;
		/** Additional CSS classes for the wrapper */
		wrapperClass?: string;
	}

	let {
		options,
		value = $bindable(''),
		onValueChange,
		label,
		placeholder = 'Select...',
		searchPlaceholder = 'Search...',
		emptyMessage = 'No results found.',
		error,
		hint,
		disabled = false,
		required = false,
		class: className,
		wrapperClass
	}: Props = $props();

	const comboboxId = generateId('combobox');
	const errorId = `${comboboxId}-error`;
	const listboxId = `${comboboxId}-listbox`;

	let searchQuery = $state('');
	let open = $state(false);
	let highlightedIndex = $state(-1);
	let inputRef: HTMLInputElement | null = $state(null);
	let listRef: HTMLDivElement | null = $state(null);
	let wrapperRef: HTMLDivElement | null = $state(null);

	// Filter options based on search query
	const filteredOptions = $derived(
		searchQuery.trim()
			? options.filter((opt) =>
					opt.label.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: options
	);

	// Get selected option for display
	const selectedOption = $derived(options.find((opt) => opt.value === value));

	function handleSelect(optionValue: string) {
		value = optionValue;
		onValueChange?.(optionValue);
		open = false;
		searchQuery = '';
		highlightedIndex = -1;
	}

	function handleTriggerClick() {
		if (!disabled) {
			open = !open;
			if (open) {
				setTimeout(() => inputRef?.focus(), 10);
			}
		}
	}

	function handleInputKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				highlightedIndex = Math.min(highlightedIndex + 1, filteredOptions.length - 1);
				scrollToHighlighted();
				break;
			case 'ArrowUp':
				event.preventDefault();
				highlightedIndex = Math.max(highlightedIndex - 1, 0);
				scrollToHighlighted();
				break;
			case 'Enter':
				event.preventDefault();
				if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
					const option = filteredOptions[highlightedIndex];
					if (!option.disabled) {
						handleSelect(option.value);
					}
				}
				break;
			case 'Escape':
				event.preventDefault();
				open = false;
				searchQuery = '';
				highlightedIndex = -1;
				break;
		}
	}

	function scrollToHighlighted() {
		if (listRef && highlightedIndex >= 0) {
			const items = listRef.querySelectorAll('[data-combobox-item]');
			const item = items[highlightedIndex] as HTMLElement;
			if (item) {
				item.scrollIntoView({ block: 'nearest' });
			}
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (wrapperRef && !wrapperRef.contains(event.target as Node)) {
			open = false;
			searchQuery = '';
			highlightedIndex = -1;
		}
	}

	function handleClear(event: MouseEvent) {
		event.stopPropagation();
		value = '';
		onValueChange?.('');
		searchQuery = '';
	}

	// Reset highlighted index when search changes
	$effect(() => {
		if (searchQuery) {
			highlightedIndex = filteredOptions.length > 0 ? 0 : -1;
		}
	});
</script>

<svelte:window onclick={open ? handleBackdropClick : undefined} />

<div bind:this={wrapperRef} class={cn('flex flex-col gap-1.5 relative', wrapperClass)}>
	{#if label}
		<label for={comboboxId} class="text-sm font-medium text-foreground">
			{label}
			{#if required}
				<span class="text-error ml-0.5">*</span>
			{/if}
		</label>
	{/if}

	<!-- Trigger Button -->
	<button
		type="button"
		id={comboboxId}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-controls={listboxId}
		aria-invalid={!!error}
		aria-describedby={error ? errorId : undefined}
		{disabled}
		onclick={handleTriggerClick}
		class={cn(
			'flex h-12 w-full items-center justify-between gap-2',
			'rounded-xl border border-border bg-surface',
			'px-4 py-3 text-sm text-left',
			'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'transition-all duration-200',
			error && 'border-error focus:border-error focus:ring-error/20',
			className
		)}
	>
		<span class={cn('truncate flex items-center gap-2 flex-1', !selectedOption && 'text-muted')}>
			{#if selectedOption}
				{#if selectedOption.icon}
					<span class="text-base shrink-0">{selectedOption.icon}</span>
				{/if}
				<span class="truncate">{selectedOption.label}</span>
			{:else}
				{placeholder}
			{/if}
		</span>
		<div class="flex items-center gap-1 shrink-0">
			{#if selectedOption && !disabled}
				<button
					type="button"
					onclick={handleClear}
					class="p-1 rounded-full hover:bg-border/50 text-muted hover:text-foreground transition-colors"
					aria-label="Clear selection"
				>
					<X class="h-4 w-4" />
				</button>
			{/if}
			<ChevronDown class={cn('h-4 w-4 text-muted transition-transform', open && 'rotate-180')} />
		</div>
	</button>

	<!-- Dropdown -->
	{#if open}
		<div
			class={cn(
				'absolute top-full left-0 right-0 z-[100] mt-1',
				'rounded-xl border border-border bg-white shadow-xl',
				'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
				'overflow-hidden'
			)}
		>
			<!-- Search Input -->
			<div class="flex items-center gap-2 px-3 py-3 border-b border-border bg-surface/50">
				<Search class="h-4 w-4 text-muted shrink-0" />
				<input
					bind:this={inputRef}
					type="text"
					placeholder={searchPlaceholder}
					bind:value={searchQuery}
					onkeydown={handleInputKeydown}
					class={cn(
						'flex-1 bg-transparent text-sm text-foreground',
						'placeholder:text-muted',
						'focus:outline-none'
					)}
					aria-controls={listboxId}
					aria-autocomplete="list"
				/>
			</div>

			<!-- Options List -->
			<div
				bind:this={listRef}
				id={listboxId}
				role="listbox"
				aria-label={label}
				class="max-h-[200px] overflow-y-auto py-1"
			>
				{#if filteredOptions.length === 0}
					<div class="py-8 text-center text-sm text-muted">
						{emptyMessage}
					</div>
				{:else}
					{#each filteredOptions as option, index (option.value)}
						<button
							type="button"
							data-combobox-item
							role="option"
							aria-selected={value === option.value}
							aria-disabled={option.disabled}
							disabled={option.disabled}
							onclick={() => handleSelect(option.value)}
							onmouseenter={() => (highlightedIndex = index)}
							class={cn(
								'flex w-full items-center gap-3',
								'px-4 py-3 text-sm text-left',
								'disabled:opacity-50 disabled:cursor-not-allowed',
								'transition-colors cursor-pointer',
								index === highlightedIndex && 'bg-primary/5',
								value === option.value && 'bg-primary/10 font-medium text-primary'
							)}
						>
							{#if option.icon}
								<span class="text-lg shrink-0 w-6 text-center">{option.icon}</span>
							{/if}
							<span class="flex-1 truncate">{option.label}</span>
							{#if value === option.value}
								<Check class="h-4 w-4 text-primary shrink-0" />
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}

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
