<script lang="ts">
    import { EmptyState, Card } from "$lib/components/ui";
    import { privacyStore, transactionSettingsStore } from "$lib/stores";
    import type { Transaction } from "$lib/types/transaction";

    interface Props {
        transactions: Transaction[];
        currency?: string;
        loading?: boolean;
    }

    let { transactions, currency = "IDR", loading = false }: Props = $props();

    interface PeriodSummary {
        label: string;
        startDate: Date;
        endDate: Date;
        income: number;
        expense: number;
    }

    // Group transactions into 7-day periods
    const periodSummaries = $derived.by(() => {
        if (transactions.length === 0) return [];

        const periods: Map<string, PeriodSummary> = new Map();
        const resetDay = transactionSettingsStore.monthlyResetDay;

        // Sort transactions by date
        const sorted = [...transactions].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        // Find the earliest transaction date to determine period range
        // Parse as local dates to avoid timezone issues
        // Transaction dates are in ISO-8601 format: "2026-01-21T18:01:00+07:00"
        const parseLocalDate = (dateStr: string) => {
            const datePart = dateStr.split('T')[0]; // Extract "2026-01-21"
            const [year, month, day] = datePart.split('-').map(Number);
            return new Date(year, month - 1, day);
        };
        
        const earliestDate = parseLocalDate(sorted[sorted.length - 1].date);
        const latestDate = parseLocalDate(sorted[0].date);


        // Get the period start for the earliest transaction
        let periodStart = new Date(earliestDate);
        periodStart.setDate(resetDay);
        if (earliestDate.getDate() < resetDay) {
            periodStart.setMonth(periodStart.getMonth() - 1);
        }
        periodStart.setHours(0, 0, 0, 0);


        // Create all periods from earliest to latest
        while (periodStart <= latestDate) {
            const periodEnd = new Date(periodStart);
            periodEnd.setDate(periodEnd.getDate() + 6);

            const label = formatPeriodLabel(periodStart, periodEnd);
            periods.set(label, {
                label,
                startDate: new Date(periodStart),
                endDate: periodEnd,
                income: 0,
                expense: 0,
            });

            periodStart.setDate(periodStart.getDate() + 7);
        }

        // Assign transactions to periods

        for (const tx of sorted) {
            // Parse date as local date to avoid timezone issues
            // Transaction dates are in ISO-8601 format: "2026-01-21T18:01:00+07:00"
            // Extract just the date part: "2026-01-21"
            const datePart = tx.date.split('T')[0];
            const [year, month, day] = datePart.split('-').map(Number);
            const txDate = new Date(year, month - 1, day);


            let matched = false;
            for (const [label, period] of periods) {

                if (txDate >= period.startDate && txDate <= period.endDate) {

                    if (tx.type === "income") {
                        period.income += tx.amount_cents;
                    } else if (tx.type === "expense") {
                        period.expense += tx.amount_cents;
                    }
                    matched = true;
                    break;
                }
            }

        }



        // Return as array sorted by date desc, filter out empty periods
        return Array.from(periods.values())
            .filter((p) => p.income > 0 || p.expense > 0)
            .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    });

    function formatPeriodLabel(start: Date, end: Date): string {
        const startStr = start.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
        });
        const endStr = end.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
        });
        return `${startStr} - ${endStr}`;
    }

    function formatAmount(cents: number): string {
        if (privacyStore.hideAmounts) return "••••";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(cents / 100);
    }

    const hasPeriods = $derived(periodSummaries.length > 0);
</script>

<div class="space-y-3">
    {#if loading && transactions.length === 0}
        <!-- Skeleton -->
        <div class="space-y-3">
            {#each Array(4) as _}
                <div
                    class="bg-surface rounded-2xl border border-border p-4 animate-pulse"
                >
                    <div class="h-4 w-32 bg-border rounded mb-3"></div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="h-6 bg-border rounded"></div>
                        <div class="h-6 bg-border rounded"></div>
                    </div>
                </div>
            {/each}
        </div>
    {:else if !hasPeriods}
        <EmptyState
            title="Belum Ada Data"
            description="Belum ada transaksi untuk periode ini."
        >
            {#snippet icon()}
                <svg
                    class="w-6 h-6 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            {/snippet}
        </EmptyState>
    {:else}
        {#each periodSummaries as period}
            <div class="bg-surface rounded-2xl border border-border p-4">
                <h4 class="text-sm font-semibold text-foreground mb-3">
                    {period.label}
                </h4>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Expense -->
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"
                        >
                            <svg
                                class="w-4 h-4 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                                />
                            </svg>
                        </div>
                        <div>
                            <p class="text-xs text-muted">Pengeluaran</p>
                            <p class="text-sm font-semibold text-foreground">
                                {formatAmount(period.expense)}
                            </p>
                        </div>
                    </div>

                    <!-- Income -->
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"
                        >
                            <svg
                                class="w-4 h-4 text-emerald-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                            </svg>
                        </div>
                        <div>
                            <p class="text-xs text-muted">Pemasukan</p>
                            <p class="text-sm font-semibold text-foreground">
                                {formatAmount(period.income)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    {/if}
</div>
