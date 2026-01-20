<script lang="ts">
  /**
   * SidePanel - Desktop right side panel (drawer)
   * Hidden on mobile, shown on md+ breakpoints
   * Use for transaction creation, pocket creation, detail views
   */
  import type { Snippet } from "svelte";
  import { XIcon, ArrowUpIcon, RepeatIcon, WalletIcon } from "$lib/icons";
  import { browser } from "$app/environment";
  import { portal } from "$lib/actions/portal";
  import { page } from "$app/stores";

  function isActive(path: string) {
    return $page.url.pathname.startsWith(path);
  }

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
    class="fixed inset-0 bg-black/30 z-[110] hidden md:block"
    onclick={onClose}
    role="presentation"
  ></div>

  <!-- Panel -->
  <aside
    use:portal
    class="fixed top-0 right-0 h-full w-full md:w-[440px] bg-background border-l border-border z-[110] flex flex-col shadow-xl
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

    <!-- Navigation Links (added content) -->
    <div class="p-6 border-b border-border">
      <nav class="grid gap-2">
        <a
          href="/transactions"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors {isActive('/transactions') ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface-elevated hover:text-foreground'}"
        >
          <ArrowUpIcon size={20} />
          Transaksi
        </a>
        
        <a
          href="/recurring"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors {isActive('/recurring') ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface-elevated hover:text-foreground'}"
        >
          <RepeatIcon size={20} />
          Rutin
        </a>

        <a
          href="/pockets"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors {isActive('/pockets') ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface-elevated hover:text-foreground'}"
        >
          <WalletIcon size={20} />
          Dompet
        </a>
      </nav>
    </div>

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
