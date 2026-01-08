<script lang="ts">
	interface Props {
		currentStep: number;
		totalSteps: number;
		label?: string;
	}

	let {
		currentStep,
		totalSteps,
		label
	}: Props = $props();

	const progressPercent = $derived((currentStep / totalSteps) * 100);
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium text-primary">
			Step {currentStep} of {totalSteps}
		</span>
		{#if label}
			<span class="text-sm text-muted uppercase tracking-wide">
				{label}
			</span>
		{/if}
	</div>
	
	<div class="h-1 bg-surface rounded-full overflow-hidden">
		<div
			class="h-full bg-primary rounded-full transition-all duration-500 ease-out"
			style="width: {progressPercent}%"
		></div>
	</div>
</div>
