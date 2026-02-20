/**
 * Application Updates / Release Notes
 * 
 * Add new updates at the TOP of the array (newest first).
 * Each update should have a unique version string.
 */

export interface UpdateChange {
  text: string;
}

export interface Update {
  version: string;
  date: string; // Format: YYYY-MM-DD
  title: string;
  description: string;
  changes: UpdateChange[];
}

export const UPDATES: Update[] = [
  {
    version: "0.7.0-alpha",
    date: "2026-02-16",
    title: "Goals & Anggaran",
    description: "Sekarang kamu bisa menetapkan target keuangan dan mengatur batas pengeluaran per kategori setiap bulan.",
    changes: [
      { text: "Buat goal tabungan dengan target nominal dan deadline" },
      { text: "Hubungkan goal ke pocket agar progress otomatis terupdate" },
      { text: "Catat kontribusi manual ke goal" },
      { text: "Atur anggaran bulanan per kategori pengeluaran" },
      { text: "Lihat progress pengeluaran dan peringatan jika melebihi batas" },
      { text: "Akses Goals dan Anggaran dari menu Pengelolaan" },
    ],
  },
  {
    version: "0.6.0-alpha",
    date: "2026-02-08",
    title: "Menu Baru dan Perbaikan Bug",
    description: "Kami menambahkan fitur berbagi aplikasi, halaman Tentang, dan memperbaiki bug penting pada tampilan transaksi.",
    changes: [
      { text: "Bagikan Monger ke teman dengan satu ketukan" },
      { text: "Halaman 'Tentang Monger' dengan info versi dan misi" },
      { text: "Perbaikan: Transaksi terkini di dashboard sekarang muncul dengan benar" },
      { text: "Perbaikan: Daftar transaksi langsung refresh setelah input baru" },
      { text: "Tampilan menu berbagi diselaraskan dengan gaya lainnya" },
    ],
  },
  {
    version: "0.5.0-alpha",
    date: "2026-02-08",
    title: "Keamanan dan Perbaikan Dashboard",
    description: "Kami meningkatkan keamanan PIN Lock dan memperbaiki tampilan transaksi di dashboard agar lebih akurat.",
    changes: [
      { text: "PIN Lock tidak lagi menampilkan konten sebelum kunci aktif" },
      { text: "Transfer pending hanya menampilkan yang berstatus menunggu" },
      { text: "Undangan kolaborasi menampilkan foto pengirim" },
      { text: "Transaksi terkini sekarang muncul dengan benar sesuai zona waktu" },
    ],
  },
  {
    version: "0.4.0-alpha",
    date: "2026-01-29",
    title: "Tampilan Lebih Tenang",
    description: "Kami menyederhanakan tampilan ringkasan periode dan memperbaiki filter transaksi agar lebih mudah digunakan.",
    changes: [
      { text: "Ringkasan periode lebih ringan dan mudah dibaca" },
      { text: "Pemilih tanggal baru yang lebih rapi" },
      { text: "Filter transaksi tampil lengkap di layar kecil" },
      { text: "Indikator perubahan hanya muncul saat signifikan" },
    ],
  },
  {
    version: "0.3.0-alpha",
    date: "2026-01-22",
    title: "Perbaikan UI dan Fitur Baru",
    description: "Kami menambahkan fitur feedback dan merapikan tampilan transaksi agar lebih nyaman digunakan.",
    changes: [
      { text: "Beri masukan langsung dari menu" },
      { text: "Input nominal dengan pemisah ribuan" },
      { text: "Tampilan transaksi lebih konsisten" },
      { text: "Pengaturan bahasa dipindah ke Akun" },
      { text: "Halaman transaksi rutin lebih rapi" },
    ],
  },
  {
    version: "0.2.0-alpha",
    date: "2026-01-21",
    title: "Privasi dan Tampilan Lebih Baik",
    description: "Kamu sekarang bisa menyembunyikan nominal di dashboard. Kami juga merapikan tampilan agar lebih nyaman digunakan.",
    changes: [
      { text: "Sembunyikan atau tampilkan nominal dengan satu ketukan" },
      { text: "Privasi berlaku di seluruh halaman keuangan" },
      { text: "Tampilan transaksi lebih rapi untuk nama panjang" },
      { text: "Navigasi halaman menu lebih konsisten" },
    ],
  },
  {
    version: "0.1.0-alpha",
    date: "2026-01-21",
    title: "Versi Awal Alpha",
    description: "Monger hadir dalam versi awal. Kami masih terus memperbaiki dan mendengarkan masukanmu.",
    changes: [
      { text: "Catat transaksi harian dengan Buku dan Kantong" },
      { text: "Lihat ringkasan keuangan di Dashboard" },
      { text: "Atur kategori sesuai kebutuhan" },
      { text: "Transaksi rutin untuk pengeluaran tetap" },
    ],
  },
];

/**
 * Get the latest update version string
 */
export function getLatestVersion(): string {
  return UPDATES.length > 0 ? UPDATES[0].version : "0.0.0";
}

/**
 * Get the latest update object
 */
export function getLatestUpdate(): Update | null {
  return UPDATES.length > 0 ? UPDATES[0] : null;
}
