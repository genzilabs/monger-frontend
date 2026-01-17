<script lang="ts">
  /**
   * SidePanel - Desktop right side panel (drawer)
   * Hidden on mobile, shown on md+ breakpoints
   * Use for transaction creation, pocket creation, detail views
   */
  import type { Snippet } from "svelte";
  import { XIcon } from "$lib/icons";
  import { browser } from "$app/environment";
  import { portal } from "$lib/actions/portal";

  interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: Snippet;
  }

  let { open, onClose, title, children }: Props = $props();

  // Close on escape key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      onClose();
    }
  }

  // Prevent body scroll when open
  $effect(() => {
    if (browser) {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      if (browser) {
        document.body.style.overflow = "";
      }
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    use:portal
    class="fixed inset-0 bg-black/30 z-50 hidden md:block"
    onclick={onClose}
    role="presentation"
  ></div>

  <!-- Panel -->
  <aside
    use:portal
    class="fixed top-0 right-0 h-full w-full md:w-[440px] bg-background border-l border-border z-50 flex flex-col shadow-xl
			   transform transition-transform duration-300 ease-out
			   hidden md:flex animate-slide-in-right"
    role="dialog"
    aria-modal="true"
  >
    <!-- Header -->
    <header
      class="flex items-center justify-between px-6 py-4 border-b border-border"
    >
      {#if title}
        <h2 class="text-lg font-semibold text-foreground">{title}</h2>
      {:else}
        <div></div>
      {/if}
      <button
        onclick={onClose}
        class="p-2 -mr-2 text-secondary hover:text-foreground transition-colors rounded-lg hover:bg-surface"
        aria-label="Tutup"
      >
        <XIcon size={20} />
      </button>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6">
      {@render children()}
    </div>
  </aside>
{/if}

<style>
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
</style>
