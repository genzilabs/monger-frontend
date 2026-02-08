<script lang="ts">
    import { ChevronDownIcon } from "$lib/icons";
    import { fade, slide } from "svelte/transition";
    import { clickOutside } from "$lib/actions/clickOutside";

    type SelectItem = {
        value: string;
        label: string;
    };

    interface Props {
        items: SelectItem[];
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        triggerClass?: string;
        onSelect?: (item: SelectItem) => void;
    }

    let {
        items,
        value = $bindable(),
        placeholder = "Select...",
        disabled = false,
        triggerClass = "",
        onSelect,
    }: Props = $props();

    let isOpen = $state(false);
    let selectedItem = $derived(items.find((i) => i.value === value));

    function toggle() {
        if (!disabled) {
            isOpen = !isOpen;
        }
    }

    function handleSelect(item: SelectItem) {
        value = item.value;
        isOpen = false;
        onSelect?.(item);
    }

    function close() {
        isOpen = false;
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative w-full" use:clickOutside onoutclick={close}>
    <button
        type="button"
        onclick={toggle}
        {disabled}
        class="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 {triggerClass}"
    >
        <span
            class="block truncate {selectedItem
                ? 'text-foreground'
                : 'text-muted'}"
        >
            {selectedItem ? selectedItem.label : placeholder}
        </span>
        <ChevronDownIcon
            size={16}
            class="ml-2 shrink-0 text-muted transition-transform duration-200 {isOpen
                ? 'rotate-180'
                : ''}"
        />
    </button>

    {#if isOpen}
        <div
            transition:slide={{ duration: 150 }}
            class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-surface p-1 shadow-lg focus:outline-none"
        >
            {#each items as item}
                <button
                    type="button"
                    onclick={() => handleSelect(item)}
                    class="relative flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted/50 {item.value ===
                    value
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground'}"
                >
                    {item.label}
                </button>
            {/each}
        </div>
    {/if}
</div>
