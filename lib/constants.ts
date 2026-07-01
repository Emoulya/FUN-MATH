// ============================================
// Konstanta Global — FUN-MATH
// ============================================
// Tidak boleh ada magic number. Semua angka penting didefinisikan di sini.

import type { Operasi, Kesulitan, ModulId, ModulProgress, ModulInfo } from '@/types/math';

/** Jumlah percobaan salah sebelum jawaban diungkap */
export const MAX_PERCOBAAN = 3;

/** Delay animasi per langkah (ms) */
export const DELAY_ANIMASI_MS = 600;

/** Jumlah kolom digit maksimum yang didukung (2-3 digit) */
// TODO: konfirmasi client — saat ini mendukung 2-3 digit
export const KOLOM_MAKS = 3;

/** Digit minimum soal */
export const DIGIT_MIN = 2;

/** Digit maksimum soal */
export const DIGIT_MAKS = 3;

/** Daftar operasi yang didukung */
export const OPERASI_LIST: readonly Operasi[] = [
  'penjumlahan',
  'pengurangan',
  'perkalian',
] as const;

/** Daftar tingkat kesulitan */
export const KESULITAN_LIST: readonly Kesulitan[] = [
  'mudah',
  'sedang',
  'sulit',
] as const;

/** Label operasi untuk tampilan UI (Bahasa Indonesia) */
export const OPERASI_LABEL: Record<Operasi, string> = {
  penjumlahan: 'Penjumlahan',
  pengurangan: 'Pengurangan',
  perkalian: 'Perkalian',
};

/** Simbol operasi matematika */
export const OPERASI_SIMBOL: Record<Operasi, string> = {
  penjumlahan: '+',
  pengurangan: '−',
  perkalian: '×',
};

/** Warna tema per operasi */
export const OPERASI_WARNA: Record<Operasi, { bg: string; text: string; accent: string }> = {
  penjumlahan: { bg: 'bg-blue-50', text: 'text-blue-700', accent: 'border-blue-400' },
  pengurangan: { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: 'border-emerald-400' },
  perkalian: { bg: 'bg-violet-50', text: 'text-violet-700', accent: 'border-violet-400' },
};

/** Label kesulitan untuk tampilan UI */
export const KESULITAN_LABEL: Record<Kesulitan, string> = {
  mudah: 'Mudah',
  sedang: 'Sedang',
  sulit: 'Sulit',
};

/** Emoji reward berdasarkan persentase skor */
export const REWARD_EMOJI: { min: number; emoji: string; pesan: string }[] = [
  { min: 90, emoji: '🌟', pesan: 'Luar Biasa!' },
  { min: 70, emoji: '⭐', pesan: 'Hebat!' },
  { min: 50, emoji: '👍', pesan: 'Bagus!' },
  { min: 0, emoji: '💪', pesan: 'Ayo Coba Lagi!' },
];

/** Durasi default timer per soal (detik) — 0 berarti tanpa batas */
// TODO: konfirmasi client — timer diaktifkan
export const TIMER_DEFAULT_DETIK = 120;

/** Jumlah soal per sesi latihan */
export const SOAL_PER_SESI = 5;

// ============================================
// Konstanta — Sistem Modul Pembelajaran
// ============================================

/** Jumlah soal latihan campuran (Modul 4: 5 penjumlahan + 5 pengurangan) */
export const SOAL_LATIHAN_CAMPURAN = 10;

/** Jumlah minimal soal game nilai tempat (Modul 1A) */
export const MIN_SOAL_GAME = 3;

/** Key sessionStorage untuk progress modul */
export const STORAGE_KEY_MODUL_PROGRESS = 'modulProgress';

/** Key sessionStorage untuk asal modul (digunakan halaman rekap) */
export const STORAGE_KEY_FROM_MODUL = 'fromModul';

/** Urutan unlock modul (dependency chain) */
export const MODUL_UNLOCK_ORDER: ModulId[] = [
  'modul1a',
  'modul1b',
  'modul2',
  'modul3',
  'modul4',
];

/** Progress modul default — Modul 1A selalu unlocked pertama kali */
export const DEFAULT_MODUL_PROGRESS: ModulProgress = {
  modul1a: 'unlocked',
  modul1b: 'locked',
  modul2: 'locked',
  modul3: 'locked',
  modul4: 'locked',
};

/** Metadata semua modul untuk rendering peta modul */
export const MODUL_LIST: ModulInfo[] = [
  {
    id: 'modul1a',
    judul: 'Nilai Tempat',
    deskripsi: 'Kenali satuan dan puluhan',
    ikon: 'Blocks',
    warna: 'blue',
    href: '/modul/1a-nilai-tempat',
  },
  {
    id: 'modul1b',
    judul: 'Hitung Sederhana',
    deskripsi: 'Tambah & kurang tanpa simpan',
    ikon: 'Calculator',
    warna: 'teal',
    href: '/modul/1b-hitung-sederhana',
  },
  {
    id: 'modul2',
    judul: 'Penjumlahan Menyimpan',
    deskripsi: 'Belajar carry (simpanan)',
    ikon: 'Plus',
    warna: 'indigo',
    href: '/modul/2-penjumlahan',
  },
  {
    id: 'modul3',
    judul: 'Pengurangan Meminjam',
    deskripsi: 'Belajar borrow (pinjaman)',
    ikon: 'Minus',
    warna: 'emerald',
    href: '/modul/3-pengurangan',
  },
  {
    id: 'modul4',
    judul: 'Latihan Campuran',
    deskripsi: 'Kombinasi tambah & kurang',
    ikon: 'Shuffle',
    warna: 'violet',
    href: '/modul/4-latihan-campuran',
  },
];
