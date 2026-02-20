<script lang="ts">
    import { TransactionItem } from "$lib/components/dashboard";
    import { EmptyState } from "$lib/components/ui";
    import type { Transaction } from "$lib/types/transaction";
    import { privacyStore } from "$lib/stores";
    import { calculateSignificance } from "$lib/utils/significance";

    interface Props {
        transactions: Transaction[];
        currency?: string;
        loading?: boolean;
        onTransactionClick?: (tx: Transaction) => void;
        loadMore?: () => void;
        hasMore?: boolean;
    }

    let {
        transactions,
        currency = "IDR",
        loading = false,
        onTransactionClick,
        loadMore,
        hasMore = false,
    }: Props = $props();

    interface DateGroup {
        label: string;
        dateKey: string; // ISO date for comparison
        transactions: Transaction[];
        expense: number;
        income: number;
    }


    function getDateKey(dateStr: string): string {
        return new Date(dateStr).toISOString().split("T")[0];
    }

    function getGroupLabel(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return "Hari ini";
        if (isYesterday) return "Kemarin";
        return date.toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    }

    // Group transactions by date with expense and income totals
    const groups = $derived.by(() => {
        const groupsMap: Record<string, DateGroup> = {};
        const sorted = [...transactions].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        for (const tx of sorted) {
            const dateKey = getDateKey(tx.date);
            const label = getGroupLabel(tx.date);
            if (!groupsMap[dateKey]) {
                groupsMap[dateKey] = {
                    label,
                    dateKey,
                    transactions: [],
                    expense: 0,
                    income: 0,
                };
            }
            groupsMap[dateKey].transactions.push(tx);
            if (tx.type === "expense") {
                groupsMap[dateKey].expense += tx.amount_cents;
            } else if (tx.type === "income") {
                groupsMap[dateKey].income += tx.amount_cents;
            }
        }
        // Return sorted by date (newest first)
        return Object.values(groupsMap).sort(
            (a, b) =>
                new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime(),
        );
    });

    // Build a lookup map for previous day's values
    const previousDayValues = $derived.by(() => {
        const map: Record<string, { expense: number; income: number }> = {};
        for (let i = 0; i < groups.length - 1; i++) {
            const current = groups[i];
            const previous = groups[i + 1];
            map[current.dateKey] = {
                expense: previous.expense,
                income: previous.income,
            };
        }
        return map;
    });

    // Calculate significance for a group
    function getSignificance(group: DateGroup) {
        const prev = previousDayValues[group.dateKey];
        if (!prev) {
            return {
                expense: { isSignificant: false, direction: "none" as const },
                income: { isSignificant: false, direction: "none" as const },
            };
        }
        return {
            expense: calculateSignificance(group.expense, prev.expense),
            income: calculateSignificance(group.income, prev.income),
        };
    }

    function formatCompact(cents: number): string {
        if (privacyStore.hideAmounts) return "••••";
        const value = cents / 100;
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "jt";
        }
        if (value >= 1000) {
            return (value / 1000).toFixed(1).replace(/\.0$/, "") + "rb";
        }
        return new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    const hasTransactions = $derived(groups.length > 0);
</script>

<div class="space-y-4">
    {#if loading && transactions.length === 0}
        <!-- Skeleton -->
        <div class="space-y-4">
            {#each Array(3) as _}
                <!-- Date header skeleton -->
                <div
                    class="flex items-center justify-between py-2 animate-pulse"
                >
                    <div class="h-3 w-20 bg-border rounded"></div>
                    <div class="h-3 w-16 bg-border rounded"></div>
                </div>
                <div
                    class="bg-surface rounded-2xl border border-border p-4 space-y-3"
                >
                    {#each Array(2) as _}
                        <div class="flex items-center gap-3 animate-pulse">
                            <div class="w-10 h-10 rounded-full bg-border"></div>
                            <div class="flex-1 space-y-2">
                                <div class="h-4 w-1/3 bg-border rounded"></div>
                                <div class="h-3 w-1/4 bg-border rounded"></div>
                            </div>
                            <div class="h-4 w-16 bg-border rounded"></div>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    {:else if !hasTransactions}
        <EmptyState
            title="Belum Ada Transaksi"
            description="Belum ada transaksi untuk ditampilkan."
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
            {/snippet}
        </EmptyState>
    {:else}
        {#each groups as group}
            {@const sig = getSignificance(group)}
            <div class="space-y-2">
                <!-- Date Header as Divider with Totals -->
                <div
                    class="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur py-2 z-10"
                >
                    <h4
                        class="text-xs font-semibold text-muted uppercase tracking-wider"
                    >
                        {group.label}
                    </h4>

                    <div class="flex items-center gap-2.5 text-xs">
                        <!-- Expense total with conditional arrow -->
                        {#if group.expense > 0}
                            <div class="flex items-center gap-1">
                                {#if sig.expense.isSignificant && sig.expense.direction === "up"}
                                    <svg
                                        class="w-2.5 h-2.5 text-red-400/70 opacity-80"
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
                                    class="text-xs text-muted font-medium tabular-nums"
                                    >{formatCompact(group.expense)}</span
                                >
                            </div>
                        {/if}
                        <!-- Income total with conditional arrow -->
                        {#if group.income > 0}
                            <div class="flex items-center gap-1">
                                {#if sig.income.isSignificant && sig.income.direction === "down"}
                                    <svg
                                        class="w-2.5 h-2.5 text-emerald-400/70 opacity-80"
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
                                    class="text-xs text-muted font-medium tabular-nums"
                                    >{formatCompact(group.income)}</span
                                >
                            </div>
                        {/if}
                    </div>
                </div>

                <div
                    class="bg-surface rounded-2xl border border-border px-4 py-1"
                >
                    {#each group.transactions as tx (tx.id)}
                        <div
                            class="border-b border-border last:border-0 border-dashed"
                        >
                            <TransactionItem
                                transaction={tx}
                                {currency}
                                showDate={false}
                                showTime={true}
                                onclick={onTransactionClick
                                    ? () => onTransactionClick(tx)
                                    : undefined}
                            />
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
        
        <!-- Load More for Daily -->
        {#if hasMore && transactions.length > 0}
            <div class="pt-4 text-center">
                <button
                    onclick={loadMore}
                    disabled={loading}
                    class="px-6 py-2 text-sm font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                    {#if loading}
                        Memuat...
                    {:else}
                        Muat Lebih Banyak
                    {/if}
                </button>
            </div>
        {/if}
    {/if}
</div>
