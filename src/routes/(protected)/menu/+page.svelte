<script lang="ts">
  import {
    BookIcon,
    WalletIcon,
    SettingsIcon,
    UserIcon,
    ShieldIcon,
    BellIcon,
    LogOutIcon,
    TagIcon,
    CreditCardIcon,
  } from "$lib/icons";
  import { Card } from "$lib/components/ui";
  import { authStore } from "$lib/stores";
  import { goto } from "$app/navigation";

  const menuItems = [
    {
      label: "Pengaturan",
      href: "/account?view=settings",
      icon: SettingsIcon,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Buku",
      href: "/books",
      icon: BookIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Kantong",
      href: "/pockets",
      icon: WalletIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Tipe Dompet",
      href: "/settings/pocket-types",
      icon: CreditCardIcon,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Kategori",
      href: "/settings/categories",
      icon: TagIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
     {
      label: "Profil",
      href: "/account?view=profile",
      icon: UserIcon,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
     {
      label: "Keamanan",
      href: "/account?view=security",
      icon: ShieldIcon,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Undangan",
      href: "/invitations",
      icon: BellIcon,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
  ];
</script>

<svelte:head>
  <title>Menu - Monger</title>
</svelte:head>

<div class="container max-w-md mx-auto p-6 md:p-8 space-y-6 pb-24 md:pb-6">
  <div class="space-y-1">
    <h1 class="text-2xl font-bold text-foreground">Menu</h1>
    <p class="text-muted-foreground text-sm">Semua fitur dalam satu tempat.</p>
  </div>

  <div class="grid grid-cols-3 gap-4">
    {#each menuItems as item}
      <a
        href={item.href}
        class="flex flex-col items-center justify-center p-4 gap-3 bg-surface rounded-2xl border border-transparent hover:border-border transition-all active:scale-95 text-center group"
      >
        <div
          class="{item.bg} {item.color} w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
        >
          <item.icon size={24} />
        </div>
        <span class="text-xs font-medium text-foreground leading-tight">
          {item.label}
        </span>
      </a>
    {/each}
    


      <!-- Placeholder for Collab (Simulated) -->
      <button
        onclick={() => alert('Fitur Kolaborasi akan segera hadir!')}
        class="flex flex-col items-center justify-center p-4 gap-3 bg-surface rounded-2xl border border-transparent hover:border-border transition-all active:scale-95 text-center group"
      >
        <div
          class="bg-cyan-50 text-cyan-600 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
        >
          <!-- Inline Users Icon -->
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <span class="text-xs font-medium text-foreground leading-tight">
          Kolaborasi
        </span>
      </button>
  </div>
  
  <div class="pt-6">
     <button
      onclick={() => {
        authStore.logout();
        goto("/auth");
      }}
      class="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
    >
      <LogOutIcon size={18} />
      <span>Keluar Aplikasi</span>
    </button>
     <p
      class="text-center text-[10px] text-muted-foreground mt-6 tracking-widest opacity-60"
    >
      Monger Versi Alpha <br />By Genzi Meraih Mimpi
    </p>
  </div>
</div>
