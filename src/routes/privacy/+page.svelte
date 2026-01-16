<script lang="ts">
  import { goto } from "$app/navigation";
  import { ChevronLeftIcon } from "$lib/icons";
</script>

<svelte:head>
  <title>Kebijakan Privasi - Monger</title>
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
      <h1 class="text-lg font-bold text-foreground">Kebijakan Privasi</h1>
    </div>
  </header>

  <!-- Content -->
  <main class="max-w-2xl mx-auto px-6 py-8 space-y-8">
    <p class="text-secondary text-sm">Terakhir diperbarui: Januari 2026</p>

    <!-- Intro -->
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-foreground">
        Privasi kamu penting bagi kami
      </h2>
      <p class="text-secondary leading-relaxed">
        Di Monger, kami menghargai kepercayaan yang kamu berikan saat
        menggunakan layanan kami. Kebijakan ini menjelaskan bagaimana kami
        mengelola data pribadimu.
      </p>
    </section>

    <!-- Data We Collect -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">
        Data yang Kami Kumpulkan
      </h2>
      <p class="text-secondary leading-relaxed">
        Untuk memberikan layanan terbaik, kami mengumpulkan data berikut:
      </p>
      <ul
        class="text-secondary leading-relaxed space-y-2 list-disc list-inside"
      >
        <li>
          <strong>Informasi profil:</strong> nama, email, dan foto profil (jika kamu
          unggah)
        </li>
        <li>
          <strong>Data keuangan:</strong> catatan transaksi, kategori, kantong, dan
          buku yang kamu buat
        </li>
        <li>
          <strong>Preferensi:</strong> pengaturan bahasa, mata uang, dan tampilan
          aplikasi
        </li>
        <li>
          <strong>Data teknis:</strong> jenis perangkat dan versi aplikasi untuk
          keperluan dukungan teknis
        </li>
      </ul>
    </section>

    <!-- Purpose -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">
        Tujuan Penggunaan Data
      </h2>
      <p class="text-secondary leading-relaxed">
        Kami menggunakan datamu untuk:
      </p>
      <ul
        class="text-secondary leading-relaxed space-y-2 list-disc list-inside"
      >
        <li>Menyediakan layanan pencatatan keuangan yang kamu gunakan</li>
        <li>Menampilkan ringkasan dan laporan keuanganmu</li>
        <li>Mengirimkan notifikasi penting terkait akunmu</li>
        <li>Meningkatkan kualitas layanan Monger</li>
      </ul>
    </section>

    <!-- Data Storage -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">
        Penyimpanan dan Keamanan Data
      </h2>
      <p class="text-secondary leading-relaxed">
        Data kamu disimpan dengan aman menggunakan enkripsi standar industri.
        Kami berusaha melindungi datamu dari akses tidak sah, namun tidak ada
        sistem yang 100% aman. Kami akan segera memberitahumu jika terjadi
        insiden keamanan yang memengaruhi datamu.
      </p>
    </section>

    <!-- No Selling -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">
        Kami Tidak Menjual Datamu
      </h2>
      <p class="text-secondary leading-relaxed">
        Data pribadimu tidak akan dijual, disewakan, atau diberikan kepada pihak
        ketiga untuk tujuan komersial. Data keuanganmu adalah milikmu, dan kami
        hanya menggunakannya untuk menyediakan layanan Monger.
      </p>
    </section>

    <!-- User Rights -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">Hak Kamu atas Data</h2>
      <p class="text-secondary leading-relaxed">Kamu memiliki hak untuk:</p>
      <ul
        class="text-secondary leading-relaxed space-y-2 list-disc list-inside"
      >
        <li>Mengakses dan mengunduh data yang kami simpan tentangmu</li>
        <li>Memperbarui atau memperbaiki data profilmu</li>
        <li>Menghapus akunmu beserta semua data terkait</li>
        <li>Menanyakan bagaimana datamu digunakan</li>
      </ul>
    </section>

    <!-- Policy Updates -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">Pembaruan Kebijakan</h2>
      <p class="text-secondary leading-relaxed">
        Kebijakan privasi ini dapat kami perbarui dari waktu ke waktu. Perubahan
        signifikan akan kami informasikan melalui email atau notifikasi di
        aplikasi. Tanggal pembaruan terakhir selalu tercantum di bagian atas
        halaman ini.
      </p>
    </section>

    <!-- Contact -->
    <section class="space-y-3">
      <h2 class="text-lg font-semibold text-foreground">Hubungi Kami</h2>
      <p class="text-secondary leading-relaxed">
        Jika ada pertanyaan tentang kebijakan privasi ini atau cara kami
        mengelola datamu, silakan hubungi tim Monger melalui fitur bantuan di
        dalam aplikasi.
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
