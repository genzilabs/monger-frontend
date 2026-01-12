<script lang="ts">
  import { Button, Card } from "$lib/components/ui";
  import { authStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { LogOutIcon, UserIcon } from "$lib/icons";

  async function handleLogout() {
    authStore.logout();
    goto("/auth");
  }
</script>

<svelte:head>
  <title>Profil - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-6">
  <!-- Page Header -->
  <div>
    <h1 class="text-2xl font-bold text-foreground">Profil</h1>
    <p class="text-secondary">Kelola akun dan preferensimu.</p>
  </div>

  <!-- User Info Card -->
  <Card class="p-6">
    <div class="flex items-center gap-4">
      <div
        class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <UserIcon size={32} class="text-primary" />
      </div>
      <div class="flex-1">
        <h2 class="text-lg font-semibold text-foreground">
          {authStore.user?.name || "Pengguna Monger"}
        </h2>
        <p class="text-secondary text-sm">
          {authStore.user?.email || authStore.user?.phone || "Tidak ada email"}
        </p>
      </div>
    </div>
  </Card>

  <!-- Account Section -->
  <div>
    <h3 class="text-sm font-medium text-muted uppercase tracking-wide mb-3">
      Akun
    </h3>
    <Card class="divide-y divide-border">
      <button
        class="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors text-left"
      >
        <div>
          <p class="font-medium text-foreground">Nama</p>
          <p class="text-sm text-secondary">{authStore.user?.name || "-"}</p>
        </div>
      </button>
      <button
        class="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors text-left"
      >
        <div>
          <p class="font-medium text-foreground">Email</p>
          <p class="text-sm text-secondary">{authStore.user?.email || "-"}</p>
        </div>
      </button>
      <button
        class="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors text-left"
      >
        <div>
          <p class="font-medium text-foreground">Telepon</p>
          <p class="text-sm text-secondary">{authStore.user?.phone || "-"}</p>
        </div>
      </button>
    </Card>
  </div>

  <!-- Logout Button -->
  <div class="pt-4">
    <Button
      variant="outline"
      size="lg"
      fullWidth
      onclick={handleLogout}
      class="text-red-500 border-red-200 hover:bg-red-50"
    >
      <LogOutIcon size={20} class="mr-2" />
      Keluar dari Akun
    </Button>
  </div>
</div>
