<script lang="ts">
  import {
    BottomNavbar,
    BookSwitcher,
    Sidebar,
    Header,
  } from "$lib/components/ui";
  import { authStore, booksStore, uiStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let { children } = $props();

  let showBookSwitcher = $state(false);
  let showCreateBookModal = $state(false);

  // Lazy load modals only when needed
  let CreateBookModal: any = $state(null);
  let CreateTransactionModal: any = $state(null);

  onMount(async () => {
    // Initialize auth first (blocking - needed for protected routes)
    if (!authStore.isInitialized) await authStore.initialize();

    // Initialize books after auth (non-blocking)
    if (!booksStore.isInitialized) booksStore.initialize();

    // Lazy load modals after initial render
    requestIdleCallback(
      async () => {
        const [bookModal, txModal] = await Promise.all([
          import("$lib/components/modals/CreateBookModal.svelte"),
          import("$lib/components/modals/CreateTransactionModal.svelte"),
        ]);
        CreateBookModal = bookModal.default;
        CreateTransactionModal = txModal.default;
      },
      { timeout: 2000 },
    );
  });
</script>

<div class="min-h-screen bg-background flex">
  <!-- Desktop Sidebar -->
  <Sidebar />

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col min-w-0">
    <Header bind:showBookSwitcher />

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

<!-- Book Switcher -->
<BookSwitcher
  bind:isOpen={showBookSwitcher}
  onClose={() => (showBookSwitcher = false)}
  onCreate={() => {
    showBookSwitcher = false;
    showCreateBookModal = true;
  }}
/>

<!-- Lazy-loaded Modals -->
{#if CreateBookModal}
  <svelte:component
    this={CreateBookModal}
    open={showCreateBookModal}
    onClose={() => (showCreateBookModal = false)}
  />
{/if}

{#if CreateTransactionModal}
  <svelte:component
    this={CreateTransactionModal}
    open={uiStore.isTransactionModalOpen}
    onClose={() => uiStore.closeTransactionModal()}
    defaultType={uiStore.transactionModalDefaultType}
    defaultPocketId={uiStore.transactionModalPocketId}
  />
{/if}
