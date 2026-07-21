import type { Soal, Operasi, Kesulitan } from '@/types/math';

// ============================================
// DATASET SOAL STATIS — FUN-MATH
// ============================================

// ----------------------------------------------------
// 1. Modul 1B (Hitung Sederhana)
// ----------------------------------------------------
export const MODUL1B_CONTOH: { 
  penjumlahan: { angka1: number; angka2: number }[]; 
  pengurangan: { angka1: number; angka2: number }[]; 
} = {
  penjumlahan: [
    { angka1: 32, angka2: 6 },
    { angka1: 25, angka2: 13 },
    { angka1: 28, angka2: 21 },
  ],
  pengurangan: [
    { angka1: 27, angka2: 4 },
    { angka1: 46, angka2: 24 },
    { angka1: 48, angka2: 16 },
  ]
};

// Soal Latihan Mandiri di akhir Penjelasan Modul 1B (agar anak ngisi soal juga)
export const MODUL1B_SOAL: Soal[] = [
  // Penjumlahan Sederhana
  { angka1: 24, angka2: 5, operasi: 'penjumlahan', kesulitan: 'mudah' },
  { angka1: 31, angka2: 12, operasi: 'penjumlahan', kesulitan: 'mudah' },
  { angka1: 15, angka2: 23, operasi: 'penjumlahan', kesulitan: 'mudah' },
  // Pengurangan Sederhana
  { angka1: 38, angka2: 6, operasi: 'pengurangan', kesulitan: 'mudah' },
  { angka1: 29, angka2: 14, operasi: 'pengurangan', kesulitan: 'mudah' },
  { angka1: 45, angka2: 23, operasi: 'pengurangan', kesulitan: 'mudah' },
];

// ----------------------------------------------------
// 2. Modul 2 (Penjumlahan Menyimpan)
// ----------------------------------------------------
export const MODUL2_CONTOH: Soal[] = [
  { angka1: 17, angka2: 6, operasi: 'penjumlahan', kesulitan: 'mudah' },
  { angka1: 23, angka2: 18, operasi: 'penjumlahan', kesulitan: 'sedang' },
  { angka1: 28, angka2: 17, operasi: 'penjumlahan', kesulitan: 'sulit' },
];

export const MODUL2_SOAL: Soal[] = [
  { angka1: 15, angka2: 7, operasi: 'penjumlahan', kesulitan: 'mudah' },
  { angka1: 18, angka2: 9, operasi: 'penjumlahan', kesulitan: 'mudah' },
  { angka1: 17, angka2: 16, operasi: 'penjumlahan', kesulitan: 'sedang' },
  { angka1: 26, angka2: 18, operasi: 'penjumlahan', kesulitan: 'sedang' },
  { angka1: 29, angka2: 19, operasi: 'penjumlahan', kesulitan: 'sulit' },
];

// ----------------------------------------------------
// 3. Modul 3 (Pengurangan Meminjam)
// ----------------------------------------------------
export const MODUL3_CONTOH: Soal[] = [
  { angka1: 12, angka2: 5, operasi: 'pengurangan', kesulitan: 'mudah' },
  { angka1: 24, angka2: 16, operasi: 'pengurangan', kesulitan: 'sedang' },
  { angka1: 47, angka2: 28, operasi: 'pengurangan', kesulitan: 'sulit' },
];

export const MODUL3_SOAL: Soal[] = [
  { angka1: 17, angka2: 8, operasi: 'pengurangan', kesulitan: 'mudah' },
  { angka1: 22, angka2: 9, operasi: 'pengurangan', kesulitan: 'mudah' },
  { angka1: 41, angka2: 15, operasi: 'pengurangan', kesulitan: 'sedang' },
  { angka1: 43, angka2: 27, operasi: 'pengurangan', kesulitan: 'sedang' },
  { angka1: 48, angka2: 19, operasi: 'pengurangan', kesulitan: 'sulit' },
];

// ----------------------------------------------------
// 4. Modul 4 (Latihan Campuran Peta Belajar)
// ----------------------------------------------------
export const MODUL4_SOAL: Soal[] = [
  { angka1: 15, angka2: 8, operasi: 'penjumlahan', kesulitan: 'mudah' },
  { angka1: 21, angka2: 5, operasi: 'pengurangan', kesulitan: 'mudah' },
  { angka1: 18, angka2: 7, operasi: 'pengurangan', kesulitan: 'mudah' },
  { angka1: 34, angka2: 16, operasi: 'pengurangan', kesulitan: 'sedang' },
  { angka1: 17, angka2: 16, operasi: 'penjumlahan', kesulitan: 'sedang' },
  { angka1: 42, angka2: 15, operasi: 'pengurangan', kesulitan: 'sedang' },
  { angka1: 26, angka2: 18, operasi: 'penjumlahan', kesulitan: 'sedang' },
  { angka1: 47, angka2: 28, operasi: 'pengurangan', kesulitan: 'sulit' },
  { angka1: 29, angka2: 19, operasi: 'penjumlahan', kesulitan: 'sulit' },
  { angka1: 48, angka2: 19, operasi: 'pengurangan', kesulitan: 'sulit' },
  { angka1: 34, angka2: 12, operasi: 'pengurangan', kesulitan: 'mudah' },
  { angka1: 34, angka2: 14, operasi: 'penjumlahan', kesulitan: 'mudah' },
  { angka1: 46, angka2: 23, operasi: 'pengurangan', kesulitan: 'mudah' },
  { angka1: 44, angka2: 25, operasi: 'penjumlahan', kesulitan: 'mudah' },
  { angka1: 53, angka2: 32, operasi: 'pengurangan', kesulitan: 'mudah' },
  { angka1: 63, angka2: 21, operasi: 'penjumlahan', kesulitan: 'mudah' },
];

// ----------------------------------------------------
// 5. Latihan Mandiri (Non Peta Belajar)
// ----------------------------------------------------
export const LATIHAN_MANDIRI_SOAL: Record<Operasi, Record<Kesulitan, Soal[]>> = {
  penjumlahan: {
    mudah: [
      { angka1: 15, angka2: 7, operasi: 'penjumlahan', kesulitan: 'mudah' },
      { angka1: 16, angka2: 8, operasi: 'penjumlahan', kesulitan: 'mudah' },
      { angka1: 17, angka2: 6, operasi: 'penjumlahan', kesulitan: 'mudah' },
      { angka1: 18, angka2: 5, operasi: 'penjumlahan', kesulitan: 'mudah' },
      { angka1: 25, angka2: 7, operasi: 'penjumlahan', kesulitan: 'mudah' },
    ],
    sedang: [
      { angka1: 17, angka2: 16, operasi: 'penjumlahan', kesulitan: 'sedang' },
      { angka1: 18, angka2: 15, operasi: 'penjumlahan', kesulitan: 'sedang' },
      { angka1: 24, angka2: 19, operasi: 'penjumlahan', kesulitan: 'sedang' },
      { angka1: 26, angka2: 18, operasi: 'penjumlahan', kesulitan: 'sedang' },
      { angka1: 27, angka2: 15, operasi: 'penjumlahan', kesulitan: 'sedang' },
    ],
    sulit: [
      { angka1: 28, angka2: 17, operasi: 'penjumlahan', kesulitan: 'sulit' },
      { angka1: 29, angka2: 18, operasi: 'penjumlahan', kesulitan: 'sulit' },
      { angka1: 35, angka2: 16, operasi: 'penjumlahan', kesulitan: 'sulit' },
      { angka1: 36, angka2: 15, operasi: 'penjumlahan', kesulitan: 'sulit' },
      { angka1: 37, angka2: 14, operasi: 'penjumlahan', kesulitan: 'sulit' },
    ],
  },
  pengurangan: {
    mudah: [
      { angka1: 21, angka2: 5, operasi: 'pengurangan', kesulitan: 'mudah' },
      { angka1: 32, angka2: 8, operasi: 'pengurangan', kesulitan: 'mudah' },
      { angka1: 41, angka2: 6, operasi: 'pengurangan', kesulitan: 'mudah' },
      { angka1: 30, angka2: 4, operasi: 'pengurangan', kesulitan: 'mudah' },
      { angka1: 22, angka2: 7, operasi: 'pengurangan', kesulitan: 'mudah' },
    ],
    sedang: [
      { angka1: 24, angka2: 16, operasi: 'pengurangan', kesulitan: 'sedang' },
      { angka1: 35, angka2: 18, operasi: 'pengurangan', kesulitan: 'sedang' },
      { angka1: 42, angka2: 15, operasi: 'pengurangan', kesulitan: 'sedang' },
      { angka1: 43, angka2: 27, operasi: 'pengurangan', kesulitan: 'sedang' },
      { angka1: 31, angka2: 14, operasi: 'pengurangan', kesulitan: 'sedang' },
    ],
    sulit: [
      { angka1: 50, angka2: 23, operasi: 'pengurangan', kesulitan: 'sulit' },
      { angka1: 48, angka2: 19, operasi: 'pengurangan', kesulitan: 'sulit' },
      { angka1: 47, angka2: 28, operasi: 'pengurangan', kesulitan: 'sulit' },
      { angka1: 49, angka2: 17, operasi: 'pengurangan', kesulitan: 'sulit' },
      { angka1: 46, angka2: 29, operasi: 'pengurangan', kesulitan: 'sulit' },
    ],
  },
  perkalian: {
    mudah: [],
    sedang: [],
    sulit: [],
  }
};
