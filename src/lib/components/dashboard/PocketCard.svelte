<script lang="ts">
	import type { Pocket } from '$lib/types';

	interface Props {
		pocket: Pocket;
		currency?: string;
		isHighlighted?: boolean;
		onclick?: () => void;
	}

	let { pocket, currency = 'IDR', isHighlighted = false, onclick }: Props = $props();

	const pocketIcons: Record<string, string> = {
		'cash': '💵',
		'bank': '🏦',
		'e-wallet': '📱',
		'credit': '💳'
	};

	function formatBalance(cents: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0
		}).format(cents / 100);
	}

	const icon = pocketIcons[pocket.type_slug] || '💰';
</script>

<button
	{onclick}
	class="min-w-[160px] h-32 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden text-left {isHighlighted 
		? 'bg-gradient-to-br from-primary to-blue-700 shadow-lg shadow-[var(--color-primary)]/20' 
		: 'bg-surface border border-border'}"
>
	<!-- Background Icon -->
	<div class="absolute right-[-10px] top-[-10px] opacity-20 text-5xl">
		{icon}
	</div>
	
	<!-- Content -->
	<div class="z-10">
		<span class="text-2xl mb-1">{icon}</span>
		<p class="text-xs {isHighlighted ? 'text-white/80' : 'text-muted'} font-medium truncate">
			{pocket.name}
		</p>
	</div>
	
	<p class="text-lg font-bold {isHighlighted ? 'text-white' : 'text-foreground'} z-10">
		{formatBalance(pocket.balance_cents)}
	</p>
</button>
