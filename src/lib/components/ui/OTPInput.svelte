<script lang="ts">
	interface Props {
		length?: number;
		value?: string;
		error?: boolean;
		disabled?: boolean;
		onComplete?: (otp: string) => void;
		onchange?: (otp: string) => void;
	}

	let {
		length = 6,
		value = $bindable(''),
		error = false,
		disabled = false,
		onComplete,
		onchange
	}: Props = $props();

	let inputRefs: HTMLInputElement[] = [];

	function handleInput(index: number, event: Event) {
		const target = event.target as HTMLInputElement;
		const inputValue = target.value.replace(/\D/g, '').slice(-1);
		
		const valueArray = value.split('');
		valueArray[index] = inputValue;
		value = valueArray.join('').slice(0, length);
		
		onchange?.(value);

		if (inputValue && index < length - 1) {
			inputRefs[index + 1]?.focus();
		}

		if (value.length === length) {
			onComplete?.(value);
		}
	}

	function handleKeyDown(index: number, event: KeyboardEvent) {
		const target = event.target as HTMLInputElement;

		if (event.key === 'Backspace') {
			if (!target.value && index > 0) {
				inputRefs[index - 1]?.focus();
			}
			const valueArray = value.split('');
			valueArray[index] = '';
			value = valueArray.join('');
			onchange?.(value);
		}

		if (event.key === 'ArrowLeft' && index > 0) {
			event.preventDefault();
			inputRefs[index - 1]?.focus();
		}

		if (event.key === 'ArrowRight' && index < length - 1) {
			event.preventDefault();
			inputRefs[index + 1]?.focus();
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const pastedData = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, length);
		if (pastedData) {
			value = pastedData;
			onchange?.(value);
			
			const focusIndex = Math.min(pastedData.length, length - 1);
			inputRefs[focusIndex]?.focus();

			if (pastedData.length === length) {
				onComplete?.(value);
			}
		}
	}

	function handleFocus(event: FocusEvent) {
		const target = event.target as HTMLInputElement;
		target.select();
	}

	function getValueAtIndex(index: number): string {
		return value[index] || '';
	}
</script>

<div class="flex gap-2 justify-center" role="group" aria-label="OTP input">
	{#each Array(length) as _, index}
		<input
			bind:this={inputRefs[index]}
			type="text"
			inputmode="numeric"
			pattern="[0-9]*"
			maxlength="1"
			value={getValueAtIndex(index)}
			{disabled}
			oninput={(e) => handleInput(index, e)}
			onkeydown={(e) => handleKeyDown(index, e)}
			onpaste={handlePaste}
			onfocus={handleFocus}
			aria-label={`Digit ${index + 1} of ${length}`}
			class="
				w-11 h-14 sm:w-12
				text-center text-xl font-semibold
				bg-surface
				border-2 border-border
				rounded-input
				text-foreground
				transition-all duration-200
				focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
				disabled:opacity-50 disabled:cursor-not-allowed
				{error ? 'border-error focus:border-error focus:ring-error/20 animate-pulse' : ''}
				{getValueAtIndex(index) ? 'border-primary/50' : ''}
			"
		/>
	{/each}
</div>
