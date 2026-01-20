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

  // Handle open state binding
  // vaul-svelte controls open state internally or via binding.
  // We need to sync the Prop `open` with the Drawer `open` state.
  // However, props are one-way in Svelte 5 by default unless bound.
  // We'll use an effect to sync prop changes to internal state, 
  // and an onOpenChange callback to sync internal back to parent (via onClose).
  
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  
  let internalOpen = $state(false); 
  let isMounted = false;

  // Dynamic Snap Points
  let innerHeight = $state(0);
  let contentHeight = $state(0);
  
  // Calculate the fraction of the screen the content takes up
  // Allow slightly more than content (e.g. +20px padding) if needed
  // Ensure we have at least 2 points for 'maximize' behavior if content is small.
  // We clamp the initial snap point to 0.9 (90% height) max.
  let snapPoints = $derived.by(() => {
      if (!innerHeight || !contentHeight) return [0.5, 1]; // Safe fallback
      
      const fraction = (contentHeight + 30) / innerHeight; // Add buffer for handle
      
      // Clamp between 0.3 (min size) and 0.9 (max initial size)
      const safeFraction = Math.max(Math.min(fraction, 0.9), 0.3);
      
      return [safeFraction, 1];
  });

  onMount(() => {
    isMounted = true;
    if (open) {
        // Delay to allow VAUL to initialize and play entry animation
        setTimeout(() => {
            internalOpen = true;
        }, 150);
    }
  });

  $effect(() => {
    // Only sync prop -> internal if we are mounted and past the initial delay phase
    if (isMounted) {
        // If prop changes to true, we want to open
        if (open && !internalOpen) {
             internalOpen = true;
        }
        // If prop changes to false, we want to close (handled by handleOpenChange usually, but good to sync)
        if (!open && internalOpen) {
            internalOpen = false;
        }
    }
  });

  function handleOpenChange(isOpen: boolean) {
      internalOpen = isOpen;
      if (!isOpen) {
          // Sync back to parent
          onClose(); 
      }
  }

</script>

<svelte:window bind:innerHeight />

<Drawer.Root 
    bind:open={internalOpen} 
    onOpenChange={handleOpenChange}
    snapPoints={snapPoints}
    fadeFromIndex={0}
    shouldScaleBackground={true}
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
        class="bg-background flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-[111] outline-none h-[100dvh]"
    >
      <!-- This wrapper determines the natural height of content -->
      <!-- We bind its height to calculate snap points -->
      <div 
         bind:clientHeight={contentHeight}
         class="max-w-md w-full mx-auto flex flex-col max-h-[100dvh]"
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
</style>


