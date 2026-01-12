<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  let { children } = $props();
  let isAuthorized = $state(false);

  onMount(() => {
    if (browser) {
      // Onboarding should only be shown to authenticated users
      const accessToken = localStorage.getItem("monger_access_token");
      if (!accessToken) {
        // Not authenticated - redirect to auth
        goto("/auth");
        return;
      }

      // Check if already completed onboarding
      const hasCompletedOnboarding = localStorage.getItem(
        "hasCompletedOnboarding"
      );
      if (hasCompletedOnboarding) {
        // Already completed - go to dashboard
        goto("/dashboard");
        return;
      }

      isAuthorized = true;
    }
  });
</script>

{#if isAuthorized}
  <!-- Solid primary background for onboarding -->
  <div class="min-h-screen bg-primary md:flex">
    <!-- Left Panel - Supporting Info (Desktop Only) -->
    <div
      class="hidden md:flex md:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
    >
      <!-- Subtle Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div
          class="absolute top-20 left-10 w-40 h-40 rounded-full bg-white/20"
        ></div>
        <div
          class="absolute bottom-40 right-10 w-60 h-60 rounded-full bg-white/15"
        ></div>
      </div>

      <!-- Branding -->
      <div class="relative z-10">
        <h1 class="text-2xl font-bold text-white mb-2">Monger</h1>
        <p class="text-white/70">Bantu kamu lebih kenal uangmu.</p>
      </div>

      <!-- Feature List -->
      <div class="relative z-10 space-y-6">
        <div class="flex items-start gap-4">
          <div
            class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-white">Buku & Kantong</h3>
            <p class="text-sm text-white/70">
              Organisir keuanganmu dengan struktur yang rapi.
            </p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div
            class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-white">Berbagi Kantong</h3>
            <p class="text-sm text-white/70">
              Lacak keuangan bersama teman atau keluarga.
            </p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div
            class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-white">Catat Cepat</h3>
            <p class="text-sm text-white/70">
              Input transaksi dengan mudah dan cepat.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="relative z-10">
        <p class="text-xs text-white/50">by Genzi Meraih Mimpi</p>
      </div>
    </div>

    <!-- Right Panel - Main Content (white background for contrast) -->
    <div
      class="flex-1 md:w-1/2 flex flex-col min-h-screen bg-background md:rounded-l-3xl"
    >
      {@render children()}
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-primary flex-center">
    <div class="animate-pulse text-center">
      <div class="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl"></div>
      <p class="text-white/70">Memuat...</p>
    </div>
  </div>
{/if}
