<script lang="ts">
    import { ResponsiveModal, Button, Combobox } from "$lib/components/ui";
    import type { Pocket } from "$lib/types";

    interface Props {
        open: boolean;
        onClose: () => void;
        pockets: Pocket[];
        // Current filter values
        selectedPocketId: string | null;
        selectedType: "all" | "income" | "expense" | "transfer";
        startDate: string;
        endDate: string;
        // Callbacks
        onApply: (filters: {
            pocketId: string | null;
            type: "all" | "income" | "expense" | "transfer";
            startDate: string;
            endDate: string;
        }) => void;
    }

    let {
        open,
        onClose,
        pockets,
        selectedPocketId,
        selectedType,
        startDate,
        endDate,
        onApply,
    }: Props = $props();

    // Local state for editing
    let localPocketId = $state<string | null>(null);
    let localType = $state<"all" | "income" | "expense" | "transfer">("all");
    let localStartDate = $state("");
    let localEndDate = $state("");

    // Sync with props when modal opens
    $effect(() => {
        if (open) {
            localPocketId = selectedPocketId;
            localType = selectedType;
            localStartDate = startDate;
            localEndDate = endDate;
        }
    });

    function handleApply() {
        onApply({
            pocketId: localPocketId,
            type: localType,
            startDate: localStartDate,
            endDate: localEndDate,
        });
        onClose();
    }

    function handleReset() {
        localPocketId = null;
        localType = "all";
        localStartDate = "";
        localEndDate = "";
    }

    const pocketOptions = $derived([
        { value: "", label: "Semua Kantong" },
        ...pockets.map((p) => ({
            value: p.id,
            label: p.name,
        })),
    ]);

    const typeOptions = [
        { value: "all", label: "Semua Tipe" },
        { value: "income", label: "Pemasukan" },
        { value: "expense", label: "Pengeluaran" },
        { value: "transfer", label: "Transfer" },
    ];
</script>

<ResponsiveModal {open} {onClose} title="Filter Transaksi">
    <div class="space-y-5">
        <!-- Pocket Filter -->
        <div>
            <label
                for="pocket-filter"
                class="block text-sm font-medium text-secondary mb-2"
            >
                Kantong
            </label>
            <select
                id="pocket-filter"
                bind:value={localPocketId}
                class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
                <option value={null}>Semua Kantong</option>
                {#each pockets as pocket}
                    <option value={pocket.id}>{pocket.name}</option>
                {/each}
            </select>
        </div>

        <!-- Type Filter -->
        <div>
            <p class="block text-sm font-medium text-secondary mb-2">
                Tipe Transaksi
            </p>
            <div
                class="grid grid-cols-2 gap-2"
                role="group"
                aria-label="Tipe Transaksi"
            >
                {#each typeOptions as option}
                    <button
                        type="button"
                        onclick={() =>
                            (localType = option.value as typeof localType)}
                        class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all {localType ===
                        option.value
                            ? 'bg-primary text-white'
                            : 'bg-surface-elevated text-secondary hover:bg-border'}"
                    >
                        {option.label}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Date Range -->
        <div>
            <p class="block text-sm font-medium text-secondary mb-2">
                Rentang Tanggal
            </p>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label
                        for="start-date"
                        class="block text-xs text-muted mb-1">Dari</label
                    >
                    <input
                        id="start-date"
                        type="date"
                        bind:value={localStartDate}
                        class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div>
                    <label for="end-date" class="block text-xs text-muted mb-1"
                        >Sampai</label
                    >
                    <input
                        id="end-date"
                        type="date"
                        bind:value={localEndDate}
                        class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onclick={handleReset}>
                Reset
            </Button>
            <Button variant="primary" fullWidth onclick={handleApply}>
                Terapkan
            </Button>
        </div>
    </div>
</ResponsiveModal>
