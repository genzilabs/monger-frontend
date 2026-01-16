<script lang="ts">
	import type { Pocket } from "$lib/types";
	import DynamicIcon from "$lib/components/ui/DynamicIcon.svelte";

	interface Props {
		pocket: Pocket;
		currency?: string;
		isHighlighted?: boolean;
		onclick?: () => void;
	}

	let {
		pocket,
		currency = "IDR",
		isHighlighted = false,
		onclick,
	}: Props = $props();

	function formatBalance(cents: number) {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency,
			minimumFractionDigits: 0,
		}).format(cents / 100);
	}
</script>

<button
	{onclick}
	class="min-w-[160px] h-32 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden text-left {isHighlighted
		? 'bg-gradient-to-br from-primary to-blue-700 shadow-lg shadow-[var(--color-primary)]/20'
		: 'bg-surface border border-border'}"
>
	<!-- Background Icon -->
	<div
		class="absolute right-[-24px] top-[-24px] opacity-10 text-foreground transition-transform group-hover:scale-110"
	>
		<DynamicIcon name={pocket.icon_slug} size={120} />
	</div>

	<!-- Content -->
	<div class="z-10 relative">
		<div
			class="mb-3 w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center {isHighlighted
				? 'text-white'
				: 'text-primary'}"
		>
			<DynamicIcon name={pocket.icon_slug} size={20} />
		</div>
		<p
			class="text-xs {isHighlighted
				? 'text-white/80'
				: 'text-muted'} font-medium truncate mb-1"
		>
			{pocket.name}
		</p>
	</div>

	<p
		class="text-lg font-bold {isHighlighted
			? 'text-white'
			: 'text-foreground'} z-10 relative truncate"
	>
		{formatBalance(pocket.balance_cents)}
	</p>
</button>
