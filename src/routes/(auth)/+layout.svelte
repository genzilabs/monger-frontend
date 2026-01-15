<script lang="ts">
  import { page } from "$app/stores";
  import { ChevronLeftIcon } from "$lib/icons";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  let { children } = $props();

  // Pages that should show back button
  const showBackButton = $derived(
    $page.url.pathname !== "/auth" && $page.url.pathname !== "/"
  );
</script>

<div class="min-h-screen bg-background flex">
  <!-- Desktop Left Panel - Primary Background (hidden on mobile) - EXACT 50% -->
  <div
    class="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden items-center justify-center"
  >
    <!-- Subtle Pattern Overlay -->
    <div class="absolute inset-0 opacity-10">
      <div
        class="absolute top-20 left-10 w-40 h-40 rounded-full bg-white/20"
      ></div>
      <div
        class="absolute bottom-32 right-20 w-60 h-60 rounded-full bg-white/10"
      ></div>
      <div
        class="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/15"
      ></div>
    </div>

    <!-- Motivational Copy -->
    <div
      class="relative z-10 flex flex-col items-center text-center px-12 max-w-md"
    >
      <h2 class="text-3xl font-bold text-white mb-4 leading-tight">
        Kebiasaan kecil<br />dimulai dari sini.
      </h2>
      <p class="text-white/80 text-lg">
        Catat, pahami, dan tumbuh bersama keuanganmu.
      </p>
    </div>
  </div>

  <!-- Right Panel - Auth Content - EXACT 50% on desktop, vertically centered -->
  <div class="w-full md:w-1/2 flex flex-col min-h-screen bg-background">
    <!-- Header - MOBILE ONLY -->
    <!-- Main Content - Vertically centered on all screens -->
    <main
      class="flex-1 flex flex-col px-6 justify-center items-center md:px-12"
    >
      <div class="w-full md:max-w-md">
        <!-- Logo at top of content (desktop only) -->
        <div class="hidden md:flex flex-col items-center mb-8">
          <img src={logoOnly} alt="Monger" class="w-16 h-16 mb-3" />
          <span class="text-xl font-semibold text-foreground">Monger</span>
        </div>
        {@render children()}
      </div>
    </main>
  </div>
</div>
