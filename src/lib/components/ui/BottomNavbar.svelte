<script lang="ts">
  /**
   * BottomNavbar - Mobile bottom navigation with floating add button
   */
  import { page } from "$app/stores";
  import { uiStore } from "$lib/stores";

  type NavItem = {
    id: string;
    label: string;
    href: string;
    icon: "home" | "transaction" | "pocket" | "account" | "menu";
  };

  const navItems: NavItem[] = [
    { id: "home", label: "Beranda", href: "/dashboard", icon: "home" },
    {
      id: "transaction",
      label: "Transaksi",
      href: "/transactions",
      icon: "transaction",
    },
    { id: "pocket", label: "Kantong", href: "/pockets", icon: "pocket" },
    { id: "menu", label: "Lainnya", href: "/menu", icon: "menu" },
  ];

  const isActive = (href: string) => $page.url.pathname === href;
</script>

<nav class="fixed bottom-0 left-0 right-0 z-50">
  <!-- Floating Add Button (above the bar) -->
  <div class="absolute left-1/2 -translate-x-1/2 -top-7 z-10">
    <button
      onclick={() => uiStore.openTransactionModal("expense")}
      class="flex items-center justify-center w-16 h-16 bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg transition-colors cursor-pointer"
      aria-label="Tambah Transaksi"
    >
      <svg
        class="w-9 h-9"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  </div>

  <!-- Navigation Bar -->
  <div class="bg-white border-t border-slate-200 pb-safe">
    <div class="flex items-center justify-around h-16">
      <!-- Home -->
      <a
        href={navItems[0].href}
        class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2
					{isActive(navItems[0].href) ? 'text-primary' : 'text-muted'}"
      >
        <svg
          class="w-6 h-6"
          fill={isActive(navItems[0].href) ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span class="text-xs font-medium">{navItems[0].label}</span>
      </a>

      <!-- Transaction -->
      <a
        href={navItems[1].href}
        class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2
					{isActive(navItems[1].href) ? 'text-primary' : 'text-muted'}"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <span class="text-xs font-medium">{navItems[1].label}</span>
      </a>

      <!-- Spacer for center button -->
      <div class="flex-1"></div>

      <!-- Settle -->
      <a
        href={navItems[2].href}
        class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2
					{isActive(navItems[2].href) ? 'text-primary' : 'text-muted'}"
      >
        <svg
          class="w-6 h-6"
          fill={isActive(navItems[2].href) ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span class="text-xs font-medium">{navItems[2].label}</span>
      </a>

      <!-- Menu -->
      <a
        href={navItems[3].href}
        class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2
					{isActive(navItems[3].href) ? 'text-primary' : 'text-muted'}"
      >
        <svg
          class="w-6 h-6"
          fill={isActive(navItems[3].href) ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        <span class="text-xs font-medium">{navItems[3].label}</span>
      </a>
    </div>
  </div>
</nav>

<style>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
</style>
