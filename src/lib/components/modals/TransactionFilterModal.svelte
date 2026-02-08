<script lang="ts">
    import {
        ResponsiveModal,
        Button,
        CalendarSelect,
        Combobox,
        type ComboboxOption,
    } from "$lib/components/ui";
    import type { Pocket } from "$lib/types";
    import { categoriesStore } from "$lib/stores";

    interface Props {
        open: boolean;
        onClose: () => void;
        pockets: Pocket[];
        // Current filter values
        selectedPocketId: string | null;
        selectedType: "all" | "income" | "expense" | "transfer";
        selectedCategoryId: string | null;
        searchQuery: string;
        startDate: string;
        endDate: string;
        // Callbacks
        onApply: (filters: {
            pocketId: string | null;
            type: "all" | "income" | "expense" | "transfer";
            categoryId: string | null;
            search: string;
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
        selectedCategoryId,
        searchQuery,
        startDate,
        endDate,
        onApply,
    }: Props = $props();

    // Local state for editing
    let localPocketId = $state<string>("");
    let localType = $state<"all" | "income" | "expense" | "transfer">("all");
    let localCategoryId = $state<string>("");
    let localSearch = $state("");
    let localStartDate = $state("");
    let localEndDate = $state("");

    // Sync with props when modal opens
    $effect(() => {
        if (open) {
            localPocketId = selectedPocketId ?? "";
            localType = selectedType;
            localCategoryId = selectedCategoryId ?? "";
            localSearch = searchQuery;
            localStartDate = startDate;
            localEndDate = endDate;
        }
    });

    // Build pocket options for Combobox
    const pocketOptions = $derived<ComboboxOption[]>([
        { value: "", label: "Semua Kantong" },
        ...pockets.map((p) => ({ value: p.id, label: p.name })),
    ]);

    // Build category options for Combobox
    const categoryOptions = $derived<ComboboxOption[]>([
        { value: "", label: "Semua Kategori" },
        ...categoriesStore.categories.map((c) => ({
            value: c.id,
            label: c.name,
            icon: c.icon,
        })),
    ]);

    function handleApply() {
        onApply({
            pocketId: localPocketId || null,
            type: localType,
            categoryId: localCategoryId || null,
            search: localSearch,
            startDate: localStartDate,
            endDate: localEndDate,
        });
        onClose();
    }

    function handleReset() {
        localPocketId = "";
        localType = "all";
        localCategoryId = "";
        localSearch = "";
        localStartDate = "";
        localEndDate = "";
    }

    const typeOptions = [
        { value: "all", label: "Semua" },
        { value: "income", label: "Pemasukan" },
        { value: "expense", label: "Pengeluaran" },
        { value: "transfer", label: "Transfer" },
    ];
</script>

<ResponsiveModal {open} {onClose} title="Filter Transaksi">
    <div class="space-y-6 overflow-auto">
        <!-- Search Filter -->
        <div class="space-y-2">
            <p class="text-sm font-medium text-foreground">Cari</p>
            <input
                type="text"
                bind:value={localSearch}
                placeholder="Cari nama atau deskripsi transaksi..."
                class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            />
        </div>

        <!-- Pocket Filter -->
        <Combobox
            label="Kantong"
            options={pocketOptions}
            bind:value={localPocketId}
            placeholder="Semua Kantong"
            searchPlaceholder="Cari kantong..."
            emptyMessage="Kantong tidak ditemukan"
        />

        <!-- Type Filter -->
        <div class="space-y-2">
            <p class="text-sm font-medium text-foreground">Tipe Transaksi</p>
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

        <!-- Category Filter -->
        <Combobox
            label="Kategori"
            options={categoryOptions}
            bind:value={localCategoryId}
            placeholder="Semua Kategori"
            searchPlaceholder="Cari kategori..."
            emptyMessage="Kategori tidak ditemukan"
        />

        <!-- Date Range with CalendarSelect -->
        <div class="space-y-3">
            <p class="text-sm font-medium text-foreground">Rentang Tanggal</p>
            <div class="grid grid-cols-2 gap-3">
                <CalendarSelect
                    value={localStartDate}
                    onSelect={(date) => (localStartDate = date)}
                    placeholder="Dari"
                    label="Dari"
                />
                <CalendarSelect
                    value={localEndDate}
                    onSelect={(date) => (localEndDate = date)}
                    placeholder="Sampai"
                    label="Sampai"
                />
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
