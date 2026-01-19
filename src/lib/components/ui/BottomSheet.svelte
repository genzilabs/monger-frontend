<script lang="ts">
  import type { Snippet } from "svelte";
  import { portal } from "$lib/actions/portal";

  interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: Snippet;
  }

  let { open, onClose, title, children }: Props = $props();

  function handleBackdropClick() {
    onClose();
  }
</script>

{#if open}
  <div
    use:portal
    class="fixed inset-0 bg-black/50 flex items-end justify-center z-[110]"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
  >
    <div
      class="w-full bg-background p-6 pb-6 overflow-y-auto animate-slide-up transition-all duration-300 rounded-t-3xl"
      style="max-height: 90vh"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <!-- Drag Handle -->
      <div class="w-full flex justify-center mb-4 -mt-2 py-3">
        <div class="w-12 h-1.5 rounded-full bg-border"></div>
      </div>

      {#if title}
        <h2 class="text-xl font-bold text-foreground mb-4">{title}</h2>
      {/if}

      {@render children()}
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
</style>
