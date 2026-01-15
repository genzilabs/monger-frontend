<script lang="ts">
  import { Card } from "$lib/components/ui";
  import {
    UserIcon,
    ShieldIcon,
    SettingsIcon,
    ChevronRightIcon,
    LogOutIcon,
  } from "$lib/icons";
  import { authStore } from "$lib/stores";
  import { authApi } from "$lib/api";
  import { goto } from "$app/navigation";

  type View = "menu" | "profile" | "security" | "settings";

  let { onViewChange } = $props<{ onViewChange: (view: View) => void }>();

  async function handleLogout() {
    await authStore.logout();
    goto("/auth");
  }

  const menuItems = [
    {
      id: "profile",
      label: "Akun Personal",
      desc: "Nama, Email, dan Foto Profil",
      icon: UserIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "security",
      label: "Keamanan",
      desc: "Kata Sandi dan PIN Aplikasi",
      icon: ShieldIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "settings",
      label: "Pengaturan",
      desc: "Bahasa dan Mata Uang",
      icon: SettingsIcon,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];
</script>

<div class="space-y-8 animate-fade-in pb-10">
  <!-- Header -->
  <div class="flex items-center justify-between px-1 pt-2">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Akun Saya</h1>
      <p class="text-secondary text-sm">Kelola identitas dan preferensimu.</p>
    </div>
  </div>

  <!-- Profile Hero -->
  <div
    class="relative overflow-hidden rounded-3xl bg-surface-elevated border border-border p-6 flex flex-col items-center text-center gap-4"
  >
    <!-- Decorative Background -->
    <div class="absolute top-0 inset-x-0 h-16 bg-primary/5"></div>

    <div class="relative">
      <div
        class="w-24 h-24 rounded-full bg-surface border-4 border-surface shadow-sm flex items-center justify-center text-muted overflow-hidden"
      >
        {#if authStore.user?.avatar_url}
          <img
            src={authStore.user.avatar_url}
            alt="Avatar"
            class="w-full h-full object-cover"
          />
        {:else}
          <UserIcon size={40} />
        {/if}
      </div>
    </div>

    <div class="space-y-1">
      <h2 class="text-xl font-bold text-foreground">
        {authStore.user?.name || "Pengguna Monger"}
      </h2>
      <p class="text-secondary text-sm font-medium">
        {authStore.user?.email || authStore.user?.phone || "Belum ada kontak"}
      </p>
    </div>
  </div>

  <!-- Menu List -->
  <div class="space-y-4">
    <h3 class="text-xs font-bold text-muted uppercase tracking-widest px-1">
      Menu Utama
    </h3>

    <div class="grid gap-3">
      {#each menuItems as item}
        <button
          class="w-full flex items-center gap-4 p-4 rounded-xl bg-surface border border-transparent hover:border-border transition-all active:scale-[0.99] text-left group"
          onclick={() => onViewChange(item.id as View)}
        >
          <div
            class="{item.bg} {item.color} w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
          >
            <item.icon size={22} />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-foreground">{item.label}</p>
            <p class="text-xs text-secondary mt-0.5">{item.desc}</p>
          </div>
          <div
            class="text-border group-hover:text-foreground transition-colors"
          >
            <ChevronRightIcon size={20} />
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Logout Action -->
  <class class="pt-4">
    <button
      onclick={handleLogout}
      class="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
    >
      <LogOutIcon size={20} />
      <span>Keluar dari Akun</span>
    </button>

    <p
      class="text-center text-[10px] text-muted-foreground mt-6 tracking-widest opacity-60"
    >
      Monger Versi Alpha <br />By Genzi Meraih Mimpi
    </p>
  </class>
</div>
