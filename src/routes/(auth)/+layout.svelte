<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  let { children } = $props();

  // Pages that should show back button
  const showBackButton = $derived(
    $page.url.pathname !== "/auth" && $page.url.pathname !== "/",
  );

  const carouselItems = [
    {
      title: "Fokus pada yang penting.",
      desc: "Satu tempat tenang untuk melihat gambaran besar keuanganmu.",
      icon: `<svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`, // Bolt/Energy/Focus
    },
    {
      title: "Mulai dari hal kecil.",
      desc: "Mencatat bukan beban, tapi langkah awal untuk ketenangan pikiran.",
      icon: `<svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`, // Book/Journal
    },
    {
      title: "Sederhana itu cukup.",
      desc: "Tanpa fitur rumit yang membingungkan. Hanya yang kamu butuhkan.",
      icon: `<svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>`, // Star/Sparkle
    },
  ];

  let currentIndex = $state(0);

  onMount(() => {
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % carouselItems.length;
    }, 15000);

    return () => clearInterval(interval);
  });
</script>

<div class="min-h-screen bg-background flex">
  <!-- Desktop Left Panel - Calm Visual Accent (hidden on mobile) -->
  <div
    class="hidden md:flex md:w-5/12 bg-surface-50 relative overflow-hidden items-center justify-center border-r border-border/40"
  >
    <!-- Rotating Content -->
    {#key currentIndex}
      <div
        class="absolute inset-0 m-auto h-fit z-10 flex flex-col items-center text-center px-12 max-w-md"
        in:fade={{ duration: 800 }}
      >
        <div
          class="w-16 h-16 mb-8 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          {@html carouselItems[currentIndex].icon}
        </div>

        <h2 class="text-2xl font-semibold text-foreground mb-4 leading-tight">
          {carouselItems[currentIndex].title}
        </h2>
        <p class="text-secondary text-base leading-relaxed">
          {carouselItems[currentIndex].desc}
        </p>
      </div>
    {/key}

    <!-- Progress Dots (Optional, purely visual anchor) -->
    <div class="absolute bottom-12 flex gap-2">
      {#each carouselItems as _, i}
        <div
          class="w-1.5 h-1.5 rounded-full transition-all duration-500 {i ===
          currentIndex
            ? 'bg-primary w-4'
            : 'bg-border'}"
        ></div>
      {/each}
    </div>
  </div>

  <!-- Right Panel - Auth Content - Balance on desktop, vertically centered -->
  <div class="w-full md:w-7/12 flex flex-col min-h-screen bg-background">
    <!-- Main Content - Vertically centered on all screens -->
    <main
      class="flex-1 flex flex-col px-6 justify-center items-center md:px-16 lg:px-24"
    >
      <div class="w-full md:max-w-md">
        <!-- Logo at top of content (desktop only) -->
        <div class="hidden md:flex flex-col items-center mb-10">
          <img src={logoOnly} alt="Monger" class="w-12 h-12 mb-4 opacity-90" />
        </div>
        {@render children()}
      </div>
    </main>
  </div>
</div>
