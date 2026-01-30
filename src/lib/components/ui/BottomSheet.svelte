<script lang="ts">
  import type { Snippet } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { onMount, tick } from "svelte";

  interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: Snippet;
  }

  let { open, onClose, title, children }: Props = $props();
  
  let contentWrapper: HTMLDivElement;
  let isFullscreen = $state(false);
  let isDragging = $state(false);
  let startY = 0;
  let currentDragY = $state(0);
  let initialHeight = $state(0);
  let isMounted = $state(false);
  let showSheet = $state(false);

  // Handle the open prop changes properly for animations
  $effect(() => {
    if (open && isMounted) {
      // Small delay to ensure transition plays
      tick().then(() => {
        showSheet = true;
      });
    } else if (!open) {
      showSheet = false;
      isFullscreen = false;
      currentDragY = 0;
    }
  });

  onMount(() => {
    isMounted = true;
    if (open) {
      tick().then(() => {
        showSheet = true;
      });
    }
  });

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onClose();
      isFullscreen = false;
    }
  }

  function handlePointerDown(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    startY = e.clientY;
    currentDragY = 0;
    
    if (contentWrapper) {
      initialHeight = contentWrapper.offsetHeight;
    }
    
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.clientY - startY;
    currentDragY = delta;
    
    if (contentWrapper) {
      if (delta > 0) {
        // Dragging DOWN - reduce height
        const newHeight = Math.max(initialHeight - (delta * 0.6), 100);
        contentWrapper.style.height = `${newHeight}px`;
      } else {
        // Dragging UP - increase the height
        const newHeight = Math.min(initialHeight + Math.abs(delta), window.innerHeight);
        contentWrapper.style.height = `${newHeight}px`;
      }
    }
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
    
    const threshold = 50;
    const delta = currentDragY;
    
    // Reset styles
    if (contentWrapper) {
      contentWrapper.style.height = '';
    }
    
    if (isFullscreen) {
      if (delta > threshold) {
        isFullscreen = false;
      }
    } else {
      if (delta < -threshold) {
        isFullscreen = true;
      } else if (delta > threshold) {
        onClose();
      }
    }
    
    currentDragY = 0;
  }
</script>

{#if showSheet}
  <!-- Overlay with fade animation -->
  <div 
    class="fixed inset-0 bg-black/60 z-[110]"
    onclick={() => onClose()}
    transition:fade={{ duration: 200 }}
    role="presentation"
  ></div>
  
  <!-- Sheet with slide animation -->
  <div
    bind:this={contentWrapper}
    class="sheet fixed bottom-0 left-0 right-0 z-[111] rounded-t-xl bg-background {isDragging ? '' : 'transition-all duration-300 ease-out'}"
    class:fullscreen={isFullscreen}
    transition:fly={{ y: 300, duration: 300 }}
    role="dialog"
    aria-modal="true"
  >
    <div class="mx-auto w-full max-w-md p-4 h-full flex flex-col">
      <!-- Drag Handle -->
      <div 
        class="handle-container flex items-center justify-center py-4 -mt-4 cursor-grab select-none"
        role="slider"
        tabindex="0"
        aria-label="Drag to resize"
        onpointerdown={handlePointerDown}
        onpointermove={handlePointerMove}
        onpointerup={handlePointerUp}
        onpointercancel={handlePointerUp}
      >
        <div class="h-1.5 w-12 rounded-full bg-muted pointer-events-none"></div>
      </div>
      
      {#if title}
        <h2 class="text-xl font-bold text-foreground mb-4">
          {title}
        </h2>
      {/if}
      
      <div class="overflow-y-auto flex-1">
        <div class="pb-safe">
          {@render children()}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .handle-container {
    touch-action: none;
  }
  
  .sheet {
    max-height: 90vh;
  }
  
  .fullscreen {
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 1rem);
  }
</style>
