<script lang="ts">
  import { Button, Divider, SocialButtons } from "$lib/components/ui";
  import { goto } from "$app/navigation";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";
</script>

<svelte:head>
  <title>Mulai dengan Monger</title>
</svelte:head>

<div class="w-full animate-fade-in flex flex-col items-center">
  <!-- Logo (Mobile) -->
  <img src={logoOnly} alt="Monger" class="w-16 h-16 mb-6 md:hidden" />

  <!-- Hero Section -->
  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-foreground mb-4 leading-tight">
      Lebih Kenal<br />
      <span class="text-gradient">Uangmu.</span>
    </h1>

    <p class="text-secondary max-w-sm mx-auto">
      Catat keuanganmu dengan Buku dan Kantong. Pelan-pelan, jadi kebiasaan.
    </p>
  </div>

  <!-- CTAs -->
  <div class="w-full space-y-3 mb-6">
    <Button
      variant="primary"
      size="lg"
      fullWidth
      onclick={() => goto("/register")}
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
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      {/snippet}
      Mulai Sekarang
    </Button>

    <Button
      variant="secondary"
      size="lg"
      fullWidth
      onclick={() => goto("/login")}
    >
      Sudah punya akun
    </Button>
  </div>

  <!-- Social Login -->
  <!-- <div class="w-full space-y-4">
    <Divider text="atau lanjutkan dengan" />
    <SocialButtons />
  </div> -->

  <p class="text-center text-xs text-muted mt-6">
    Dengan melanjutkan, kamu setuju dengan
    <a href="/terms" class="text-primary hover:underline">Ketentuan Layanan</a>
    &
    <a href="/privacy" class="text-primary hover:underline">Kebijakan Privasi</a
    >.
  </p>

  <!-- Version Label -->
  <p class="text-center text-[10px] text-muted mt-8 tracking-widest opacity-60">
    Monger<br /> Versi: Alpha<br /> By Genzi Meraih Mimpi
  </p>
</div>
