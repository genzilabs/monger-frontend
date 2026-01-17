<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  // Check if user is on landing page or needs redirect
  onMount(() => {
    if (browser) {
      // If there's an action parameter (like from auth flows), don't redirect
      const action = $page.url.searchParams.get("action");
      if (action) return;

      // Check if user is authenticated
      const accessToken = localStorage.getItem("monger_access_token");
      if (accessToken) {
        // User is logged in - redirect to dashboard or onboarding
        const hasCompletedOnboarding = localStorage.getItem(
          "hasCompletedOnboarding"
        );
        if (!hasCompletedOnboarding) {
          goto("/welcome");
        } else {
          goto("/dashboard");
        }
      }
      // Not authenticated - stay on landing page (no redirect)
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

<!-- Landing Page -->
<div class="w-full min-h-screen bg-background">
  <!-- Header -->
  <header class="w-full border-b border-border/50">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <a
        href="/"
        class="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <img src={logoOnly} alt="Monger" class="w-9 h-9" />
        <span class="font-bold text-xl text-foreground">Monger</span>
      </a>

      <nav class="flex items-center gap-6">
        <a
          href="#tentang"
          class="text-sm font-medium text-secondary hover:text-foreground transition-colors hidden sm:block"
        >
          Tentang
        </a>
        <a
          href="#harga"
          class="text-sm font-medium text-secondary hover:text-foreground transition-colors hidden sm:block"
        >
          Harga
        </a>
        <a
          href="/auth"
          class="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors"
        >
          Gabung Alpha
        </a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="py-20 md:py-32">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h1
        class="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight mb-6"
      >
        Kelola uang dengan lebih tenang, bersama atau sendiri.
      </h1>
      <p
        class="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
      >
        Catat keuanganmu tanpa tekanan. Monger membantu kamu lebih sadar tentang
        uang tanpa menghakimi.
      </p>
      <div class="flex flex-col items-center gap-4">
        <a
          href="/auth"
          class="px-8 py-4 bg-primary text-white text-base font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-button"
        >
          Gabung Alpha Access
        </a>
        <p class="text-sm text-muted">Akses terbatas. Segera hadir.</p>
      </div>
    </div>
  </section>

  <!-- Alpha Collaboration Section -->
  <section id="tentang" class="py-16 md:py-24 bg-surface">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
        Dibangun bersamamu, bukan hanya untukmu
      </h2>
      <p class="text-secondary leading-relaxed mb-6">
        Monger masih dalam tahap alpha. Kami membangun ini bersama pengguna
        nyata — menguji, memperbaiki, dan membentuk produk bersama-sama.
        Masukanmu bukan sekadar diterima; itu penting.
      </p>
      <a
        href="/auth"
        class="text-primary font-semibold hover:underline underline-offset-4"
      >
        Daftar sebagai Alpha Tester →
      </a>
    </div>
  </section>

  <!-- Philosophy Section -->
  <section class="py-16 md:py-24">
    <div class="max-w-5xl mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-12 md:gap-16">
        <!-- The Noise -->
        <div>
          <h3 class="text-xl md:text-2xl font-bold text-foreground mb-4">
            Yang Biasa Terjadi
          </h3>
          <div class="space-y-4 text-secondary leading-relaxed">
            <p>
              Aplikasi keuangan seringkali terasa berat. Ada yang menyuruhmu
              berhemat, memberi tips, atau menilai keputusanmu.
            </p>
            <p>
              Kalau keuangan bareng pasangan atau teman? Lebih rumit lagi.
              Bicara soal uang sering jadi canggung.
            </p>
            <p>
              Hasilnya? Cemas, menghindari, dan aplikasi yang akhirnya cuma jadi
              pajangan.
            </p>
          </div>
        </div>

        <!-- The Monger Way -->
        <div>
          <h3 class="text-xl md:text-2xl font-bold text-foreground mb-4">
            Cara Monger
          </h3>
          <div class="space-y-4 text-secondary leading-relaxed">
            <p>
              Kami tidak sok tahu tentang hidupmu. Kami cuma bantu kamu melihat
              lebih jelas.
            </p>
            <p>
              Pencatatan sederhana. Ruang terpisah untuk hal berbeda. Catatan
              yang bisa dibagi atau disimpan sendiri. Tanpa penilaian, tanpa
              tekanan.
            </p>
            <p>Cuma kesadaran — dan mungkin sedikit ketenangan pikiran.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Feature Highlights -->
  <section class="py-16 md:py-24 bg-surface">
    <div class="max-w-5xl mx-auto px-6">
      <h2
        class="text-2xl md:text-3xl font-bold text-foreground text-center mb-12"
      >
        Alat sederhana untuk pencatatan yang bermakna
      </h2>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Daily Tracking -->
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
          >
            <svg
              class="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-foreground mb-1">Catat Harian</h4>
            <p class="text-sm text-secondary">
              Catat yang penting, kapan pun kamu mau. Tidak perlu anggaran
              rumit.
            </p>
          </div>
        </div>

        <!-- Custom Control -->
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
          >
            <svg
              class="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-foreground mb-1">Sesuai Caramu</h4>
            <p class="text-sm text-secondary">
              Kategori dan alur yang cocok dengan hidupmu, bukan sebaliknya.
            </p>
          </div>
        </div>

        <!-- Separate Spaces -->
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
          >
            <svg
              class="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-foreground mb-1">Ruang Terpisah</h4>
            <p class="text-sm text-secondary">
              Kantong dan buku menjaga area keuanganmu tetap rapi.
            </p>
          </div>
        </div>

        <!-- Shared Access -->
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
          >
            <svg
              class="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-foreground mb-1">Akses Bersama</h4>
            <p class="text-sm text-secondary">
              Undang keluarga atau teman. Catat bersama dengan transparan.
            </p>
          </div>
        </div>

        <!-- Data Freedom -->
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
          >
            <svg
              class="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-foreground mb-1">Data Milikmu</h4>
            <p class="text-sm text-secondary">
              Datamu ya datamu. Ekspor kapan saja, tanpa ribet.
            </p>
          </div>
        </div>

        <!-- Simple Insights -->
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
          >
            <svg
              class="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-foreground mb-1">
              Ringkasan Sederhana
            </h4>
            <p class="text-sm text-secondary">
              Lihat pola tanpa digurui. Cuma fakta.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Product Preview -->
  <section class="py-16 md:py-24">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
        Semua yang kamu butuhkan dalam satu pandangan
      </h2>
      <p class="text-secondary mb-10 max-w-2xl mx-auto">
        Dashboard yang menampilkan yang penting tanpa kebisingan. Bersih, fokus,
        dan dibuat untuk kejelasan.
      </p>

      <!-- Preview Placeholder -->
      <div class="bg-surface border border-border rounded-3xl p-8 md:p-12">
        <div
          class="bg-background rounded-2xl border border-border p-6 md:p-8 shadow-sm"
        >
          <div class="flex items-center gap-4 mb-6">
            <div class="w-10 h-10 rounded-full bg-primary/20"></div>
            <div class="space-y-1">
              <div class="h-3 w-24 bg-border rounded"></div>
              <div class="h-2 w-16 bg-border/50 rounded"></div>
            </div>
          </div>
          <div class="h-8 w-48 bg-primary/10 rounded-xl mb-6"></div>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="h-20 bg-surface rounded-xl border border-border"></div>
            <div class="h-20 bg-surface rounded-xl border border-border"></div>
          </div>
          <div class="space-y-3">
            <div class="h-12 bg-surface rounded-xl border border-border"></div>
            <div class="h-12 bg-surface rounded-xl border border-border"></div>
            <div class="h-12 bg-surface rounded-xl border border-border"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="harga" class="py-16 md:py-24 bg-surface">
    <div class="max-w-2xl mx-auto px-6 text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
        Gratis selama Alpha
      </h2>
      <p class="text-secondary mb-10">
        Tanpa kartu kredit. Tanpa komitmen. Cuma akses awal untuk membantu
        membentuk produk.
      </p>

      <div class="bg-background border border-border rounded-2xl p-8 text-left">
        <div class="flex items-baseline gap-2 mb-6">
          <span class="text-4xl font-bold text-foreground">Rp0</span>
          <span class="text-muted">/bulan</span>
        </div>

        <ul class="space-y-4 mb-8">
          <li class="flex items-start gap-3">
            <svg
              class="w-5 h-5 text-primary mt-0.5 shrink-0"
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
            <span class="text-secondary">Pencatatan keuangan lengkap</span>
          </li>
          <li class="flex items-start gap-3">
            <svg
              class="w-5 h-5 text-primary mt-0.5 shrink-0"
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
            <span class="text-secondary">Buku bersama dan kolaborasi</span>
          </li>
          <li class="flex items-start gap-3">
            <svg
              class="w-5 h-5 text-primary mt-0.5 shrink-0"
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
            <span class="text-secondary">Akses awal ke fitur baru</span>
          </li>
          <li class="flex items-start gap-3">
            <svg
              class="w-5 h-5 text-primary mt-0.5 shrink-0"
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
            <span class="text-secondary">Jalur langsung ke tim</span>
          </li>
        </ul>

        <a
          href="/auth"
          class="block w-full py-3.5 bg-primary text-white text-center font-semibold rounded-xl hover:bg-primary-hover transition-colors"
        >
          Gabung Alpha Access
        </a>
      </div>
    </div>
  </section>

  <!-- Closing Statement -->
  <section class="py-16 md:py-24">
    <div class="max-w-2xl mx-auto px-6 text-center">
      <p class="text-xl md:text-2xl text-foreground leading-relaxed mb-4">
        Monger hadir untuk membantu kamu sedikit lebih sadar, sedikit lebih
        jujur, dan sedikit lebih nyaman dengan uangmu.
      </p>
      <p class="text-secondary italic">Kemajuan pelan tetap kemajuan.</p>
    </div>
  </section>

  <!-- Genzi Attribution -->
  <section class="py-12 border-t border-border">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <p class="text-sm text-muted mb-2">
        Bagian dari ekosistem <span class="text-secondary font-medium"
          >Genzi Meraih Mimpi</span
        >
      </p>
      <p class="text-xs text-muted leading-relaxed max-w-md mx-auto">
        Studio produk yang membangun dari pengalaman nyata. Kami tumbuh dengan
        mendengarkan.
      </p>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 border-t border-border bg-surface">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <img src={logoOnly} alt="Monger" class="w-7 h-7" />
          <span class="text-sm font-semibold text-foreground">Monger</span>
        </div>

        <nav class="flex items-center gap-6 text-sm text-secondary">
          <a href="#tentang" class="hover:text-foreground transition-colors"
            >Tentang</a
          >
          <a href="/privacy" class="hover:text-foreground transition-colors"
            >Privasi</a
          >
          <a href="/terms" class="hover:text-foreground transition-colors"
            >Ketentuan</a
          >
        </nav>

        <p class="text-xs text-muted">© 2026 Monger. Hak cipta dilindungi.</p>
      </div>
    </div>
  </footer>
</div>
