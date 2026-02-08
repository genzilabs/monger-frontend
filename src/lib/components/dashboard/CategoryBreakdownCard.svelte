<script lang="ts">
    import { CategoryPieChart } from "$lib/components/dashboard";
    import { PrivacyToggle } from "$lib/components/ui";
    import type { CategoryBreakdown } from "$lib/api/transactions";

    interface Props {
        incomeBreakdown: CategoryBreakdown[];
        expenseBreakdown: CategoryBreakdown[];
        currency?: string;
        loading?: boolean;
    }

    let {
        incomeBreakdown,
        expenseBreakdown,
        currency = "IDR",
        loading = false,
    }: Props = $props();

    type ChartTab = "income" | "expense";
    let activeTab = $state<ChartTab>("expense");

    const currentBreakdown = $derived(
        activeTab === "income" ? incomeBreakdown : expenseBreakdown,
    );
</script>

<div class="w-full bg-surface rounded-2xl border border-border p-4">
    <div class="flex flex-wrap items-center justify-between mb-6 gap-2">
        <div class="flex items-center gap-2 min-w-0">
            <h3 class="text-sm font-semibold text-foreground truncate">
                Analisis Pengeluaran
            </h3>
            <PrivacyToggle />
        </div>

        <!-- Tabs - More compact for very small screens -->
        <div class="flex p-0.5 sm:p-1 bg-surface-elevated rounded-lg">
            <button
                onclick={() => (activeTab = "income")}
                class="px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all whitespace-nowrap {activeTab ===
                'income'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-foreground'}"
            >
                Masuk
            </button>
            <button
                onclick={() => (activeTab = "expense")}
                class="px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all whitespace-nowrap {activeTab ===
                'expense'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-foreground'}"
            >
                Keluar
            </button>
        </div>
    </div>

    {#if loading}
        <div class="h-48 flex items-center justify-center">
            <div
                class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
            ></div>
        </div>
    {:else if currentBreakdown.length === 0}
        <div
            class="h-48 flex flex-col items-center justify-center text-muted text-sm gap-2"
        >
            <div
                class="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 opacity-50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    ><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path
                        d="M22 12A10 10 0 0 0 12 2v10z"
                    ></path></svg
                >
            </div>
            <span
                >Belum ada data {activeTab === "income"
                    ? "pemasukan"
                    : "pengeluaran"} bulan ini</span
            >
        </div>
    {:else}
        <CategoryPieChart
            data={currentBreakdown}
            type={activeTab}
            {currency}
            {loading}
        />
    {/if}
</div>
