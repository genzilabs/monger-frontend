<script lang="ts">
    import ChevronDownIcon from "$lib/icons/ChevronDownIcon.svelte";

    interface FaqItem {
        question: string;
        answer: string;
    }

    interface Props {
        items: FaqItem[];
        class?: string;
    }

    let { items, class: className = "" }: Props = $props();
    let openIndex = $state<number | null>(null);

    function toggle(index: number) {
        openIndex = openIndex === index ? null : index;
    }

    function handleKeydown(event: KeyboardEvent, index: number) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle(index);
        }
    }

    function getItemClasses(index: number): string {
        const baseClasses =
            "bg-surface border rounded-xl overflow-hidden transition-all duration-200";
        const isOpen = openIndex === index;
        return isOpen
            ? `${baseClasses} border-primary/30`
            : `${baseClasses} border-border`;
    }
</script>

<div class="space-y-3 {className}">
    {#each items as item, index}
        <div class={getItemClasses(index)}>
            <button
                type="button"
                class="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-border/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onclick={() => toggle(index)}
                onkeydown={(e) => handleKeydown(e, index)}
                aria-expanded={openIndex === index}
            >
                <span class="text-foreground font-semibold pr-4"
                    >{item.question}</span
                >
                <span
                    class="text-muted transition-transform duration-200 shrink-0 {openIndex ===
                    index
                        ? 'rotate-180'
                        : ''}"
                >
                    <ChevronDownIcon class="w-5 h-5" />
                </span>
            </button>

            {#if openIndex === index}
                <div class="px-6 pb-5 animate-fade-in">
                    <p class="text-secondary leading-relaxed">{item.answer}</p>
                </div>
            {/if}
        </div>
    {/each}
</div>
