<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Chart, registerables } from "chart.js";
  import type { DailyBreakdown } from "$lib/api/transactions";

  // Register Chart.js components
  Chart.register(...registerables);

  interface Props {
    data: DailyBreakdown[];
    loading?: boolean;
    currency?: string;
  }

  let { data, loading = false, currency = "IDR" }: Props = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  function formatCurrency(cents: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric" });
  }

  function createChart() {
    if (!canvas || !data || data.length === 0) return;

    // Destroy existing chart
    if (chart) {
      chart.destroy();
    }

    const labels = data.map((d) => formatDate(d.date));
    const incomeData = data.map((d) => d.income / 100);
    const expenseData = data.map((d) => d.expense / 100);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Pemasukan",
            data: incomeData,
            backgroundColor: "rgba(16, 185, 129, 0.7)",
            borderColor: "rgb(16, 185, 129)",
            borderWidth: 0,
            borderRadius: 4,
            barPercentage: 0.7,
            categoryPercentage: 0.8,
          },
          {
            label: "Pengeluaran",
            data: expenseData,
            backgroundColor: "rgba(239, 68, 68, 0.7)",
            borderColor: "rgb(239, 68, 68)",
            borderWidth: 0,
            borderRadius: 4,
            barPercentage: 0.7,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            align: "end",
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              borderRadius: 2,
              useBorderRadius: true,
              padding: 16,
              font: {
                size: 11,
                weight: "500",
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: { size: 12, weight: "600" },
            bodyFont: { size: 11 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
                const label = context.dataset.label || "";
                const value = context.parsed.y;
                return `${label}: ${formatCurrency(value * 100)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 10 },
              maxRotation: 0,
            },
            border: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              font: { size: 10 },
              callback: (value: string | number) => {
                if (typeof value === "number") {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(0)}jt`;
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}rb`;
                  }
                  return value;
                }
                return value;
              },
            },
            border: {
              display: false,
            },
          },
        },
      },
    });
  }

  $effect(() => {
    if (data && data.length > 0 && canvas) {
      createChart();
    }
  });

  onMount(() => {
    if (data && data.length > 0) {
      createChart();
    }
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });
</script>

<div class="w-full bg-surface rounded-2xl border border-border p-4">
  <h3 class="text-sm font-semibold text-foreground mb-3">
    Grafik Bulan Ini
  </h3>

  {#if loading}
    <div class="h-48 bg-border/30 rounded-xl animate-pulse"></div>
  {:else if !data || data.length === 0}
    <div
      class="h-48 flex items-center justify-center text-muted text-sm"
    >
      Belum ada data transaksi bulan ini
    </div>
  {:else}
    <div class="h-48">
      <canvas bind:this={canvas}></canvas>
    </div>
  {/if}
</div>
