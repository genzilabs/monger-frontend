<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn, generateId } from "$lib/utils";
	import { inputVariants, type InputSize } from "./input.variants";
	import { EyeIcon, EyeOffIcon } from "$lib/icons";

	interface Props extends Omit<HTMLInputAttributes, "size"> {
		/** Input size variant */
		size?: InputSize;
		/** Field label */
		label?: string;
		/** Error message */
		error?: string;
		/** Helper text shown below input */
		hint?: string;
		/** Two-way binding for value */
		value?: string;
		/** Additional CSS classes for the input */
		class?: string;
		/** Additional CSS classes for the wrapper */
		wrapperClass?: string;
		/** Icon slot (left side) */
		icon?: Snippet;
	}

	let {
		type = "text",
		size = "default",
		name,
		label,
		error,
		hint,
		disabled = false,
		required = false,
		value = $bindable(""),
		class: className,
		wrapperClass,
		icon,
		...restProps
	}: Props = $props();

	const inputId = name ?? generateId("input");
	const errorId = `${inputId}-error`;
	const hintId = `${inputId}-hint`;

	// Password visibility toggle
	let showPassword = $state(false);
	const isPasswordType = type === "password";
	const effectiveType = $derived(
		isPasswordType && showPassword ? "text" : type,
	);

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<div class={cn("flex flex-col gap-1.5", wrapperClass)}>
	{#if label}
		<label for={inputId} class="text-sm font-medium text-foreground">
			{label}
			{#if required}
				<span class="text-error ml-0.5">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative">
		{#if icon}
			<div
				class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
			>
				{@render icon()}
			</div>
		{/if}

		<input
			id={inputId}
			type={effectiveType}
			{name}
			{value}
			{disabled}
			{required}
			oninput={handleInput}
			aria-invalid={!!error}
			aria-describedby={error ? errorId : hint ? hintId : undefined}
			class={cn(
				inputVariants({ size, hasError: !!error, hasIcon: !!icon }),
				isPasswordType ? "pr-12" : "",
				className,
			)}
			{...restProps}
		/>

		{#if isPasswordType}
			<button
				type="button"
				onclick={togglePasswordVisibility}
				class="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
				aria-label={showPassword
					? "Sembunyikan kata sandi"
					: "Tampilkan kata sandi"}
			>
				{#if showPassword}
					<EyeOffIcon size={20} />
				{:else}
					<EyeIcon size={20} />
				{/if}
			</button>
		{/if}
	</div>

	{#if error}
		<p id={errorId} class="text-xs text-error animate-fade-in" role="alert">
			{error}
		</p>
	{:else if hint}
		<p id={hintId} class="text-xs text-muted">
			{hint}
		</p>
	{/if}
</div>
