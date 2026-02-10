<script lang="ts">
    import { CategoryPieChart } from "$lib/components/dashboard";
    import { PrivacyToggle, Select } from "$lib/components/ui";
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

    type ChartTab = "all" | "expense" | "income";
    let activeTab = $state<ChartTab>("all");

    // For "all", combine both breakdowns into one array
    const currentBreakdown = $derived(
        activeTab === "all"
            ? [...expenseBreakdown, ...incomeBreakdown]
            : activeTab === "income"
              ? incomeBreakdown
              : expenseBreakdown,
    );

    // Map tab to chart type
    const currentType = $derived<"income" | "expense" | "all">(
        activeTab === "all" ? "all" : activeTab,
    );

    const selectItems = [
        { value: "all", label: "Semua" },
        { value: "expense", label: "Pengeluaran" },
        { value: "income", label: "Pemasukan" },
    ];

    const emptyLabel = $derived(
        activeTab === "all"
            ? "transaksi"
            : activeTab === "income"
              ? "pemasukan"
              : "pengeluaran",
    );
</script>

<div class="w-full bg-surface rounded-2xl border border-border p-4">
    <div class="flex flex-wrap items-center justify-between mb-6 gap-2">
        <div class="flex items-center gap-2 min-w-0">
            <h3 class="text-sm font-semibold text-foreground truncate">
                Statistik
            </h3>
            <PrivacyToggle />
        </div>

        <!-- Dropdown Select -->
        <div class="w-36">
            <Select
                items={selectItems}
                bind:value={activeTab}
                triggerClass="!py-1.5 !px-2.5 !text-xs !rounded-lg"
            />
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
            <span>Belum ada data {emptyLabel} bulan ini</span>
        </div>
    {:else}
        <CategoryPieChart
            data={currentBreakdown}
            type={currentType}
            {currency}
            {loading}
        />
    {/if}
</div>
