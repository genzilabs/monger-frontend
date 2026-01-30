<script lang="ts">
    import { privacyStore } from "$lib/stores";
    import type { Transaction } from "$lib/types/transaction";

    interface Props {
        transactions: Transaction[];
        currency?: string;
        loading?: boolean;
        periodStart: Date;
        periodEnd: Date;
    }

    let { transactions, currency = "IDR", loading = false, periodStart, periodEnd }: Props = $props();

    interface DayData {
        date: Date;
        dayNumber: number;
        isCurrentMonth: boolean;
        income: number;
        expense: number;
        transactions: Transaction[];
    }

    // Generate calendar grid
    const calendarDays = $derived.by(() => {
        const days: DayData[] = [];
        
        // Get the first day of the month - use year and month from periodStart
        const firstDay = new Date(
            periodStart.getFullYear(),
            periodStart.getMonth(),
            1
        );
        
        // Get the last day of the month - use year and month from periodEnd
        const lastDay = new Date(
            periodEnd.getFullYear(),
            periodEnd.getMonth() + 1,
            0 // Day 0 of next month = last day of current month
        );
        
        // Get day of week for first day (0 = Sunday)
        const firstDayOfWeek = firstDay.getDay();
        
        // Add days from previous month to fill the first week
        const prevMonthStart = new Date(firstDay);
        prevMonthStart.setDate(prevMonthStart.getDate() - firstDayOfWeek);
        
        // Generate 42 days (6 weeks) to ensure full calendar grid
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(prevMonthStart);
            currentDate.setDate(currentDate.getDate() + i);
            
            const isCurrentMonth = currentDate >= firstDay && currentDate <= lastDay;
            
            // Calculate totals for this day
            let income = 0;
            let expense = 0;
            const dayTransactions: Transaction[] = [];
            
            if (isCurrentMonth) {
                for (const tx of transactions) {
                    const txDate = new Date(tx.date);
                    if (
                        txDate.getFullYear() === currentDate.getFullYear() &&
                        txDate.getMonth() === currentDate.getMonth() &&
                        txDate.getDate() === currentDate.getDate()
                    ) {
                        dayTransactions.push(tx);
                        if (tx.type === "income") {
                            income += tx.amount_cents;
                        } else if (tx.type === "expense") {
                            expense += tx.amount_cents;
                        }
                    }
                }
            }
            
            days.push({
                date: currentDate,
                dayNumber: currentDate.getDate(),
                isCurrentMonth,
                income,
                expense,
                transactions: dayTransactions,
            });
        }
        
        return days;
    });

    function formatCompact(cents: number): string {
        if (privacyStore.hideAmounts) return "••••";
        const value = cents / 100;
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "jt";
        }
        if (value >= 1000) {
            return (value / 1000).toFixed(0) + "rb";
        }
        return new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
</script>

<div class="space-y-3">
    {#if loading && transactions.length === 0}
        <!-- Skeleton -->
        <div class="animate-pulse space-y-2">
            <div class="grid grid-cols-7 gap-1">
                {#each Array(7) as _}
                    <div class="h-4 bg-border rounded"></div>
                {/each}
            </div>
            <div class="grid grid-cols-7 gap-1">
                {#each Array(35) as _}
                    <div class="h-16 bg-border rounded"></div>
                {/each}
            </div>
        </div>
    {:else}
        <!-- Calendar Header (Day Names) -->
        <div class="grid grid-cols-7 gap-1">
            {#each weekDays as day}
                <div class="text-center text-xs font-semibold text-muted py-2">
                    {day}
                </div>
            {/each}
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-1">
            {#each calendarDays as day}
                <div
                    class="min-h-[70px] rounded-lg border transition-colors {day.isCurrentMonth
                        ? 'bg-surface border-border'
                        : 'bg-background border-transparent'} {day.income > 0 || day.expense > 0
                        ? 'hover:border-primary/30'
                        : ''}"
                >
                    <div class="p-1.5 h-full flex flex-col">
                        <!-- Day Number -->
                        <div
                            class="text-xs font-medium mb-1 {day.isCurrentMonth
                                ? 'text-foreground'
                                : 'text-muted/40'}"
                        >
                            {day.dayNumber}
                        </div>

                        <!-- Transaction Indicators -->
                        {#if day.isCurrentMonth && (day.income > 0 || day.expense > 0)}
                            <div class="flex-1 flex flex-col gap-0.5 text-[10px]">
                                {#if day.income > 0}
                                    <div class="flex items-center gap-0.5">
                                        <div class="w-1 h-1 rounded-full bg-emerald-500"></div>
                                        <span class="text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                                            {formatCompact(day.income)}
                                        </span>
                                    </div>
                                {/if}
                                {#if day.expense > 0}
                                    <div class="flex items-center gap-0.5">
                                        <div class="w-1 h-1 rounded-full bg-red-500"></div>
                                        <span class="text-red-600 dark:text-red-400 font-medium tabular-nums">
                                            {formatCompact(day.expense)}
                                        </span>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
