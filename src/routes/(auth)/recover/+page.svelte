<script lang="ts">
  import { Button, Input, Card, IconBox } from "$lib/components/ui";
  import { authApi } from "$lib/api";
  import { toastStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { isValidIdentifier } from "$lib/utils/validation";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  let identifier = $state("");
  let isLoading = $state(false);
  let error = $state("");

  async function handleSubmit() {
    if (!identifier.trim()) {
      error = "Masukkan email atau nomor teleponmu";
      return;
    }

    if (!isValidIdentifier(identifier)) {
      error = "Format belum sesuai. Coba cek lagi ya.";
      return;
    }

    isLoading = true;
    error = "";

    try {
      const result = await authApi.sendOTP(identifier);

      if (result.error) {
        error = result.error.error;
        return;
      }

      const params = new URLSearchParams({
        identifier,
        cooldown: String(result.data?.cooldown_seconds || 60),
        recover: "true",
      });

      toastStore.success("Kode pemulihan dikirim!");
      goto(`/verify?${params.toString()}`);
    } catch {
      error = "Ada kendala. Coba lagi sebentar ya.";
      toastStore.error(error);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Pulihkan Akun - Monger</title>
</svelte:head>

<div class="w-full animate-fade-in flex flex-col items-center">
  <!-- Logo (Mobile) -->
  <img src={logoOnly} alt="Monger" class="w-16 h-16 mb-6 md:hidden" />

  <h1 class="text-2xl font-bold text-foreground mb-2 text-center">
    Kita bantu masuk lagi.
  </h1>

  <p class="text-secondary text-center mb-8 max-w-xs">
    Masukkan email atau nomor telepon yang terdaftar di Monger untuk menerima
    kode pemulihan.
  </p>

  <div class="w-full mb-6">
    <Input
      type="text"
      placeholder="Email atau Nomor Telepon"
      bind:value={identifier}
      {error}
    >
      {#snippet icon()}
        <svg
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      {/snippet}
    </Input>
  </div>

  <Button
    variant="primary"
    size="lg"
    fullWidth
    loading={isLoading}
    onclick={handleSubmit}
  >
    Kirim Kode
    <svg
      class="w-5 h-5 ml-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  </Button>

  <button
    class="mt-6 flex items-center justify-center gap-2 py-3 text-muted hover:text-secondary transition-colors w-full"
    onclick={() => goto("/login")}
  >
    <svg
      class="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
    <span class="text-sm">Kembali ke Masuk</span>
  </button>
</div>
