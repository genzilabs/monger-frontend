<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { LandingHeader } from "$lib/components/landing";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  onMount(() => {
    if (browser) {
      const action = $page.url.searchParams.get("action");
      if (action) return;

      const accessToken = localStorage.getItem("monger_access_token");
      if (accessToken) {
        const hasCompletedOnboarding = localStorage.getItem(
          "hasCompletedOnboarding",
        );
        goto(hasCompletedOnboarding ? "/dashboard" : "/welcome");
      }
    }
  });
</script>

<svelte:head>
  <title>Monger - Kelola Keuangan dengan Tenang</title>
  <meta
    name="description"
    content="Monger membantu kamu lebih sadar tentang uang tanpa menghakimi. Catat keuangan pribadi atau bersama dengan cara yang lebih manusiawi."
  />
</svelte:head>

<div class="w-full min-h-screen bg-background">
  <!-- Header -->
  <LandingHeader />

  <!-- ========================================= -->
  <!-- HERO SECTION -->
  <!-- ========================================= -->
  <section class="relative pt-24 pb-16 md:pt-36 md:pb-24 px-6 overflow-hidden">
    <!-- Background blur -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none"
    ></div>

    <div class="max-w-4xl mx-auto text-center relative z-10">
      <div
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6"
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Private Alpha
      </div>

      <h1
        class="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]"
      >
        Catat uang,<br />tanpa <span class="text-primary">tekanan</span>.
      </h1>

      <p
        class="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
      >
        Pendekatan yang tenang dan manusiawi untuk keuangan pribadi. Tanpa rasa
        bersalah, tanpa notifikasi mengganggu. Cuma kejelasan dan ketenangan.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="/auth"
          class="h-12 px-8 rounded-xl bg-primary text-white text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center"
        >
          Gabung Alpha Access
        </a>
        <a
          href="#filosofi"
          class="h-12 px-8 rounded-xl bg-surface text-foreground border border-border text-base font-semibold hover:bg-border/50 transition-all duration-300 inline-flex items-center justify-center"
        >
          Pelajari Filosofi
        </a>
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- DASHBOARD PREVIEW -->
  <!-- ========================================= -->
  <section class="px-6 pb-20 md:pb-32">
    <div class="max-w-4xl mx-auto">
      <div
        class="relative bg-surface rounded-2xl p-3 md:p-4 shadow-lg border border-border"
      >
        <div
          class="rounded-xl overflow-hidden bg-background aspect-[16/10] relative"
        >
          <!-- Placeholder dashboard -->
          <div class="absolute inset-0 p-6 md:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-full bg-primary/20"></div>
              <div class="space-y-1">
                <div class="h-3 w-24 bg-border rounded"></div>
                <div class="h-2 w-16 bg-border/50 rounded"></div>
              </div>
            </div>
            <div class="h-10 w-40 bg-primary/10 rounded-xl mb-6"></div>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="h-24 bg-border/30 rounded-xl"></div>
              <div class="h-24 bg-border/30 rounded-xl"></div>
            </div>
            <div class="space-y-3">
              <div class="h-14 bg-border/20 rounded-xl"></div>
              <div class="h-14 bg-border/20 rounded-xl"></div>
            </div>
          </div>
          <!-- Preview overlay -->
          <div
            class="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          >
            <div
              class="bg-surface p-8 rounded-2xl shadow-xl border border-border text-center max-w-sm"
            >
              <svg
                class="w-10 h-10 text-primary mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
              <h3 class="text-lg font-bold text-foreground mb-2">
                Preview Privat
              </h3>
              <p class="text-sm text-secondary">
                Interface kami sedang disempurnakan oleh alpha tester. Gabung
                untuk melihat langsung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- ALPHA LISTENING PHASE -->
  <!-- ========================================= -->
  <section class="px-6 py-16">
    <div class="max-w-3xl mx-auto">
      <div
        class="bg-surface border border-border rounded-2xl p-8 md:p-12 text-center shadow-sm"
      >
        <svg
          class="w-10 h-10 text-primary mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
          />
        </svg>
        <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Kami dalam tahap mendengarkan
        </h2>
        <p class="text-secondary text-lg mb-8 leading-relaxed">
          Kami membangun Monger bersamamu, bukan hanya untukmu. Saat ini kami
          menerima sekelompok kecil pengguna yang ingin membantu membentuk masa
          depan keuangan yang lebih tenang.
        </p>
        <a
          href="/auth"
          class="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-colors"
        >
          Daftar sebagai Alpha Tester
        </a>
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- PROBLEM VS SOLUTION -->
  <!-- ========================================= -->
  <section id="filosofi" class="px-6 py-20 bg-surface">
    <div class="max-w-5xl mx-auto">
      <div class="mb-16 text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Kebisingan vs. Kesadaran
        </h2>
        <p class="text-secondary max-w-2xl mx-auto">
          Aplikasi keuangan biasa hidup dari kecemasanmu. Kami hidup dari
          ketenanganmu.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8 md:gap-12">
        <!-- The Noise -->
        <div class="p-8 rounded-2xl bg-background border border-border">
          <div class="flex items-center gap-3 mb-6 opacity-60">
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            <h3 class="text-sm font-bold uppercase tracking-wider">
              Cara Lama
            </h3>
          </div>
          <ul class="space-y-5">
            <li class="flex gap-4 opacity-70">
              <svg
                class="w-5 h-5 text-danger shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <div>
                <strong class="block text-foreground mb-1"
                  >Notifikasi Terus-menerus</strong
                >
                <span class="text-sm text-secondary"
                  >Alert yang tidak perlu mengganggu sepanjang hari.</span
                >
              </div>
            </li>
            <li class="flex gap-4 opacity-70">
              <svg
                class="w-5 h-5 text-danger shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <div>
                <strong class="block text-foreground mb-1"
                  >Upselling & Iklan</strong
                >
                <span class="text-sm text-secondary"
                  >Penawaran kartu kredit disamarkan sebagai "rekomendasi".</span
                >
              </div>
            </li>
            <li class="flex gap-4 opacity-70">
              <svg
                class="w-5 h-5 text-danger shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <div>
                <strong class="block text-foreground mb-1"
                  >Desain Berbasis Rasa Bersalah</strong
                >
                <span class="text-sm text-secondary"
                  >Angka merah dan peringatan karena beli kopi.</span
                >
              </div>
            </li>
          </ul>
        </div>

        <!-- The Intent -->
        <div
          class="p-8 rounded-2xl bg-primary/5 border border-primary/20 relative overflow-hidden"
        >
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
          ></div>
          <div class="flex items-center gap-3 mb-6 text-primary">
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
            <h3 class="text-sm font-bold uppercase tracking-wider">
              Cara Monger
            </h3>
          </div>
          <ul class="space-y-5 relative z-10">
            <li class="flex gap-4">
              <svg
                class="w-5 h-5 text-primary shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <strong class="block text-foreground mb-1"
                  >Tenang Secara Default</strong
                >
                <span class="text-sm text-secondary"
                  >Kamu cek keuangan saat siap, bukan saat kami ganggu.</span
                >
              </div>
            </li>
            <li class="flex gap-4">
              <svg
                class="w-5 h-5 text-primary shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <strong class="block text-foreground mb-1"
                  >Selaras dengan Nilai</strong
                >
                <span class="text-sm text-secondary"
                  >Alat yang membantu kamu spending untuk hal yang benar-benar
                  penting.</span
                >
              </div>
            </li>
            <li class="flex gap-4">
              <svg
                class="w-5 h-5 text-primary shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <strong class="block text-foreground mb-1"
                  >Kejelasan Total</strong
                >
                <span class="text-sm text-secondary"
                  >Data sederhana dan mudah dibaca tanpa chart rumit.</span
                >
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- CAPABILITIES -->
  <!-- ========================================= -->
  <section class="px-6 py-20">
    <div class="max-w-5xl mx-auto">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Fitur secukupnya
        </h2>
        <p class="text-secondary">
          Semua yang kamu butuhkan untuk memahami uangmu, tanpa yang tidak
          perlu.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each [{ icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", title: "Jurnal Harian", desc: "Perlakukan pengeluaran seperti jurnal. Entry simpel tanpa form rumit." }, { icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", title: "Kategori Fleksibel", desc: "Atur spending sesuai caramu. Buat tag yang cocok dengan gaya hidupmu." }, { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", title: "Mode Bersama", desc: "Rencanakan bareng pasangan tanpa gabung rekening. Shared visibility, maintained privacy." }, { icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12", title: "Ekspor Data", desc: "Datamu milikmu. Ekspor ke CSV atau JSON kapanpun kamu mau." }, { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Privasi Utama", desc: "Kami tidak jual datamu ke pengiklan. Kehidupan finansialmu tetap privat." }, { icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", title: "Tanpa Kebisingan", desc: "Tanpa iklan, tanpa badge, tanpa distraksi. Cuma interface bersih untuk pikiran jernih." }] as feature}
          <div
            class="bg-surface p-6 rounded-xl border border-border hover:border-primary/50 transition-colors group"
          >
            <div
              class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d={feature.icon}
                />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-foreground mb-2">
              {feature.title}
            </h3>
            <p class="text-sm text-secondary leading-relaxed">{feature.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- PRICING -->
  <!-- ========================================= -->
  <section class="px-6 py-20 bg-surface border-t border-border">
    <div class="max-w-lg mx-auto text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-8">Harga</h2>
      <div
        class="p-8 rounded-2xl border-2 border-primary/20 bg-primary/5 relative"
      >
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
        >
          Terbatas
        </div>
        <h3 class="text-xl font-bold text-foreground mb-2">Alpha Access</h3>
        <div class="text-4xl font-black text-primary mb-6">
          Rp0<span class="text-base font-normal text-secondary">/selamanya</span
          >
        </div>
        <p class="text-sm text-secondary mb-8">
          Gabung selama fase alpha dan dapatkan akses seumur hidup ke fitur inti
          secara gratis.
        </p>
        <ul class="text-left space-y-3 mb-8 max-w-xs mx-auto">
          {#each ["Akses penuh ke semua fitur", "Jalur langsung ke founder", "Akses awal ke mobile app"] as item}
            <li class="flex items-center gap-3 text-sm text-foreground">
              <svg
                class="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {item}
            </li>
          {/each}
        </ul>
        <a
          href="/auth"
          class="block w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-colors flex items-center justify-center"
        >
          Klaim Akun Gratis
        </a>
      </div>
      <p class="mt-6 text-xs text-muted">
        Kami berencana memperkenalkan model langganan yang berkelanjutan nanti.
        Early supporter akan di-grandfather in.
      </p>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- PHILOSOPHY / ABOUT -->
  <!-- ========================================= -->
  <section class="px-6 py-24">
    <div class="max-w-2xl mx-auto space-y-16">
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-foreground">Tentang Monger</h2>
        <p class="text-lg text-secondary leading-loose">
          Uang itu emosional. Tapi kebanyakan tools memperlakukannya murni
          matematis. Mereka membanjiri kita dengan chart, membuat kita merasa
          bersalah dengan angka merah, dan berteriak dengan notifikasi.
        </p>
        <p class="text-lg text-secondary leading-loose">
          Kami membangun Monger sebagai penangkalnya. Tempat tenang untuk
          merefleksikan pengeluaranmu, menyelaraskan uang dengan nilai-nilaimu,
          dan menemukan kejelasan tanpa kecemasan. Kami percaya ketika kamu
          menghilangkan kebisingan, kamu membuat keputusan yang lebih baik.
        </p>
      </div>

      <div class="pt-8 border-t border-border">
        <div class="flex items-center gap-3 mb-4">
          <svg
            class="w-5 h-5 text-primary"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="none" />
          </svg>
          <h3 class="text-lg font-bold text-foreground">Genzi Meraih Mimpi</h3>
        </div>
        <p class="text-secondary leading-relaxed mb-6">
          Proyek ini dibuat dengan penuh cinta oleh tim di Genzi Meraih Mimpi.
          Kami adalah kolektif kecil dari designer dan developer yang
          berdedikasi membangun software yang manusiawi, menghargai perhatianmu
          dan datamu.
        </p>
        <a
          href="https://genzilabs.com"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline underline-offset-4"
        >
          Kunjungi genzilabs.com
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- FOOTER -->
  <!-- ========================================= -->
  <footer class="bg-surface border-t border-border pt-12 pb-8 px-6">
    <div
      class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8"
    >
      <div class="flex items-center gap-2">
        <img src={logoOnly} alt="Monger" class="w-6 h-6" />
        <span class="font-bold text-foreground">Monger</span>
      </div>
      <nav
        class="flex flex-wrap justify-center gap-8 text-sm font-medium text-secondary"
      >
        <a href="#filosofi" class="hover:text-primary transition-colors"
          >Filosofi</a
        >
        <a href="/privacy" class="hover:text-primary transition-colors"
          >Privasi</a
        >
        <a href="/terms" class="hover:text-primary transition-colors"
          >Ketentuan</a
        >
      </nav>
      <div class="text-xs text-muted">
        © 2026 Monger. Dibuat oleh <a
          href="https://genzilabs.com"
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-primary">Genzi Meraih Mimpi</a
        >.
      </div>
    </div>
  </footer>
</div>
