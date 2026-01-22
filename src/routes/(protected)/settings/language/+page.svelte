<script lang="ts">
  import { goto } from "$app/navigation";

  // Redirect to account settings where language is now located
  goto("/account?view=settings", { replaceState: true });
</script>

<svelte:head>
  <title>Bahasa - Monger</title>
</svelte:head>

<div class="container mx-auto space-y-6 pb-24 md:pb-6">
  <div class="text-center py-12">
    <p class="text-secondary">Mengarahkan ke Pengaturan...</p>
  </div>
</div>
