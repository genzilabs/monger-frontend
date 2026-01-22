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
