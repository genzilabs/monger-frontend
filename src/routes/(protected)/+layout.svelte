<script lang="ts">
  import { BottomNavbar, BookSwitcher, Sidebar } from "$lib/components/ui";
  import { authStore, booksStore, uiStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import {
    ChevronLeftIcon,
    BookIcon,
    PlusIcon,
    ChevronDownIcon,
    LogOutIcon,
  } from "$lib/icons";

  let { children } = $props();

  let showBookSwitcher = $state(false);
  let showCreateBookModal = $state(false);

  // Lazy load modals only when needed
  let CreateBookModal: any = $state(null);
  let CreateTransactionModal: any = $state(null);

  const showBackButton = $derived($page.url.pathname !== "/dashboard");

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
      { timeout: 2000 }
    );
  });

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/dashboard");
    }
  }

  async function handleLogout() {
    await authStore.logout();
    goto("/auth");
  }
</script>

<div class="min-h-screen bg-background flex">
  <!-- Desktop Sidebar -->
  <Sidebar />

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col min-w-0">
    <!-- Mobile Header (Hidden on Desktop) -->
    <header
      class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border md:hidden"
    >
      <div class="px-6 py-3 flex items-center justify-between relative">
        <!-- Left Section: Back Button -->
        <div class="flex items-center gap-3 min-w-[80px]">
          {#if showBackButton}
            <button
              onclick={goBack}
              class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface transition-colors"
              aria-label="Kembali"
            >
              <ChevronLeftIcon class="w-6 h-6 text-foreground" />
            </button>
          {/if}
        </div>

        <!-- Center Section: Book Selector -->
        <div class="absolute left-1/2 -translate-x-1/2">
          <button
            onclick={() => (showBookSwitcher = true)}
            class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface hover:bg-border transition-colors"
          >
            {#if booksStore.activeBook}
              <div
                class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"
              >
                <BookIcon class="w-4 h-4 text-primary" size={16} />
              </div>
              <p
                class="text-sm font-medium text-foreground truncate max-w-[120px]"
              >
                {booksStore.activeBook.name}
              </p>
            {:else if booksStore.books.length > 0}
              <div
                class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center"
              >
                <BookIcon class="w-4 h-4 text-muted" size={16} />
              </div>
              <p class="text-sm text-muted">Pilih Buku</p>
            {:else}
              <div
                class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <PlusIcon class="w-4 h-4 text-primary" size={16} />
              </div>
              <p class="text-sm text-primary font-medium">Buat Buku</p>
            {/if}
            <ChevronDownIcon class="w-4 h-4 text-muted" size={16} />
          </button>
        </div>

        <!-- Right Section: User Info -->
        <div class="flex items-center gap-3 min-w-[80px] justify-end">
          {#if authStore.user}
            <button
              onclick={handleLogout}
              class="p-2 text-muted hover:text-foreground transition-colors"
              aria-label="Keluar"
            >
              <LogOutIcon class="w-5 h-5" size={20} />
            </button>
          {:else}
            <div class="h-4 w-24 bg-surface rounded-full animate-pulse"></div>
            <div class="w-9 h-9 bg-surface rounded-full animate-pulse"></div>
          {/if}
        </div>
      </div>
    </header>

    <!-- Desktop Header -->
    <header
      class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border hidden md:block"
    >
      <div class="px-6 py-4 flex items-center justify-between">
        <!-- Book Selector -->
        <button
          onclick={() => (showBookSwitcher = true)}
          class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface hover:bg-border transition-colors"
        >
          {#if booksStore.activeBook}
            <div
              class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"
            >
              <BookIcon class="text-primary" size={16} />
            </div>
            <p class="text-sm font-medium text-foreground">
              {booksStore.activeBook.name}
            </p>
          {:else if booksStore.books.length > 0}
            <div
              class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center"
            >
              <BookIcon class="text-muted" size={16} />
            </div>
            <p class="text-sm text-muted">Pilih Buku</p>
          {:else}
            <div
              class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <PlusIcon class="text-primary" size={16} />
            </div>
            <p class="text-sm text-primary font-medium">Buat Buku</p>
          {/if}
          <ChevronDownIcon class="text-muted" size={16} />
        </button>

        <!-- User Info -->
        <div class="flex items-center gap-4">
          {#if authStore.user}
            <span class="text-sm text-secondary"
              >{authStore.user.name || authStore.user.email}</span
            >
            <button
              onclick={handleLogout}
              class="p-2 text-muted hover:text-foreground transition-colors"
              aria-label="Keluar"
            >
              <LogOutIcon size={20} />
            </button>
          {:else}
            <div class="h-4 w-24 bg-surface rounded-full animate-pulse"></div>
          {/if}
        </div>
      </div>
    </header>

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
