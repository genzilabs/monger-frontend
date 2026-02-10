<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Chart, registerables } from "chart.js";
  import type { CategoryBreakdown } from "$lib/api/transactions";
  import { DynamicIcon } from "$lib/components/ui";
  import { privacyStore } from "$lib/stores";

  // Register Chart.js components
  Chart.register(...registerables);

  interface Props {
    data: CategoryBreakdown[];
    type: "income" | "expense" | "all";
    loading?: boolean;
    currency?: string;
  }

  let { data, type, loading = false, currency = "IDR" }: Props = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  // Define palettes
  const incomeColors = [
    "#10B981", // Emerald 500
    "#3B82F6", // Blue 500
    "#8B5CF6", // Violet 500
    "#F59E0B", // Amber 500
    "#14B8A6", // Teal 500
    "#6366F1", // Indigo 500
    "#84CC16", // Lime 500
    "#0EA5E9", // Sky 500
  ];

  const expenseColors = [
    "#F87171", // Red 400 (Soft Salmon)
    "#FB923C", // Orange 400 (Bright Orange)
    "#FACC15", // Yellow 400 (Sunny)
    "#E879F9", // Fuchsia 400
    "#A78BFA", // Violet 400
    "#F472B6", // Pink 400
    "#94A3B8", // Slate 400
    "#FB7185", // Rose 400
  ];

  // Interleaved palette for combined "all" view
  const allColors = [
    "#F87171", // Red 400
    "#10B981", // Emerald 500
    "#FB923C", // Orange 400
    "#3B82F6", // Blue 500
    "#FACC15", // Yellow 400
    "#8B5CF6", // Violet 500
    "#E879F9", // Fuchsia 400
    "#F59E0B", // Amber 500
    "#A78BFA", // Violet 400
    "#14B8A6", // Teal 500
    "#F472B6", // Pink 400
    "#6366F1", // Indigo 500
    "#94A3B8", // Slate 400
    "#84CC16", // Lime 500
    "#FB7185", // Rose 400
    "#0EA5E9", // Sky 500
  ];

  function getColor(index: number, type: "income" | "expense" | "all"): string {
    const palette =
      type === "all"
        ? allColors
        : type === "income"
          ? incomeColors
          : expenseColors;
    return palette[index % palette.length];
  }

  function formatCurrency(cents: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  function createChart() {
    if (!canvas || !data || data.length === 0) return;

    // Destroy existing chart
    if (chart) {
      chart.destroy();
    }

    const labels = data.map((d) => d.category_name);
    const amounts = data.map((d) => d.amount / 100);
    const backgroundColors = data.map((_, i) => getColor(i, type));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: amounts,
            backgroundColor: backgroundColors,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e293b", // Slate 800
            bodyColor: "#475569", // Slate 600
            borderColor: "#e2e8f0", // Slate 200
            borderWidth: 1,
            titleFont: {
              size: 13,
              weight: "bold" as const,
              family: "'Inter', sans-serif",
            },
            bodyFont: { size: 12, family: "'Inter', sans-serif" },
            padding: 12,
            cornerRadius: 12,
            displayColors: true,
            boxPadding: 4,
            callbacks: {
              label: (context: {
                label?: string;
                parsed: number;
                dataset: { data: number[] };
              }) => {
                const label = context.label || "";
                const value = context.parsed;
                const total = context.dataset.data.reduce(
                  (a, b) => (a as number) + (b as number),
                  0,
                ) as number;
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${formatCurrency(value * 100)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  $effect(() => {
    if (data && data.length >= 0 && canvas) {
      createChart();
    }
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });

  // Derived data with colors for legend
  let legendData = $derived(
    data.slice(0, 5).map((item, index) => ({
      ...item,
      color: getColor(index, type),
    })),
  );
</script>

<div class="flex flex-col md:flex-row items-center gap-8">
  <!-- Chart -->
  <div class="relative w-48 h-48 flex-shrink-0">
    <canvas bind:this={canvas}></canvas>

    <!-- Center Text -->
    <div
      class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
    >
      <span
        class="text-[10px] text-muted uppercase tracking-wider font-semibold mb-0.5"
        >Total</span
      >
      <span class="text-sm font-bold text-foreground">
        {privacyStore.hideAmounts
          ? "••••"
          : formatCurrency(data.reduce((sum, d) => sum + d.amount, 0))}
      </span>
    </div>
  </div>

  <!-- Legend -->
  <div class="flex-1 w-full space-y-3">
    {#each legendData as item}
      <div class="flex items-center justify-between group cursor-default">
        <div class="flex items-center gap-3">
          <!-- Icon with colored background -->
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style="background-color: {item.color}20; color: {item.color};"
          >
            <DynamicIcon name={item.category_icon} size={18} />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-foreground"
              >{item.category_name}</span
            >
            <span class="text-xs text-muted font-medium">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <span class="text-sm font-bold text-foreground tabular-nums">
          {privacyStore.hideAmounts ? "••••" : formatCurrency(item.amount)}
        </span>
      </div>
    {/each}
  </div>
</div>
