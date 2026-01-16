<script lang="ts">
  import { goto } from "$app/navigation";
  import { ChevronLeftIcon } from "$lib/icons";
</script>

<svelte:head>
  <title>Ketentuan Layanan - Monger</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header
    class="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-10"
  >
    <div class="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
      <button
        onclick={() => history.back()}
        class="p-2 -ml-2 hover:bg-surface rounded-lg transition-colors"
        aria-label="Kembali"
      >
        <ChevronLeftIcon size={20} class="text-foreground" />
      </button>
      <h1 class="text-lg font-bold text-foreground">Ketentuan Layanan</h1>
    </div>
  </header>

  <!-- Content -->
  <main class="max-w-2xl mx-auto px-6 py-8 space-y-8">
    <p class="text-secondary text-sm">Terakhir diperbarui: Januari 2026</p>

    <!-- Intro -->
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-foreground">
        Selamat datang di Monger
      </h2>
      <p class="text-secondary leading-relaxed">
        Monger adalah aplikasi pencatatan keuangan pribadi yang membantu kamu
        lebih kenal dengan uangmu. Dengan menggunakan Monger, kamu setuju dengan
        ketentuan berikut ini.
      </p>
    </section>

    <!-- User Responsibility -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">
        Tanggung Jawab Pengguna
      </h2>
      <div class="text-secondary leading-relaxed space-y-2">
        <p>
          Kamu bertanggung jawab penuh atas data keuangan yang kamu masukkan ke
          dalam Monger. Pastikan data yang kamu catat akurat dan sesuai dengan
          kondisi keuanganmu yang sebenarnya.
        </p>
        <p>
          Monger adalah alat bantu pencatatan, bukan pengganti penasihat
          keuangan profesional. Keputusan keuangan yang kamu ambil berdasarkan
          data di Monger tetap menjadi tanggung jawabmu.
        </p>
      </div>
    </section>

    <!-- Account Usage -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">Penggunaan Akun</h2>
      <ul
        class="text-secondary leading-relaxed space-y-2 list-disc list-inside"
      >
        <li>Satu akun Monger diperuntukkan bagi satu pengguna</li>
        <li>Jaga kerahasiaan kata sandi akunmu</li>
        <li>Jangan berbagi akses akun dengan orang lain tanpa persetujuan</li>
        <li>Laporkan jika kamu mencurigai ada akses tidak sah ke akunmu</li>
      </ul>
    </section>

    <!-- Data Accuracy -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">Akurasi Data</h2>
      <p class="text-secondary leading-relaxed">
        Monger menyimpan data sesuai dengan yang kamu masukkan. Kami tidak
        memverifikasi keakuratan data keuanganmu. Perhitungan saldo dan laporan
        dihasilkan berdasarkan data yang kamu input.
      </p>
    </section>

    <!-- Limitation of Liability -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">
        Batasan Tanggung Jawab
      </h2>
      <p class="text-secondary leading-relaxed">
        Monger disediakan "sebagaimana adanya". Kami berusaha menjaga layanan
        tetap berjalan dengan baik, namun tidak menjamin layanan akan selalu
        bebas dari gangguan atau kesalahan. Kami tidak bertanggung jawab atas
        kerugian yang timbul dari penggunaan atau ketidakmampuan menggunakan
        layanan Monger.
      </p>
    </section>

    <!-- Changes -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">Perubahan Ketentuan</h2>
      <p class="text-secondary leading-relaxed">
        Kami dapat memperbarui ketentuan ini dari waktu ke waktu. Perubahan
        signifikan akan kami informasikan melalui email atau notifikasi di dalam
        aplikasi. Dengan terus menggunakan Monger setelah perubahan, kamu
        dianggap menyetujui ketentuan yang baru.
      </p>
    </section>

    <!-- Contact -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">Hubungi Kami</h2>
      <p class="text-secondary leading-relaxed">
        Jika ada pertanyaan tentang ketentuan ini, silakan hubungi tim Monger
        melalui fitur bantuan di dalam aplikasi atau melalui halaman kontak
        kami.
      </p>
    </section>

    <!-- Footer Note -->
    <div class="pt-6 border-t border-border">
      <p class="text-xs text-muted text-center">
        Dokumen ini merupakan draf awal dan bukan dokumen hukum final.
      </p>
    </div>
  </main>
</div>
