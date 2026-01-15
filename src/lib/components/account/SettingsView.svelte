<script lang="ts">
  import { Button, Card } from "$lib/components/ui";
  import { authStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { LogOutIcon, ChevronLeftIcon } from "$lib/icons";

  async function handleLogout() {
    await authStore.logout();
    goto("/auth");
  }

  let { onBack } = $props<{ onBack: () => void }>();
</script>

<div class="space-y-6 animate-fade-in pt-2">
  <div class="flex items-center gap-3 mb-6">
    <h2 class="text-xl font-bold text-foreground">Pengaturan</h2>
  </div>

  <Card class="divide-y divide-border">
    <div class="p-4 flex items-center justify-between">
      <div>
        <p class="font-medium text-foreground">Bahasa</p>
        <p class="text-xs text-secondary">Bahasa Indonesia (Default)</p>
      </div>
      <div
        class="px-3 py-1 bg-surface-elevated rounded text-xs font-mono text-muted"
      >
        ID
      </div>
    </div>
    <div class="p-4 flex items-center justify-between">
      <div>
        <p class="font-medium text-foreground">Mata Uang</p>
        <p class="text-xs text-secondary">Rupiah Indonesia</p>
      </div>
      <div
        class="px-3 py-1 bg-surface-elevated rounded text-xs font-mono text-muted"
      >
        IDR
      </div>
    </div>
  </Card>
</div>
