<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { Button } from "$lib/components/ui";
  import { OnboardingSlide } from "$lib/components/onboarding";
  import { ChevronRightIcon } from "$lib/icons";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  let currentSlide = $state(0);

  const slides = [
    {
      id: "awareness",
      title: "Mulai dari yang kecil.",
      description:
        "Bukan soal nominal, tapi soal kenal. Sadar adalah langkah pertama untuk kendali.",
    },
    {
      id: "habit",
      title: "Sedikit demi sedikit.",
      description:
        "Catat pelan-pelan. Bangun kebiasaan baik tanpa rasa terbebani. Santai saja.",
    },
    {
      id: "mission",
      title: "Bagian dari perjalananmu.",
      description:
        "Teman seperjalanan dari Genzi Meraih Mimpi. Tumbuh perlahan, tapi pasti.",
    },
    {
      id: "start",
      title: "Siap melangkah?",
      description: "Perjalanan keuangan yang lebih tenang dimulai dari sini.",
    },
  ];

  function completeOnboarding() {
    if (browser) {
      localStorage.setItem("hasCompletedOnboarding", "true");
    }
    goto("/dashboard");
  }

  function nextSlide() {
    currentSlide < slides.length - 1 ? currentSlide++ : completeOnboarding();
  }
</script>

<svelte:head>
  <title>Selamat Datang di Monger</title>
</svelte:head>

<!-- Light background styling for onboarding content -->
<div
  class="min-h-screen flex flex-col px-6 py-8 md:px-12 md:py-12 md:justify-center relative bg-background"
>
  <!-- Skip Button -->
  {#if currentSlide < slides.length - 1}
    <button
      onclick={completeOnboarding}
      class="absolute top-6 right-6 md:top-8 md:right-8 text-muted hover:text-foreground transition-colors text-sm font-medium z-10"
    >
      Lewati
    </button>
  {/if}

  <!-- Main Content Area -->
  <div
    class="flex-1 flex flex-col justify-center md:max-w-xl md:mx-auto md:w-full"
  >
    {#each slides as slide, index}
      {#if index === currentSlide}
        <OnboardingSlide title={slide.title} description={slide.description}>
          {#if slide.id === "awareness"}
            <!-- Screen 1: Simple Illustration -->
            <div class="flex flex-col items-center justify-center gap-6">
              <img src={logoOnly} alt="Monger" class="w-16 h-16 opacity-20" />
              <div
                class="w-32 h-32 bg-surface rounded-full flex items-center justify-center border border-border/50 relative"
              >
                <svg
                  class="w-12 h-12 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <!-- Decor dots -->
                <div
                  class="absolute top-0 right-0 w-3 h-3 bg-primary/20 rounded-full"
                ></div>
                <div
                  class="absolute bottom-2 left-2 w-2 h-2 bg-secondary/20 rounded-full"
                ></div>
              </div>
            </div>
          {:else if slide.id === "habit"}
            <!-- Screen 2: Calendar/Check Illustration -->
            <div class="flex flex-col items-center justify-center gap-6">
              <div class="relative">
                <div
                  class="w-24 h-24 bg-surface border border-border rounded-2xl flex items-center justify-center rotate-3"
                >
                  <svg
                    class="w-10 h-10 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div
                  class="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-background"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          {:else if slide.id === "mission"}
            <!-- Screen 3: Genzi/Growth Illustration -->
            <div class="flex flex-col items-center justify-center gap-6">
              <div class="w-40 h-40 relative">
                <!-- Path -->
                <svg
                  class="absolute inset-0 w-full h-full text-border"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <path
                    d="M10 80 Q 30 70, 50 50 T 90 20"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-dasharray="4 4"
                  />
                </svg>
                <!-- Logo climbing -->
                <div
                  class="absolute top-1/4 right-0 transform -translate-y-1/2"
                >
                  <img src={logoOnly} alt="Monger" class="w-12 h-12" />
                </div>
              </div>
            </div>
          {:else}
            <!-- Start Screen -->
            <div class="flex flex-col items-center justify-center gap-8 py-8">
              <img src={logoOnly} alt="Monger" class="w-24 h-24" />
              <div class="space-y-2 text-center">
                <p
                  class="text-sm font-medium text-primary uppercase tracking-widest"
                >
                  Monger
                </p>
              </div>
            </div>
          {/if}
        </OnboardingSlide>
      {/if}
    {/each}
  </div>

  <!-- Progress Dots (Hidden on final slide) -->
  {#if currentSlide < slides.length - 1}
    <div class="flex justify-center gap-2 mb-6 md:mt-8">
      {#each slides.slice(0, slides.length - 1) as _, index}
        <button
          onclick={() => (currentSlide = index)}
          class="w-2 h-2 rounded-full transition-all duration-300 {index ===
          currentSlide
            ? 'bg-primary w-6'
            : 'bg-border'}"
          aria-label="Ke slide {index + 1}"
        ></button>
      {/each}
    </div>
  {/if}

  <!-- CTA Button -->
  <div class="md:max-w-md md:mx-auto md:w-full">
    <Button variant="primary" size="lg" fullWidth onclick={nextSlide}>
      {#if currentSlide === slides.length - 1}
        Mulai Perjalananmu
      {:else}
        Lanjut
        <ChevronRightIcon class="w-5 h-5 ml-1" size={20} />
      {/if}
    </Button>
  </div>
</div>
