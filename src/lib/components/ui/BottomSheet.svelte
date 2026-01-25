<script lang="ts">
  import type { Snippet } from "svelte";
  import { Drawer } from "vaul-svelte";

  interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: Snippet;
  }

  let { open, onClose, title, children }: Props = $props();

  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  
  let internalOpen = $state(false); 
  let isMounted = false;

  // Dynamic Snap Points
  let viewportHeight = $state(0);
  let contentHeight = $state(0);
  
  // Calculate snap points based on content height
  let snapPoints = $derived.by(() => {
      if (!viewportHeight || !contentHeight) return [0.5, 1];
      
      const fraction = (contentHeight + 30) / viewportHeight;
      const safeFraction = Math.max(Math.min(fraction, 0.9), 0.3);
      
      return [safeFraction, 1];
  });

  // Use visual viewport for better keyboard handling
  function updateViewportHeight() {
    if (typeof window !== 'undefined') {
      // Use visualViewport if available (better for keyboard handling)
      if (window.visualViewport) {
        viewportHeight = window.visualViewport.height;
      } else {
        viewportHeight = window.innerHeight;
      }
    }
  }

  onMount(() => {
    isMounted = true;
    updateViewportHeight();
    
    // Listen to visual viewport changes (keyboard open/close)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
      window.visualViewport.addEventListener('scroll', updateViewportHeight);
    }
    window.addEventListener('resize', updateViewportHeight);
    
    if (open) {
      setTimeout(() => {
        internalOpen = true;
      }, 150);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
        window.visualViewport.removeEventListener('scroll', updateViewportHeight);
      }
      window.removeEventListener('resize', updateViewportHeight);
    };
  });

  $effect(() => {
    if (isMounted) {
      if (open && !internalOpen) {
        internalOpen = true;
      }
      if (!open && internalOpen) {
        internalOpen = false;
      }
    }
  });

  function handleOpenChange(isOpen: boolean) {
    internalOpen = isOpen;
    if (!isOpen) {
      onClose(); 
    }
  }

</script>

<Drawer.Root 
    bind:open={internalOpen} 
    onOpenChange={handleOpenChange}
    snapPoints={snapPoints}
    fadeFromIndex={0}
    shouldScaleBackground={false}
>
  <Drawer.Portal>
    {#if internalOpen}
        <div 
            class="fixed inset-0 bg-black/60 z-[110]" 
            transition:fade={{ duration: 200 }} 
            onclick={() => onClose()}
            role="dialog"
            aria-modal="true"
        ></div>
    {/if}
    <Drawer.Content 
        class="drawer-content bg-background flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-[111] outline-none"
        style="max-height: {viewportHeight ? viewportHeight + 'px' : '100vh'};"
    >
      <div 
         bind:clientHeight={contentHeight}
         class="max-w-md w-full mx-auto flex flex-col"
         style="max-height: {viewportHeight ? viewportHeight + 'px' : '100vh'};"
      >
          <!-- Drag Handle -->
          <div class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4"></div>
          
          <div class="flex flex-col overflow-auto p-4 pt-0">
            {#if title}
                <Drawer.Title class="text-xl font-bold text-foreground mb-4 shrink-0">
                    {title}
                </Drawer.Title>
            {/if}
            
            <!-- Content wrapper -->
            <div class="pb-safe-area">
                 {@render children()}
            </div>
          </div>
      </div>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>

<style>
    .pb-safe-area {
        padding-bottom: env(safe-area-inset-bottom, 1.5rem);
    }
    
    .drawer-content {
        /* Prevent white space by using auto height that respects content */
        height: auto;
    }
</style>
