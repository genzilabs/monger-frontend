<script lang="ts">
  /**
   * AppLayout - Responsive layout wrapper
   * - Mobile: Full-width content with bottom navigation
   * - Desktop (md+): Sidebar + Header + Main content
   */
  import { BottomNavbar } from "$lib/components/ui";
  import Sidebar from "./Sidebar.svelte";
  import OfflineBanner from "./OfflineBanner.svelte";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    header?: Snippet;
  }

  let { children, header }: Props = $props();
</script>

<div class="min-h-screen bg-background flex">
  <!-- Desktop Sidebar -->
  <Sidebar />

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col min-w-0">
    <OfflineBanner />
    <!-- Optional Page Header -->
    {#if header}
      <header
        class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border hidden md:block"
      >
        <div class="px-6 py-4">
          {@render header()}
        </div>
      </header>
    {/if}

    <!-- Main Content -->
    <main class="flex-1 p-6 pb-28 md:pb-6">
      {@render children()}
    </main>
  </div>

  <!-- Mobile Bottom Navigation (hidden on desktop) -->
  <div class="md:hidden">
    <BottomNavbar />
  </div>
</div>
