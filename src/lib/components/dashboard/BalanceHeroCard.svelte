<script lang="ts">
	interface Props {
		balance: number;
		currency?: string;
		bookName: string;
	}

	let { balance, currency = 'IDR', bookName }: Props = $props();

	function formatBalance(cents: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0
		}).format(cents / 100);
	}
</script>

<div class="w-full bg-surface rounded-2xl border border-border p-6 relative overflow-hidden">
	<!-- Abstract background decoration -->
	<div class="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
	
	<div class="relative z-10 flex flex-col gap-1">
		<p class="text-sm font-medium text-muted flex items-center gap-2">
			Total Net Worth
			<svg class="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				<path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
			</svg>
		</p>
		<h1 class="text-4xl font-bold tracking-tight text-foreground">
			{formatBalance(balance)}
		</h1>
		<div class="flex items-center gap-2 mt-2">
			<span class="flex items-center text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs font-bold">
				<svg class="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
				</svg>
				+12%
			</span>
			<span class="text-xs text-muted">this month</span>
		</div>
	</div>
	
	<!-- Sparkline Chart -->
	<div class="h-16 w-full mt-4 relative">
		<svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
			<defs>
				<linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.3"></stop>
					<stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0"></stop>
				</linearGradient>
			</defs>
			<path d="M0,40 L0,25 C10,25 15,30 25,20 C35,10 40,35 50,30 C60,25 65,15 75,18 C85,21 90,5 100,10 L100,40 Z" fill="url(#chartGradient)"></path>
			<path d="M0,25 C10,25 15,30 25,20 C35,10 40,35 50,30 C60,25 65,15 75,18 C85,21 90,5 100,10" fill="none" stroke="var(--color-primary)" stroke-linecap="round" stroke-width="2" vector-effect="non-scaling-stroke"></path>
		</svg>
	</div>
</div>
