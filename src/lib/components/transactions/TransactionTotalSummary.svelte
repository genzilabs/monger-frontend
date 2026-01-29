<script lang="ts">
    import { Card, EmptyState } from "$lib/components/ui";
    import { privacyStore, booksStore } from "$lib/stores";
    import type { Transaction } from "$lib/types/transaction";

    interface Props {
        transactions: Transaction[];
        lastMonthExpense?: number;
        currency?: string;
        loading?: boolean;
    }

    let {
        transactions,
        lastMonthExpense = 0,
        currency = "IDR",
        loading = false,
    }: Props = $props();

    // Calculate totals
    const totals = $derived.by(() => {
        let income = 0;
        let expense = 0;
        let transfer = 0;

        for (const tx of transactions) {
            if (tx.type === "income") {
                income += tx.amount_cents;
            } else if (tx.type === "expense") {
                expense += tx.amount_cents;
            } else if (tx.type === "transfer") {
                transfer += tx.amount_cents;
            }
        }

        return { income, expense, transfer };
    });

    // Calculate expense comparison
    const expenseComparison = $derived.by(() => {
        if (lastMonthExpense === 0) return null;
        const diff = totals.expense - lastMonthExpense;
        const percentage = Math.round((diff / lastMonthExpense) * 100);
        return {
            diff,
            percentage,
            isUp: diff > 0,
        };
    });

    const pocketCount = $derived(booksStore.pockets.length);

    function formatAmount(cents: number): string {
        if (privacyStore.hideAmounts) return "••••";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(cents / 100);
    }

    const hasData = $derived(transactions.length > 0);
</script>

<div class="space-y-4">
    {#if loading && !hasData}
        <!-- Skeleton -->
        <div class="grid grid-cols-2 gap-3">
            {#each Array(4) as _}
                <div
                    class="bg-surface rounded-2xl border border-border p-4 animate-pulse"
                >
                    <div class="h-3 w-16 bg-border rounded mb-2"></div>
                    <div class="h-6 w-24 bg-border rounded"></div>
                </div>
            {/each}
        </div>
    {:else if !hasData}
        <EmptyState
            title="Belum Ada Data"
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            {/snippet}
        </EmptyState>
    {:else}
        <div class="grid grid-cols-2 gap-3">
            <!-- Total Pockets -->
            <div class="bg-surface rounded-2xl border border-border p-4">
                <div class="flex items-center gap-2 mb-2">
                    <div
                        class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center"
                    >
                        <svg
                            class="w-3.5 h-3.5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                            />
                        </svg>
                    </div>
                    <p class="text-xs text-muted">Total Kantong</p>
                </div>
                <p class="text-xl font-bold text-foreground">{pocketCount}</p>
            </div>

            <!-- Expense Comparison -->
            <div class="bg-surface rounded-2xl border border-border p-4">
                <div class="flex items-center gap-2 mb-2">
                    <div
                        class="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center"
                    >
                        <svg
                            class="w-3.5 h-3.5 text-secondary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                            />
                        </svg>
                    </div>
                    <p class="text-xs text-muted">vs Bulan Lalu</p>
                </div>
                {#if expenseComparison}
                    <p
                        class="text-xl font-bold {expenseComparison.isUp
                            ? 'text-red-500'
                            : 'text-emerald-500'}"
                    >
                        {expenseComparison.isUp
                            ? "+"
                            : ""}{expenseComparison.percentage}%
                    </p>
                {:else}
                    <p class="text-sm text-muted">-</p>
                {/if}
            </div>

            <!-- Total Expense -->
            <div class="bg-surface rounded-2xl border border-border p-4">
                <div class="flex items-center gap-2 mb-2">
                    <div
                        class="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center"
                    >
                        <svg
                            class="w-3.5 h-3.5 text-red-500"
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
                    <p class="text-xs text-muted">Total Pengeluaran</p>
                </div>
                <p class="text-lg font-bold text-foreground">
                    {formatAmount(totals.expense)}
                </p>
            </div>

            <!-- Total Income -->
            <div class="bg-surface rounded-2xl border border-border p-4">
                <div class="flex items-center gap-2 mb-2">
                    <div
                        class="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center"
                    >
                        <svg
                            class="w-3.5 h-3.5 text-emerald-500"
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
                    <p class="text-xs text-muted">Total Pemasukan</p>
                </div>
                <p class="text-lg font-bold text-foreground">
                    {formatAmount(totals.income)}
                </p>
            </div>

            <!-- Total Transfer (full width) -->
            <div
                class="col-span-2 bg-surface rounded-2xl border border-border p-4"
            >
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center"
                        >
                            <svg
                                class="w-3.5 h-3.5 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                />
                            </svg>
                        </div>
                        <p class="text-sm text-muted">Total Transfer</p>
                    </div>
                    <p class="text-lg font-bold text-foreground">
                        {formatAmount(totals.transfer)}
                    </p>
                </div>
            </div>
        </div>
    {/if}
</div>
