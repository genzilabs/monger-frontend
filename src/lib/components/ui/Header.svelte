<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { authStore, booksStore, onboardingStore } from "$lib/stores";
  import { notificationsStore } from "$lib/stores/notifications.svelte";
  import {
    ChevronLeftIcon,
    BookIcon,
    PlusIcon,
    ChevronDownIcon,
    LogOutIcon,
    BellIcon,
  } from "$lib/icons";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";
  import { onMount } from "svelte";

  let {
    showBookSwitcher = $bindable(false),
    title,
    showBack = false,
    onNotificationClick,
    onCreateBook,
  } = $props<{
    showBookSwitcher?: boolean;
    title?: string;
    showBack?: boolean;
    onNotificationClick?: () => void;
    onCreateBook?: () => void;
  }>();

  onMount(() => {
    if (authStore.user) {
      notificationsStore.loadUnreadCount();
    }
  });

  // Define root paths where Logo is shown instead of Back button
  const rootPaths = ["/dashboard", "/transactions", "/pockets", "/menu"];

  const isRootPage = $derived(
    rootPaths.some((path) => $page.url.pathname === path) ||
      // Also consider the root of the app as dashboard conceptually if needed,
      // but explicit paths are safer.
      $page.url.pathname === "/",
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

    <!-- Center Section: Book Selector OR Title -->
    <div class="absolute left-1/2 -translate-x-1/2 z-30">
      {#if title}
        <h1 class="text-base font-semibold text-foreground">{title}</h1>
      {:else}
        <button
          id="book-switcher"
          onclick={() => (showBookSwitcher = !showBookSwitcher)}
          class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-transparent hover:border-border transition-all active:scale-95 max-w-40 {showBookSwitcher
            ? 'border-primary/20 bg-primary/5'
            : ''}"
        >
          {#if booksStore.activeBook}
            <p class="text-sm font-semibold text-foreground truncate">
              {booksStore.activeBook.name}
            </p>
          {:else if booksStore.books.length > 0}
            <p class="text-sm text-muted">Pilih Buku</p>
          {:else}
            <p class="text-sm text-primary font-medium">Buat Buku</p>
          {/if}
          <ChevronDownIcon
            class="text-muted shrink-0 transition-transform duration-200 {showBookSwitcher
              ? 'rotate-180'
              : ''}"
            size={14}
          />
        </button>
      {/if}
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
          {#if notificationsStore.unreadCount > 0}
            <span
              class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-background rounded-full"
            ></span>
          {/if}
        </div>
      </button>
    </div>
  </div>

  <!-- Desktop Header -->
  <div class="px-6 py-4 hidden md:flex items-center justify-between">
    <!-- Book Selector OR Title -->
    <div class="relative z-30">
      {#if title}
        <h1 class="text-xl font-bold text-foreground">{title}</h1>
      {:else}
        <button
          onclick={() => (showBookSwitcher = !showBookSwitcher)}
          class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface hover:bg-border transition-colors border border-transparent {showBookSwitcher
            ? 'border-primary/20 bg-primary/5'
            : ''}"
        >
          {#if booksStore.activeBook}
            <div
              class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"
            >
              <BookIcon class="text-primary" size={16} />
            </div>
            <div class="flex flex-col items-start">
              <p
                class="text-xs text-muted font-medium uppercase tracking-wider"
              >
                Buku Aktif
              </p>
              <p
                class="text-sm font-bold text-foreground line-clamp-1 max-w-[120px]"
              >
                {booksStore.activeBook.name}
              </p>
            </div>
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
          <ChevronDownIcon
            class="text-muted transition-transform duration-200 {showBookSwitcher
              ? 'rotate-180'
              : ''}"
            size={16}
          />
        </button>
      {/if}

      <!-- Dropdown Menu -->
      {#if showBookSwitcher}
        <div
          class="absolute top-full left-0 mt-2 w-72 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div
            class="p-2 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar"
          >
            {#each booksStore.books as book}
              <button
                onclick={() => {
                  console.log("[Header] Book clicked, calling completeAction");
                  booksStore.setActiveBook(book);
                  showBookSwitcher = false;
                  // Notify onboarding
                  onboardingStore.completeAction("book_selected");
                  // Only navigate if not already on dashboard
                  if (!window.location.pathname.includes("/dashboard")) {
                    setTimeout(() => goto("/dashboard"), 100);
                  }
                }}
                class="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left {booksStore
                  .activeBook?.id === book.id
                  ? 'bg-primary/10'
                  : 'hover:bg-muted/10'}"
              >
                <div
                  class="w-10 h-10 rounded-lg {booksStore.activeBook?.id ===
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

          <div class="p-2 border-t border-border bg-muted/5">
            <button
              onclick={() => {
                showBookSwitcher = false;
                onCreateBook();
              }}
              class="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all group"
            >
              <PlusIcon
                size={16}
                class="group-hover:scale-110 transition-transform"
              />
              <span class="text-sm font-semibold">Buat Buku Baru</span>
            </button>
          </div>
        </div>

        <!-- Backdrop to close -->
        <button
          type="button"
          class="fixed inset-0 z-40 bg-transparent w-full h-full cursor-default"
          onclick={() => (showBookSwitcher = false)}
          aria-label="Close menu"
        ></button>
      {/if}
    </div>

    <!-- User Info -->
    <div class="flex items-center gap-4">
      <button
        onclick={onNotificationClick}
        class="p-2 text-muted hover:text-foreground transition-colors relative"
      >
        <BellIcon size={20} />
        {#if notificationsStore.unreadCount > 0}
          <span
            class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-background"
          ></span>
        {/if}
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
