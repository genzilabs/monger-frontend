<script lang="ts">
  import { pinStore } from "$lib/stores/pin.svelte";
  import { authStore } from "$lib/stores";
  import { OTPInput, Button } from "$lib/components/ui";
  import { fade } from "svelte/transition";
  import { portal } from "$lib/actions/portal";

  let pin = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleUnlock(code: string) {
    loading = true;
    error = "";
    
    // Slight delay for better UX
    await new Promise(r => setTimeout(r, 300));

    const success = await pinStore.unlock(code);
    if (!success) {
      error = "PIN salah";
      pin = ""; // Reset input
    }
    loading = false;
  }

  // Only show if locked AND user is authenticated
  const show = $derived(pinStore.isLocked && authStore.isAuthenticated);
</script>

{#if show}
  <div
    use:portal
    in:fade={{ duration: 200 }}
    class="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center p-6"
  >
    <div class="w-full max-w-sm space-y-8 text-center">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-foreground">Masukkan PIN</h1>
        <p class="text-secondary">
          Buka kunci aplikasi untuk melanjutkan
        </p>
      </div>

      <div class="flex justify-center py-4">
        <OTPInput
          length={6}
          bind:value={pin}
          error={!!error}
          disabled={loading}
          onComplete={handleUnlock}
        />
      </div>

      {#if error}
        <p class="text-error font-medium animate-pulse">{error}</p>
      {/if}

      <div class="pt-8">
        <Button
          variant="ghost"
          class="text-secondary hover:text-foreground"
          onclick={() => authStore.logout()}
        >
          Keluar dari Akun
        </Button>
      </div>
    </div>
  </div>
{/if}
