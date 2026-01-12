<script lang="ts">
  import { Button } from "$lib/components/ui";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  function goHome() {
    if (browser) {
      const accessToken = localStorage.getItem("monger_access_token");
      if (accessToken) {
        goto("/dashboard");
      } else {
        goto("/auth");
      }
    }
  }
</script>

<svelte:head>
  <title>Halaman Tidak Ditemukan - Monger</title>
</svelte:head>

<div class="min-h-screen bg-background flex items-center justify-center px-6">
  <div class="max-w-md w-full text-center">
    <!-- Visual Indicator -->
    <div
      class="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center"
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
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
        />
      </svg>
    </div>

    <!-- Content -->
    <h1 class="text-2xl font-bold text-foreground mb-3">
      Halaman tidak ditemukan
    </h1>

    <p class="text-secondary mb-8 leading-relaxed">
      Sepertinya halaman yang kamu cari sudah tidak ada atau alamatnya berubah.
      Tenang, kamu bisa kembali dan lanjutkan dari sana.
    </p>

    <!-- CTA -->
    <Button variant="primary" size="lg" onclick={goHome}>
      <svg
        class="w-5 h-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
      Kembali ke Beranda
    </Button>

    <!-- Error Code (subtle) -->
    <p class="mt-8 text-sm text-muted">Kode: 404</p>
  </div>
</div>
