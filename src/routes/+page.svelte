<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { LandingHeader, FaqAccordion } from "$lib/components/landing";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  // Icons
  import BookIcon from "$lib/icons/BookIcon.svelte";
  import TagIcon from "$lib/icons/TagIcon.svelte";
  import UserIcon from "$lib/icons/UserIcon.svelte";
  import ShieldIcon from "$lib/icons/ShieldIcon.svelte";

  onMount(() => {
    if (browser) {
      const action = $page.url.searchParams.get("action");
      if (action) return;

      const accessToken = localStorage.getItem("monger_access_token");
      if (accessToken) {
        // Logged in - go to dashboard
        goto("/dashboard");
      }
      // Otherwise, show the landing page
    }
  });

  // FAQ items
  const faqItems = [
    {
      question: "Apakah data saya aman?",
      answer:
        "Kami memperlakukan data keuanganmu seperti milik kami sendiri — dengan sangat hati-hati. Tidak ada penjualan data ke pihak ketiga, tidak ada iklan. Privasimu adalah prioritas.",
    },
    {
      question: "Benar-benar gratis selama Alpha?",
      answer:
        "Ya. Selama fase Alpha, semua fitur tersedia tanpa biaya. Ini cara kami berterima kasih kepada pengguna awal yang membantu membentuk Monger.",
    },
    {
      question: "Siapa yang cocok menggunakan Monger?",
      answer:
        "Monger cocok untuk siapa saja yang ingin lebih sadar tentang keuangan tanpa merasa dihakimi. Baik kamu baru mulai mencatat atau sudah punya kebiasaan, Monger menyesuaikan tempomu.",
    },
    {
      question: "Bagaimana cara memberi feedback?",
      answer:
        "Kamu bisa menghubungi kami langsung melalui aplikasi atau email. Setiap masukan sangat berarti — kamu adalah bagian dari proses pembuatan Monger.",
    },
    {
      question: "Apa yang terjadi setelah Alpha?",
      answer:
        "Kami berencana memperkenalkan model berlangganan yang terjangkau. Pengguna Alpha akan mendapat perlakuan khusus sebagai early supporter.",
    },
  ];

  // Capabilities - focused on outcomes
  const capabilities = [
    {
      icon: BookIcon,
      title: "Jurnal Harian",
      desc: "Catat pengeluaran seperti menulis jurnal. Simpel, tanpa form rumit.",
    },
    {
      icon: TagIcon,
      title: "Kategori Fleksibel",
      desc: "Atur sesuai caramu. Buat tag yang cocok dengan gaya hidupmu.",
    },
    {
      icon: UserIcon,
      title: "Mode Bersama",
      desc: "Rencanakan bareng pasangan tanpa gabung rekening.",
    },
    {
      icon: ShieldIcon,
      title: "Privasi Utama",
      desc: "Datamu milikmu. Tidak dijual, tidak untuk iklan.",
    },
  ];

  // How it works steps
  const steps = [
    {
      number: "01",
      title: "Catat Pelan-Pelan",
      desc: "Mulai dari satu transaksi. Tidak perlu lengkap, tidak perlu sempurna.",
    },
    {
      number: "02",
      title: "Kenali Polanya",
      desc: "Perlahan, kamu akan melihat ke mana uangmu mengalir.",
    },
    {
      number: "03",
      title: "Tarik Napas, Lanjutkan",
      desc: "Dengan kesadaran, keputusan jadi lebih tenang.",
    },
  ];
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
  <!-- 1. HERO SECTION -->
  <!-- ========================================= -->
  <section class="relative pt-28 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
    <!-- Subtle breathing background -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse"
      style="animation-duration: 4s;"
    ></div>
    <div
      class="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-primary/3 rounded-full blur-3xl pointer-events-none animate-pulse"
      style="animation-duration: 6s; animation-delay: 1s;"
    ></div>

    <div class="max-w-3xl mx-auto text-center relative z-10">
      <h1
        class="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-8 leading-[1.15]"
      >
        Lebih sadar tentang uang,<br />
        <span class="text-primary">tanpa tekanan</span>.
      </h1>

      <p
        class="text-lg md:text-xl text-secondary max-w-xl mx-auto mb-12 leading-relaxed"
      >
        Pendamping keuangan yang tenang dan manusiawi. Cukup untuk mulai.
        Fleksibel untuk berkembang bersamamu.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="/auth"
          class="h-12 px-8 rounded-xl bg-primary text-white text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center"
        >
          Gabung Alpha
        </a>
        <a
          href="#cara-kerja"
          class="h-12 px-8 rounded-xl bg-surface text-foreground border border-border text-base font-semibold hover:bg-border/50 transition-all duration-300 inline-flex items-center justify-center"
        >
          Lihat Cara Kerjanya
        </a>
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- 2. ALPHA LISTENING PHASE -->
  <!-- ========================================= -->
  <section id="alpha" class="px-6 py-16 md:py-20">
    <div class="max-w-3xl mx-auto">
      <div
        class="bg-surface border border-border rounded-2xl p-8 md:p-12 text-center shadow-sm"
      >
        <div
          class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5"
        >
          <svg
            class="w-6 h-6 text-primary"
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
        </div>
        <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Kami dalam tahap mendengarkan
        </h2>
        <p class="text-secondary text-lg mb-6 leading-relaxed max-w-lg mx-auto">
          Monger masih dalam fase Alpha. Artinya, kami membangun ini <strong
            class="text-foreground">bersamamu</strong
          >, bukan hanya untukmu. Setiap feedback membentuk arah perkembangan
          Monger.
        </p>
        <p class="text-muted text-sm">
          Pengguna Alpha adalah kolaborator, bukan hanya pengguna.
        </p>
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- 3. PROBLEM VS SOLUTION -->
  <!-- ========================================= -->
  <section id="filosofi" class="px-6 py-20 bg-surface">
    <div class="max-w-5xl mx-auto">
      <div class="mb-16 text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Kebisingan vs. Kesadaran
        </h2>
        <p class="text-secondary max-w-2xl mx-auto">
          Kebanyakan aplikasi keuangan hidup dari kecemasanmu. Kami percaya ada
          cara yang lebih tenang.
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
                class="w-5 h-5 text-error shrink-0 mt-0.5"
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
                  >Alert yang tidak perlu, mengganggu sepanjang hari.</span
                >
              </div>
            </li>
            <li class="flex gap-4 opacity-70">
              <svg
                class="w-5 h-5 text-error shrink-0 mt-0.5"
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
            <li class="flex gap-4 opacity-70">
              <svg
                class="w-5 h-5 text-error shrink-0 mt-0.5"
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
                <strong class="block text-foreground mb-1">Chart Rumit</strong>
                <span class="text-sm text-secondary"
                  >Data yang membingungkan, bukan mencerahkan.</span
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
                  >Tanpa Penghakiman</strong
                >
                <span class="text-sm text-secondary"
                  >Tidak ada label "boros" atau angka merah yang mengintimidasi.</span
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
                  >Kejelasan Sederhana</strong
                >
                <span class="text-sm text-secondary"
                  >Data yang mudah dibaca, tanpa perlu jadi analis.</span
                >
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- 4. SOCIAL PROOF -->
  <!-- ========================================= -->
  <section class="px-6 py-20">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
        Dibangun bersama pengguna awal
      </h2>
      <p class="text-secondary max-w-xl mx-auto mb-12">
        Bukan hanya untuk mereka, tapi dengan mereka.
      </p>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-surface border border-border rounded-xl p-6 text-left">
          <p class="text-secondary leading-relaxed mb-4 italic">
            "Akhirnya ada aplikasi keuangan yang tidak membuatku merasa bersalah
            setiap buka."
          </p>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm"
            >
              R
            </div>
            <div>
              <p class="text-foreground font-medium text-sm">Rina</p>
              <p class="text-muted text-xs">Alpha Tester</p>
            </div>
          </div>
        </div>

        <div class="bg-surface border border-border rounded-xl p-6 text-left">
          <p class="text-secondary leading-relaxed mb-4 italic">
            "Simpel banget. Aku cuma catat yang aku ingat, dan pelan-pelan jadi
            kebiasaan."
          </p>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm"
            >
              D
            </div>
            <div>
              <p class="text-foreground font-medium text-sm">Dimas</p>
              <p class="text-muted text-xs">Alpha Tester</p>
            </div>
          </div>
        </div>

        <div class="bg-surface border border-border rounded-xl p-6 text-left">
          <p class="text-secondary leading-relaxed mb-4 italic">
            "Mode bersama sangat membantu kami sebagai pasangan untuk lebih
            terbuka tentang uang."
          </p>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm"
            >
              A
            </div>
            <div>
              <p class="text-foreground font-medium text-sm">Ayu & Budi</p>
              <p class="text-muted text-xs">Alpha Testers</p>
            </div>
          </div>
        </div>
      </div>

      <p class="text-muted text-sm mt-10">
        Bagian dari ekosistem <a
          href="https://genzilabs.com"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline">Genzi Meraih Mimpi</a
        >
      </p>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- 5. CAPABILITIES -->
  <!-- ========================================= -->
  <section id="kemampuan" class="px-6 py-20 bg-surface">
    <div class="max-w-4xl mx-auto">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Fitur secukupnya
        </h2>
        <p class="text-secondary">
          Cukup untuk mulai. Fleksibel untuk berkembang bersamamu.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 gap-5">
        {#each capabilities as cap}
          <div
            class="bg-background p-6 rounded-xl border border-border hover:border-primary/50 transition-colors group"
          >
            <div
              class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform"
            >
              <cap.icon class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-foreground mb-2">
              {cap.title}
            </h3>
            <p class="text-sm text-secondary leading-relaxed">{cap.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- 6. HOW IT WORKS - 3 STEPS -->
  <!-- ========================================= -->
  <section id="cara-kerja" class="px-6 py-20">
    <div class="max-w-4xl mx-auto">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Cara kerjanya
        </h2>
        <p class="text-secondary">Tiga langkah sederhana. Tanpa tekanan.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        {#each steps as step, index}
          <div class="text-center md:text-left">
            <div
              class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-lg mb-5"
            >
              {step.number}
            </div>
            <h3 class="text-xl font-bold text-foreground mb-3">{step.title}</h3>
            <p class="text-secondary leading-relaxed">{step.desc}</p>
            {#if index < steps.length - 1}
              <div class="hidden md:block mt-6">
                <svg
                  class="w-6 h-6 text-muted mx-auto md:mx-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                  />
                </svg>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- 7. PRICING -->
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
          Alpha
        </div>
        <h3 class="text-xl font-bold text-foreground mb-2">Alpha Access</h3>
        <div class="text-4xl font-black text-primary mb-6">
          Rp0<span class="text-base font-normal text-secondary">/saat ini</span>
        </div>
        <p class="text-sm text-secondary mb-8">
          Selama fase Alpha, semua fitur tersedia tanpa biaya. Ini cara kami
          berterima kasih.
        </p>
        <ul class="text-left space-y-3 mb-8 max-w-xs mx-auto">
          {#each ["Akses ke semua fitur", "Feedback langsung ke tim", "Akses awal ke update"] as item}
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
          Mulai Sekarang
        </a>
      </div>
      <p class="mt-6 text-xs text-muted">
        Kami berencana memperkenalkan model berlangganan yang terjangkau nanti.
        Early supporter akan mendapat perlakuan khusus.
      </p>
    </div>
  </section>

  <!-- ========================================= -->
  <!-- 8. PHILOSOPHY / ABOUT -->
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
          merefleksikan pengeluaranmu, menemukan kejelasan tanpa kecemasan. Kami
          percaya ketika kamu menghilangkan kebisingan, kamu membuat keputusan
          yang lebih baik.
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
          Monger dibuat dengan penuh cinta oleh tim di Genzi Meraih Mimpi. Kami
          adalah kolektif kecil dari designer dan developer yang berdedikasi
          membangun software yang manusiawi — menghargai perhatianmu dan datamu.
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
  <!-- 9. FAQ -->
  <!-- ========================================= -->
  <section class="px-6 py-20 bg-surface">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Pertanyaan Umum
        </h2>
        <p class="text-secondary">Beberapa hal yang mungkin kamu ingin tahu.</p>
      </div>

      <FaqAccordion items={faqItems} />
    </div>
  </section>

  <!-- ========================================= -->
  <!-- 10. FOOTER -->
  <!-- ========================================= -->
  <footer class="bg-background border-t border-border pt-12 pb-8 px-6">
    <div
      class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8"
    >
      <div class="flex items-center gap-2">
        <img src={logoOnly} alt="Monger" class="w-6 h-6" />
        <span class="font-bold text-foreground">Monger</span>
        <span
          class="text-xs text-muted ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
          >Alpha</span
        >
      </div>
      <nav
        class="flex flex-wrap justify-center gap-8 text-sm font-medium text-secondary"
      >
        <a href="#filosofi" class="hover:text-primary transition-colors"
          >Filosofi</a
        >
        <a href="#cara-kerja" class="hover:text-primary transition-colors"
          >Cara Kerja</a
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
