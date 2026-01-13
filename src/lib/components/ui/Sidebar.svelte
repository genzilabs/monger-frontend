<script lang="ts">
  /**
   * Sidebar - Desktop sidebar navigation with expand/collapse
   * Hidden on mobile, shown on md+ breakpoints
   */
  import { page } from "$app/stores";
  import {
    HomeIcon,
    ClipboardIcon,
    BookIcon,
    WalletIcon,
    UserIcon,
    PlusIcon,
    PanelLeftCloseIcon,
    PanelLeftOpenIcon,
    BellIcon,
  } from "$lib/icons";
  import { uiStore } from "$lib/stores";
  import logoText from "$lib/assets/Logo/logo-text.webp";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  type NavItem = {
    id: string;
    label: string;
    href: string;
    icon: typeof HomeIcon;
  };

  const navItems: NavItem[] = [
    { id: "home", label: "Beranda", href: "/dashboard", icon: HomeIcon },
    {
      id: "transaction",
      label: "Transaksi",
      href: "/transactions",
      icon: ClipboardIcon,
    },
    { id: "pockets", label: "Kantong", href: "/pockets", icon: WalletIcon },
    { id: "books", label: "Buku", href: "/books", icon: BookIcon },
    { id: "invitations", label: "Undangan", href: "/invitations", icon: BellIcon },
    { id: "profile", label: "Profil", href: "/account", icon: UserIcon },
  ];

  // Sidebar collapse state (persists in session via store)
  let isCollapsed = $state(false);

  const isActive = (href: string) =>
    $page.url.pathname === href || $page.url.pathname.startsWith(href + "/");

  function toggleSidebar() {
    isCollapsed = !isCollapsed;
  }
</script>

<aside
  class="hidden md:flex flex-col bg-surface border-r border-border h-screen sticky top-0 transition-all duration-200 ease-in-out
		{isCollapsed ? 'w-20' : 'w-64'}"
>
  <!-- Header: Logo + Toggle -->
  <div
    class="p-4 border-b border-border flex items-center justify-between gap-2"
  >
    <a href="/dashboard" class="block flex-shrink-0">
      {#if isCollapsed}
        <img src={logoOnly} alt="Monger" class="h-8 w-8" />
      {:else}
        <img src={logoText} alt="Monger" class="h-8 w-auto" />
      {/if}
    </a>
    <button
      onclick={toggleSidebar}
      class="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {#if isCollapsed}
        <PanelLeftOpenIcon size={18} />
      {:else}
        <PanelLeftCloseIcon size={18} />
      {/if}
    </button>
  </div>

  <!-- Navigation Links -->
  <nav class="flex-1 p-2 space-y-1">
    {#each navItems as item}
      <a
        href={item.href}
        class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
					{isActive(item.href)
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-secondary hover:bg-surface-elevated hover:text-foreground'}
					{isCollapsed ? 'justify-center' : ''}"
        title={isCollapsed ? item.label : undefined}
      >
        <svelte:component this={item.icon} size={20} />
        {#if !isCollapsed}
          <span>{item.label}</span>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- Quick Add Button -->
  <div class="p-2 border-t border-border">
    <button
      onclick={() => uiStore.openTransactionModal("expense")}
      class="flex items-center justify-center gap-2 w-full px-3 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium"
      title={isCollapsed ? "Tambah Transaksi" : undefined}
    >
      <PlusIcon size={20} />
      {#if !isCollapsed}
        <span>Tambah Transaksi</span>
      {/if}
    </button>
  </div>
</aside>
