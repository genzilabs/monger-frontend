<script lang="ts">
  import type { Pocket } from "$lib/types";

  interface Props {
    activePocketId: string | null;
    pockets: Pocket[];
    onSelect: (id: string | null) => void;
  }

  let { activePocketId, pockets, onSelect }: Props = $props();
</script>

<div class="flex overflow-x-auto gap-2 pb-2 no-scrollbar px-1">
  <!-- "Semua" Option -->
  <button
    onclick={() => onSelect(null)}
    class="px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0
      {activePocketId === null
      ? 'bg-primary text-white shadow-sm'
      : 'bg-surface border border-border text-foreground hover:bg-surface-elevated'}"
  >
    Semua Kantong
  </button>

  <!-- Pocket Options -->
  {#each pockets as pocket (pocket.id)}
    <button
      onclick={() => onSelect(pocket.id)}
      class="px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 flex items-center gap-2
        {activePocketId === pocket.id
        ? 'bg-primary text-white shadow-sm'
        : 'bg-surface border border-border text-foreground hover:bg-surface-elevated'}"
    >
      <div
        class="w-2 h-2 rounded-full"
        style="background-color: {pocket.color}"
      ></div>
      {pocket.name}
    </button>
  {/each}
</div>

<style>
  /* Hide scrollbar */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
