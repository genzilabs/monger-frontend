<script lang="ts">
  import { Button, Divider, SocialButtons } from "$lib/components/ui";
  import { goto } from "$app/navigation";
</script>

<svelte:head>
  <title>Mulai dengan Monger</title>
</svelte:head>

<div class="flex-1 flex flex-col animate-fade-in">
  <!-- Hero Section -->
  <div
    class="flex-1 flex flex-col items-center justify-center text-center px-4 py-8"
  >
    <!-- Chart Bars Illustration -->
    <!-- <div class="relative mb-8">
      <div class="w-48 h-64 relative">
        <div
          class="absolute bottom-0 left-0 w-8 h-32 bg-gradient-to-t from-primary/30 to-primary rounded-t-lg"
        ></div>
        <div
          class="absolute bottom-0 left-12 w-8 h-48 bg-gradient-to-t from-primary-400/30 to-primary-400 rounded-t-lg"
        ></div>
        <div
          class="absolute bottom-0 left-24 w-8 h-56 bg-gradient-to-t from-primary-600/30 to-primary-600 rounded-t-lg"
        ></div>
        <div
          class="absolute bottom-0 right-0 w-8 h-40 bg-gradient-to-t from-primary/20 to-primary/60 rounded-t-lg"
        ></div>
      </div>
    </div> -->

    <h1 class="text-3xl font-bold text-foreground mb-4 leading-tight">
      Lebih Kenal<br />
      <span class="text-gradient">Uangmu.</span>
    </h1>

    <p class="text-secondary max-w-sm mb-8">
      Catat keuanganmu dengan Buku dan Kantong. Pelan-pelan, jadi kebiasaan.
    </p>
  </div>

  <!-- CTAs -->
  <div class="space-y-3 mb-6">
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
  <div class="space-y-4">
    <Divider text="atau lanjutkan dengan" />
    <SocialButtons />
  </div>

  <p class="text-center text-xs text-muted mt-6">
    Dengan melanjutkan, kamu setuju dengan
    <a href="/terms" class="text-primary hover:underline">Ketentuan Layanan</a>
    &
    <a href="/privacy" class="text-primary hover:underline">Kebijakan Privasi</a
    >.
  </p>
</div>
