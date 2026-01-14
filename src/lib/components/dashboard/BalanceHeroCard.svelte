<script lang="ts">
	import { ArrowUpIcon, ArrowDownIcon } from "$lib/icons";

	interface Props {
		balance: number;
		income?: number;
		expense?: number;
		currency?: string;
		bookName: string;
	}

	let {
		balance,
		income = 0,
		expense = 0,
		currency = "IDR",
		bookName,
	}: Props = $props();

	function formatMoney(cents: number) {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(cents / 100);
	}
</script>

<div
	class="w-full bg-surface rounded-2xl border border-border p-5 relative overflow-hidden"
>
	<!-- Abstract background decoration -->
	<div
		class="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
	></div>

	<div class="relative z-10 flex flex-col gap-4">
		<div>
			<p
				class="text-sm font-medium text-muted flex items-center gap-2 mb-1"
			>
				Total Net Worth
			</p>
			<h1 class="text-3xl font-bold tracking-tight text-foreground">
				{formatMoney(balance)}
			</h1>
		</div>

		<!-- Income / Expense Grid -->
		<div class="grid grid-cols-2 gap-3 md:hidden">
			<!-- Income -->
			<div class="bg-emerald-500/10 rounded-xl p-3 flex flex-col gap-1">
				<div class="flex items-center gap-1.5">
					<div class="p-1 rounded-full bg-emerald-500/20">
						<ArrowUpIcon class="w-3 h-3 text-emerald-600" />
					</div>
					<span class="text-xs font-medium text-emerald-600"
						>Pemasukan</span
					>
				</div>
				<span class="text-lg font-bold text-foreground"
					>{formatMoney(income)}</span
				>
			</div>

			<!-- Expense -->
			<div class="bg-red-500/10 rounded-xl p-3 flex flex-col gap-1">
				<div class="flex items-center gap-1.5">
					<div class="p-1 rounded-full bg-red-500/20">
						<ArrowDownIcon class="w-3 h-3 text-red-600" />
					</div>
					<span class="text-xs font-medium text-red-600"
						>Pengeluaran</span
					>
				</div>
				<span class="text-lg font-bold text-foreground"
					>{formatMoney(expense)}</span
				>
			</div>
		</div>
	</div>
</div>
