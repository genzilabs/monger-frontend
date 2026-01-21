<script lang="ts">
  import { page } from "$app/stores";
  
  import {
    Menu,
    ProfileView,
    SecurityView,
    SettingsView,
  } from "$lib/components/account";
  import { ChevronLeftIcon } from "$lib/icons";
  import { onMount } from "svelte";
  import { authApi } from "$lib/api";
  import { authStore } from "$lib/stores";

  type View = "menu" | "profile" | "security" | "settings";

  let currentView = $state<View>("menu");

  const viewTitles: Record<View, string> = {
    menu: "Akun Saya",
    profile: "Profil Kamu",
    security: "Keamanan",
    settings: "Pengaturan",
  };

  function handleViewChange(view: View) {
    currentView = view;
  }

  function handleBack() {
    currentView = "menu";
  }



  onMount(async () => {
    // Check for view param
    const viewParam = $page.url.searchParams.get("view");
    if (viewParam && ["profile", "security", "settings"].includes(viewParam)) {
      currentView = viewParam as View;
    }

    // Refresh profile on mount to ensure freshness
    try {
      const res = await authApi.getProfile();
      if (res.data) authStore.setUser(res.data);
    } catch {}
  });
</script>

<svelte:head>
  <title>{viewTitles[currentView]} - Monger</title>
</svelte:head>

<div
  class="{currentView !== 'menu'
    ? 'pb-20'
    : ''} min-h-screen bg-background animate-fade-in"
>
  <div class="w-full">
    {#if currentView === "menu"}
      <Menu onViewChange={handleViewChange} />
    {:else}
      <!-- Sub-view Container -->
      <div class="animate-fade-in relative min-h-screen bg-background">
        {#if currentView === "profile"}
          <ProfileView onBack={handleBack} />
        {:else if currentView === "security"}
          <SecurityView onBack={handleBack} />
        {:else if currentView === "settings"}
          <SettingsView />
        {/if}
      </div>
    {/if}
  </div>
</div>
