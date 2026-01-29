<script lang="ts">
    import { privacyStore, transactionSettingsStore } from "$lib/stores";
    import { ChevronLeftIcon, ChevronRightIcon } from "$lib/icons";
    import type { Transaction } from "$lib/types/transaction";

    interface Props {
        transactions: Transaction[];
        currency?: string;
        loading?: boolean;
    }

    let { transactions, currency = "IDR", loading = false }: Props = $props();

    // Current period state (month offset from current)
    let periodOffset = $state(0);

    // Calculate period dates based on offset using store methods
    const periodDates = $derived.by(() => {
        const now = new Date();

        // Calculate the reference date for the target period
        const referenceDate = new Date(
            now.getFullYear(),
            now.getMonth() + periodOffset,
            15, // Middle of month to ensure correct period calculation
        );

        // Use store methods which include weekend handling
        const startDate =
            transactionSettingsStore.getPeriodStart(referenceDate);
        const endDate = transactionSettingsStore.getPeriodEnd(referenceDate);

        // Period label (e.g., "FEB 2026") - based on the month the period primarily falls in
        const targetMonth = new Date(startDate);
        targetMonth.setMonth(targetMonth.getMonth() + 1);
        const label = targetMonth
            .toLocaleDateString("id-ID", {
                month: "short",
                year: "numeric",
            })
            .toUpperCase();

        // Date range label (e.g., "25 Jan - 24 Feb")
        const rangeLabel = `${startDate.getDate()} ${startDate.toLocaleDateString("id-ID", { month: "short" })} - ${endDate.getDate()} ${endDate.toLocaleDateString("id-ID", { month: "short" })}`;

        return {
            start: startDate,
            end: endDate,
            label,
            rangeLabel,
        };
    });

    // Check if forward navigation should be disabled (period end is in future)
    const isForwardDisabled = $derived.by(() => {
        const now = new Date();
        return periodDates.end > now;
    });

    // Calculate totals for the current period
    const periodTotals = $derived.by(() => {
        let income = 0;
        let expense = 0;

        for (const tx of transactions) {
            const txDate = new Date(tx.date);
            if (txDate >= periodDates.start && txDate <= periodDates.end) {
                if (tx.type === "income") {
                    income += tx.amount_cents;
                } else if (tx.type === "expense") {
                    expense += tx.amount_cents;
                }
            }
        }

        return { income, expense };
    });

    function navigatePrevious() {
        periodOffset -= 1;
    }

    function navigateNext() {
        if (!isForwardDisabled) {
            periodOffset += 1;
        }
    }

    function formatAmount(cents: number): string {
        if (privacyStore.hideAmounts) return "••••";
        return new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(cents / 100);
    }
</script>

<div class="bg-surface rounded-2xl border border-border p-4">
    {#if loading && transactions.length === 0}
        <!-- Skeleton -->
        <div class="flex items-center justify-between animate-pulse">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-border rounded-lg"></div>
                <div class="space-y-1.5">
                    <div class="h-4 w-16 bg-border rounded"></div>
                    <div class="h-3 w-24 bg-border rounded"></div>
                </div>
                <div class="w-8 h-8 bg-border rounded-lg"></div>
            </div>
            <div class="space-y-2">
                <div class="h-4 w-20 bg-border rounded"></div>
                <div class="h-4 w-20 bg-border rounded"></div>
            </div>
        </div>
    {:else}
        <div class="flex items-center justify-between gap-4">
            <!-- Left Column: Month Navigation -->
            <div class="flex items-center gap-1">
                <button
                    onclick={navigatePrevious}
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors text-muted hover:text-foreground"
                    aria-label="Periode sebelumnya"
                >
                    <ChevronLeftIcon size={18} />
                </button>

                <div class="text-center min-w-[90px]">
                    <p class="text-sm font-bold text-foreground">
                        {periodDates.label}
                    </p>
                    <p class="text-xs text-muted">{periodDates.rangeLabel}</p>
                </div>

                <button
                    onclick={navigateNext}
                    disabled={isForwardDisabled}
                    class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors {isForwardDisabled
                        ? 'text-muted/30 cursor-not-allowed'
                        : 'hover:bg-surface-elevated text-muted hover:text-foreground'}"
                    aria-label="Periode berikutnya"
                >
                    <ChevronRightIcon size={18} />
                </button>
            </div>

            <!-- Right Column: Totals -->
            <div class="flex flex-col items-end gap-1">
                <!-- Expense -->
                <div class="flex items-center gap-1.5">
                    <svg
                        class="w-3 h-3 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                    <span
                        class="text-sm font-semibold text-foreground tabular-nums"
                    >
                        {formatAmount(periodTotals.expense)}
                    </span>
                </div>

                <!-- Income -->
                <div class="flex items-center gap-1.5">
                    <svg
                        class="w-3 h-3 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                    </svg>
                    <span
                        class="text-sm font-semibold text-foreground tabular-nums"
                    >
                        {formatAmount(periodTotals.income)}
                    </span>
                </div>
            </div>
        </div>
    {/if}
</div>
