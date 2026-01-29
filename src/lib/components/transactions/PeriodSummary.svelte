<script lang="ts">
    import { privacyStore, transactionSettingsStore } from "$lib/stores";
    import { ChevronLeftIcon, ChevronRightIcon } from "$lib/icons";
    import type { Transaction } from "$lib/types/transaction";
    import { calculateSignificance } from "$lib/utils/significance";

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

        // Period label (e.g., "Feb 2026") - based on the month the period primarily falls in
        const targetMonth = new Date(startDate);
        targetMonth.setMonth(targetMonth.getMonth() + 1);
        const label = targetMonth.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
        });

        // Date range label (e.g., "25 Jan – 24 Feb")
        const rangeLabel = `${startDate.getDate()} ${startDate.toLocaleDateString("id-ID", { month: "short" })} – ${endDate.getDate()} ${endDate.toLocaleDateString("id-ID", { month: "short" })}`;

        return {
            start: startDate,
            end: endDate,
            label,
            rangeLabel,
        };
    });

    // Calculate previous period dates for comparison
    const previousPeriodDates = $derived.by(() => {
        const now = new Date();

        // Previous period is one month before the current view
        const referenceDate = new Date(
            now.getFullYear(),
            now.getMonth() + periodOffset - 1,
            15,
        );

        const startDate =
            transactionSettingsStore.getPeriodStart(referenceDate);
        const endDate = transactionSettingsStore.getPeriodEnd(referenceDate);

        return { start: startDate, end: endDate };
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

    // Calculate totals for the previous period (for significance comparison)
    const previousPeriodTotals = $derived.by(() => {
        let income = 0;
        let expense = 0;

        for (const tx of transactions) {
            const txDate = new Date(tx.date);
            if (
                txDate >= previousPeriodDates.start &&
                txDate <= previousPeriodDates.end
            ) {
                if (tx.type === "income") {
                    income += tx.amount_cents;
                } else if (tx.type === "expense") {
                    expense += tx.amount_cents;
                }
            }
        }

        return { income, expense };
    });

    // Calculate significance compared to previous period
    const significance = $derived.by(() => {
        return {
            expense: calculateSignificance(
                periodTotals.expense,
                previousPeriodTotals.expense,
            ),
            income: calculateSignificance(
                periodTotals.income,
                previousPeriodTotals.income,
            ),
        };
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

<!-- Period Summary - No background, spacing-based separation -->
<div class="py-4">
    {#if loading && transactions.length === 0}
        <!-- Skeleton -->
        <div class="space-y-3 animate-pulse">
            <div class="h-3 w-28 bg-border rounded mx-auto"></div>
            <div class="flex items-center justify-center gap-4">
                <div class="w-8 h-8 bg-border rounded-lg"></div>
                <div class="h-5 w-24 bg-border rounded"></div>
                <div class="w-8 h-8 bg-border rounded-lg"></div>
            </div>
            <div class="flex justify-between pt-2">
                <div class="space-y-1">
                    <div class="h-3 w-12 bg-border rounded"></div>
                    <div class="h-5 w-24 bg-border rounded"></div>
                </div>
                <div class="space-y-1 text-right">
                    <div class="h-3 w-12 bg-border rounded ml-auto"></div>
                    <div class="h-5 w-24 bg-border rounded"></div>
                </div>
            </div>
        </div>
    {:else}
        <div class="space-y-3">
            <!-- Row 1: Period Range Context -->
            <p class="text-xs text-muted text-center">
                {periodDates.rangeLabel}
            </p>

            <!-- Row 2: Navigation -->
            <div class="flex items-center justify-center gap-2">
                <button
                    onclick={navigatePrevious}
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors text-muted hover:text-foreground"
                    aria-label="Periode sebelumnya"
                >
                    <ChevronLeftIcon size={18} />
                </button>

                <span
                    class="text-sm font-semibold text-foreground min-w-[120px] text-center"
                >
                    {periodDates.label}
                </span>

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

            <!-- Row 3: Summary Values (two columns) -->
            <div class="flex justify-between items-start pt-1">
                <!-- Income (Masuk) -->
                <div class="space-y-0.5">
                    <p class="text-xs text-muted">Masuk</p>
                    <div class="flex items-center gap-1.5">
                        {#if significance.income.isSignificant && significance.income.direction === "down"}
                            <svg
                                class="w-3 h-3 text-emerald-400/70 opacity-80"
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
                        {/if}
                        <span
                            class="text-sm font-medium text-foreground tabular-nums"
                        >
                            {formatAmount(periodTotals.income)}
                        </span>
                    </div>
                </div>

                <!-- Expense (Keluar) -->
                <div class="space-y-0.5 text-right">
                    <p class="text-xs text-muted">Keluar</p>
                    <div class="flex items-center justify-end gap-1.5">
                        {#if significance.expense.isSignificant && significance.expense.direction === "up"}
                            <svg
                                class="w-3 h-3 text-red-400/70 opacity-80"
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
                        {/if}
                        <span
                            class="text-sm font-medium text-foreground tabular-nums"
                        >
                            {formatAmount(periodTotals.expense)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
