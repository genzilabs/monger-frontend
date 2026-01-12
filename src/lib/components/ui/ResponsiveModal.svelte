<script lang="ts">
  /**
   * ResponsiveModal - Uses SidePanel on desktop, BottomSheet on mobile
   * Automatically switches based on screen size
   */
  import type { Snippet } from "svelte";
  import BottomSheet from "./BottomSheet.svelte";
  import SidePanel from "./SidePanel.svelte";
  import { browser } from "$app/environment";

  interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: Snippet;
  }

  let { open, onClose, title, children }: Props = $props();

  // Track if we're on desktop (md breakpoint = 768px)
  let isDesktop = $state(false);

  $effect(() => {
    if (browser) {
      const mediaQuery = window.matchMedia("(min-width: 768px)");
      isDesktop = mediaQuery.matches;

      const handleChange = (e: MediaQueryListEvent) => {
        isDesktop = e.matches;
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  });
</script>

{#if isDesktop}
  <SidePanel {open} {onClose} {title}>
    {@render children()}
  </SidePanel>
{:else}
  <BottomSheet {open} {onClose} {title}>
    {@render children()}
  </BottomSheet>
{/if}
