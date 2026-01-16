<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { authStore, booksStore } from "$lib/stores";
  import {
    ChevronLeftIcon,
    BookIcon,
    PlusIcon,
    ChevronDownIcon,
    LogOutIcon,
    BellIcon,
  } from "$lib/icons";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  let { showBookSwitcher = $bindable(), onNotificationClick } = $props<{
    showBookSwitcher: boolean;
    onNotificationClick: () => void;
  }>();

  // Define root paths where Logo is shown instead of Back button
  const rootPaths = ["/dashboard", "/transactions", "/pockets", "/menu"];

  const isRootPage = $derived(
    rootPaths.some((path) => $page.url.pathname === path) ||
      // Also consider the root of the app as dashboard conceptually if needed,
      // but explicit paths are safer.
      $page.url.pathname === "/"
  );

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 2) {
      window.history.back();
    } else {
      // Fallback strategy if history is empty or external
      const currentPath = $page.url.pathname;
      if (currentPath.startsWith("/pockets/")) goto("/pockets");
      else if (currentPath.startsWith("/transactions/")) goto("/transactions");
      else goto("/dashboard");
    }
  }

  async function handleLogout() {
    await authStore.logout();
    goto("/auth");
  }
</script>

<header
  class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border"
>
  <!-- Mobile Header -->
  <div
    class="px-6 py-3 flex items-center justify-between relative md:hidden h-15"
  >
    <!-- Left Section: Logo or Back Button -->
    <div class="flex items-center min-w-10">
      {#if isRootPage}
        <a href="/dashboard" class="flex items-center gap-2">
          <img src={logoOnly} alt="Monger" class="w-6 h-6" />
        </a>
      {:else}
        <button
          onclick={goBack}
          class="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-surface transition-colors active:scale-95"
          aria-label="Kembali"
        >
          <ChevronLeftIcon class="text-foreground" size={24} />
        </button>
      {/if}
    </div>

    <!-- Center Section: Book Selector -->
    <div class="absolute left-1/2 -translate-x-1/2">
      <button
        onclick={() => (showBookSwitcher = true)}
        class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-transparent hover:border-border transition-all active:scale-95 max-w-40"
      >
        {#if booksStore.activeBook}
          <!-- <div class="w-5 h-5 rounded bg-primary/20 flex items-center justify-center shrink-0">
                        <BookIcon class="text-primary" size={12} />
                    </div> -->
          <p class="text-sm font-semibold text-foreground truncate">
            {booksStore.activeBook.name}
          </p>
        {:else if booksStore.books.length > 0}
          <p class="text-sm text-muted">Pilih Buku</p>
        {:else}
          <p class="text-sm text-primary font-medium">Buat Buku</p>
        {/if}
        <ChevronDownIcon class="text-muted shrink-0" size={14} />
      </button>
    </div>

    <!-- Right Section: Notification -->
    <div class="flex items-center min-w-10 justify-end">
      <button
        onclick={onNotificationClick}
        class="flex items-center justify-center w-10 h-10 -mr-2 rounded-full hover:bg-surface transition-colors active:scale-95 text-muted hover:text-foreground"
        aria-label="Notifikasi"
      >
        <div class="relative">
          <BellIcon size={24} />
          <!-- Notification Dot (Placeholder) -->
          <!-- <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-background rounded-full"></span> -->
        </div>
      </button>
    </div>
  </div>

  <!-- Desktop Header -->
  <div class="px-6 py-4 hidden md:flex items-center justify-between">
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
      <button
        onclick={onNotificationClick}
        class="p-2 text-muted hover:text-foreground transition-colors"
      >
        <BellIcon size={20} />
      </button>
      <div class="h-6 w-px bg-border"></div>
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
