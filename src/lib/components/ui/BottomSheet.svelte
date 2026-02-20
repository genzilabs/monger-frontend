<script lang="ts">
  import type { Snippet } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: Snippet;
  }

  let { open, onClose, title, children }: Props = $props();
  
  let isMounted = $state(false);
  let sheetRef = $state<HTMLElement | null>(null);

  // Drag state
  let isDragging = $state(false);
  let startY = 0;
  let currentY = $state(0);

  onMount(() => {
    isMounted = true;
  });

  // Prevent background scrolling while open
  $effect(() => {
    if (browser) {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    
    // Cleanup when component unmounts
    return () => {
      if (browser) {
        document.body.style.overflow = "";
      }
    };
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      onClose();
    }
  }

  function handleTouchStart(e: TouchEvent | MouseEvent) {
    isDragging = true;
    startY = "touches" in e ? e.touches[0].clientY : e.clientY;
    currentY = 0;
  }

  function handleTouchMove(e: TouchEvent | MouseEvent) {
    if (!isDragging) return;
    
    // Allow dragging content inside if they are scrolling, 
    // but if we are pulling down at the top of the scroll, we drag the sheet
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = y - startY;

    // Only allow pulling down, not up past the max height
    if (deltaY > 0) {
      currentY = deltaY;
      e.preventDefault(); // Prevent default scroll when dragging sheet
    }
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;

    // If dragged down more than 150px, close it
    if (currentY > 150) {
      onClose();
    }
    
    // Snap back
    currentY = 0;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && isMounted}
  <div class="fixed inset-0 z-[110]" role="presentation">
    <!-- Overlay -->
    <button
      type="button"
      class="absolute inset-0 bg-black/60 w-full h-full border-none cursor-default"
      onclick={onClose}
      transition:fade={{ duration: 250 }}
      aria-label="Close dialog"
    ></button>
    
    <!-- Sheet -->
    <div
      bind:this={sheetRef}
      class="absolute bottom-0 left-0 right-0 z-[111] bg-background rounded-t-[20px] max-h-[96%] flex flex-col focus:outline-none {isDragging ? '' : 'transition-transform duration-300 ease-out'}"
      style="transform: translateY({isDragging ? currentY : 0}px);"
      transition:fly={{ y: '100%', duration: 300, opacity: 1 }}
      role="dialog"
      aria-modal="true"
    >
      <!-- Drag handle area -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        class="w-full flex justify-center pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing touch-none"
        onmousedown={handleTouchStart}
        onmousemove={handleTouchMove}
        onmouseup={handleTouchEnd}
        onmouseleave={handleTouchEnd}
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
      >
        <div class="h-1.5 w-12 rounded-full bg-muted"></div>
      </div>
      
      <div class="p-4 overflow-y-auto flex-[0_1_auto] flex flex-col w-full h-full pb-safe min-h-0">
        {#if title}
          <h2 class="text-xl font-bold text-foreground mb-4 shrink-0">
            {title}
          </h2>
        {/if}
        <div class="flex-1 shrink-0 pb-4">
          {@render children()}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 1rem);
  }
</style>
