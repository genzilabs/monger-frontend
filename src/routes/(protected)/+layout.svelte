<script lang="ts">
  import { BottomNavbar, Sidebar, Header } from "$lib/components/ui";
  import {
    authStore,
    booksStore,
    uiStore,
    updatesStore,
    onboardingStore,
  } from "$lib/stores";
  import { pinStore } from "$lib/stores/pin.svelte";
  import PINGuard from "$lib/components/auth/PINGuard.svelte";
  import UpdateModal from "$lib/components/updates/UpdateModal.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import CreateBookModal from "$lib/components/modals/CreateBookModal.svelte";
  import type { ReceiptScan } from "$lib/api/receipts";

  let { children } = $props();

  let showBookSwitcher = $state(false);
  let showCreateBookModal = $state(false);
  let showNotificationModal = $state(false);
  let showReceiptScanner = $state(false);
  let showReceiptConfirm = $state(false);
  let scannedReceipt: ReceiptScan | null = $state(null);

  // Lazy load modals only when needed
  let CreateTransactionModal: any = $state(null);
  let NotificationModal: any = $state(null);
  let ReceiptScanner: any = $state(null);
  let ReceiptConfirmModal: any = $state(null);

  $effect(() => {
    if (uiStore.isTransactionModalOpen && !CreateTransactionModal) {
      import("$lib/components/modals/CreateTransactionModal.svelte").then(
        (m) => {
          CreateTransactionModal = m.default;
        },
      );
    }
  });

  $effect(() => {
    if (showNotificationModal && !NotificationModal) {
      import("$lib/components/modals/NotificationModal.svelte").then((m) => {
        NotificationModal = m.default;
      });
    }
  });

  $effect(() => {
    if (showReceiptScanner && !ReceiptScanner) {
      import("$lib/components/modals/ReceiptScanner.svelte").then((m) => {
        ReceiptScanner = m.default;
      });
    }
  });

  $effect(() => {
    if (showReceiptConfirm && !ReceiptConfirmModal) {
      import("$lib/components/modals/ReceiptConfirmModal.svelte").then((m) => {
        ReceiptConfirmModal = m.default;
      });
    }
  });

  async function handleScanComplete(scan: ReceiptScan) {
    scannedReceipt = scan;
    showReceiptScanner = false;
    
    // Load the confirmation modal if not already loaded
    if (!ReceiptConfirmModal) {
      const m = await import("$lib/components/modals/ReceiptConfirmModal.svelte");
      ReceiptConfirmModal = m.default;
    }
    
    showReceiptConfirm = true;
  }

  function openReceiptScanner() {
    showReceiptScanner = true;
  }

  // Expose scanner function to uiStore
  $effect(() => {
    uiStore.openReceiptScanner = openReceiptScanner;
  });

  onMount(async () => {
    // Initialize auth first (blocking - needed for protected routes)
    if (!authStore.isInitialized) await authStore.initialize();

    // Initialize books after auth (blocking - need to check for empty books)
    if (!booksStore.isInitialized) await booksStore.initialize();

    // Guard: Only redirect to create-book if API succeeded but returned no books.
    // Don't redirect on error (backend down) — show cached data or error state instead.
    if (booksStore.books.length === 0 && !booksStore.error) {
      goto("/create-book", { replaceState: true });
      return;
    }

    // Initialize PIN store (non-blocking)
    pinStore.initialize();

    // Check for updates and show modal if needed
    updatesStore.checkAndShowModal();
  });
</script>

<PINGuard />

<!-- 
  Only render content when:
  1. PIN store is initialized AND
  2. Either PIN is not enabled OR user is unlocked
  This prevents content flash during navigation and initial load
-->
{#if pinStore.isInitialized && (!pinStore.hasPin || !pinStore.isLocked)}
  <div class="min-h-screen bg-background flex">
    <!-- Desktop Sidebar -->
    <Sidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <Header
        bind:showBookSwitcher
        onNotificationClick={() => (showNotificationModal = true)}
        onCreateBook={() => (showCreateBookModal = true)}
      />

      <!-- Main Content -->
      <main class="flex-1 p-6 pb-28 md:pb-6">
        {@render children()}
      </main>
    </div>

    <!-- Mobile Bottom Navigation (hidden on desktop) -->
    <div class="md:hidden">
      <BottomNavbar />
    </div>

    <!-- Mobile Book Switcher Dropdown (Global Overlay) -->
    {#if showBookSwitcher}
      <div
        class="fixed inset-0 z-50 flex flex-col items-center justify-start pt-20 px-6 md:hidden animate-in fade-in duration-200"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onclick={() => (showBookSwitcher = false)}
        ></div>

        <!-- Dropdown Content -->
        <div
          class="w-full max-w-sm bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden relative z-10 flex flex-col max-h-[70vh]"
        >
          <div class="p-4 border-b border-border bg-muted/5">
            <h3 class="font-bold text-center">Ganti Buku</h3>
          </div>

          <div class="p-2 space-y-1 overflow-y-auto custom-scrollbar">
            {#each booksStore.books as book}
              <button
                onclick={() => {
                  booksStore.setActiveBook(book);
                  showBookSwitcher = false;
                  // Only navigate if not on dashboard
                  if (!window.location.pathname.includes("/dashboard")) {
                    goto("/dashboard");
                  }
                }}
                class="w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left {booksStore
                  .activeBook?.id === book.id
                  ? 'bg-primary/10'
                  : 'hover:bg-muted/10'}"
              >
                <div
                  class="w-10 h-10 rounded-xl {booksStore.activeBook?.id ===
                  book.id
                    ? 'bg-primary text-white'
                    : 'bg-muted/20 text-muted-foreground'} flex items-center justify-center text-lg font-bold shrink-0 relative"
                >
                  {book.name.charAt(0).toUpperCase()}
                  {#if book.member_count > 0}
                    <div
                      class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-surface"
                    >
                      <span class="text-[9px] font-bold text-white"
                        >{book.member_count}</span
                      >
                    </div>
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="font-bold text-sm truncate {booksStore.activeBook
                      ?.id === book.id
                      ? 'text-primary'
                      : 'text-foreground'}"
                  >
                    {book.name}
                  </p>
                  <p class="text-xs text-muted truncate">
                    {book.base_currency} • {book.owner_id === authStore.user?.id
                      ? "Owner"
                      : "Member"}
                  </p>
                </div>
                {#if booksStore.activeBook?.id === book.id}
                  <div class="w-2 h-2 rounded-full bg-primary shrink-0"></div>
                {/if}
              </button>
            {/each}
          </div>

          <div class="p-4 border-t border-border bg-muted/5">
            <button
              onclick={() => {
                showBookSwitcher = false;
                showCreateBookModal = true;
              }}
              class="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all group bg-background"
            >
              <span class="text-sm font-bold">Buat Buku Baru</span>
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <!-- Empty placeholder when PIN locked to prevent layout shift -->
  <div class="min-h-screen bg-background"></div>
{/if}

<!-- Modals -->
<CreateBookModal
  open={showCreateBookModal}
  onClose={() => (showCreateBookModal = false)}
/>

{#if CreateTransactionModal}
  <CreateTransactionModal
    open={uiStore.isTransactionModalOpen}
    onClose={() => uiStore.closeTransactionModal()}
    defaultType={uiStore.transactionModalDefaultType}
    defaultPocketId={uiStore.transactionModalPocketId}
  />
{/if}

{#if NotificationModal}
  <NotificationModal
    open={showNotificationModal}
    onClose={() => (showNotificationModal = false)}
  />
{/if}

{#if ReceiptScanner}
  <ReceiptScanner
    open={showReceiptScanner}
    onClose={() => (showReceiptScanner = false)}
    onScanComplete={handleScanComplete}
  />
{/if}

{#if ReceiptConfirmModal}
  <ReceiptConfirmModal
    open={showReceiptConfirm}
    onClose={() => {
      showReceiptConfirm = false;
      scannedReceipt = null;
    }}
    receiptScan={scannedReceipt}
  />
{/if}

<UpdateModal />

