// ============================================
// Generator Soal — Berdasarkan Dataset Statis & Acak
// ============================================
// Menghasilkan soal untuk Latihan Mandiri dari dataset statis LATIHAN_MANDIRI_SOAL.
// Khusus perkalian atau fallback, menggunakan generator acak bersyarat.

import type { Operasi, Kesulitan, Soal } from '@/types/math';
import { LATIHAN_MANDIRI_SOAL } from './dataset-soal';

// ============================================
// Range Angka per Kesulitan (Fallback)
// ============================================

interface RangeAngka {
  min: number;
  max: number;
}

const RANGE_PER_KESULITAN: Record<Kesulitan, { angka1: RangeAngka; angka2: RangeAngka }> = {
  mudah: {
    angka1: { min: 11, max: 19 },
    angka2: { min: 2, max: 9 },
  },
  sedang: {
    angka1: { min: 15, max: 30 },
    angka2: { min: 10, max: 20 },
  },
  sulit: {
    angka1: { min: 20, max: 50 },
    angka2: { min: 15, max: 35 },
  },
};

const RANGE_PERKALIAN: Record<Kesulitan, { angka1: RangeAngka; angka2: RangeAngka }> = {
  mudah: {
    angka1: { min: 10, max: 15 },
    angka2: { min: 2, max: 3 },
  },
  sedang: {
    angka1: { min: 10, max: 15 },
    angka2: { min: 2, max: 4 },
  },
  sulit: {
    angka1: { min: 10, max: 15 },
    angka2: { min: 2, max: 4 },
  },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// Generator Soal
// ============================================

/**
 * Generate satu soal. Mengutamakan mengambil dari dataset statis LATIHAN_MANDIRI_SOAL.
 */
export function generateSoal(operasi: Operasi, kesulitan: Kesulitan): Soal {
  // Ambil dari dataset statis LATIHAN_MANDIRI_SOAL jika tersedia
  const customList = LATIHAN_MANDIRI_SOAL[operasi]?.[kesulitan];
  if (customList && customList.length > 0) {
    const idx = Math.floor(Math.random() * customList.length);
    return { ...customList[idx] };
  }

  // Fallback acak untuk perkalian
  if (operasi === 'perkalian') {
    const range = RANGE_PERKALIAN[kesulitan];
    const angka1 = randomInt(range.angka1.min, range.angka1.max);
    const angka2 = randomInt(range.angka2.min, range.angka2.max);
    return { angka1, angka2, operasi, kesulitan };
  }

  const range = RANGE_PER_KESULITAN[kesulitan];
  let angka1 = randomInt(range.angka1.min, range.angka1.max);
  let angka2 = randomInt(range.angka2.min, range.angka2.max);

  if (operasi === 'penjumlahan') {
    while (angka1 + angka2 > 50) {
      angka1 = randomInt(range.angka1.min, range.angka1.max);
      angka2 = randomInt(range.angka2.min, range.angka2.max);
    }
  } else if (operasi === 'pengurangan') {
    if (angka1 < angka2) {
      [angka1, angka2] = [angka2, angka1];
    }
    while (angka1 > 50) {
      angka1 = randomInt(range.angka1.min, Math.min(50, range.angka1.max));
      angka2 = randomInt(range.angka2.min, Math.min(angka1, range.angka2.max));
      if (angka1 < angka2) {
        [angka1, angka2] = [angka2, angka1];
      }
    }
  }

  return { angka1, angka2, operasi, kesulitan };
}

/**
 * Generate array soal untuk satu sesi latihan mandiri.
 * Menjamin list soal yang dikembalikan persis sesuai request pengguna.
 */
export function generateSesiSoal(
  operasi: Operasi,
  kesulitan: Kesulitan,
  jumlah: number
): Soal[] {
  // Ambil dari dataset statis LATIHAN_MANDIRI_SOAL jika tersedia
  const customList = LATIHAN_MANDIRI_SOAL[operasi]?.[kesulitan];
  if (customList && customList.length > 0) {
    // Return copy array agar tidak termutasi
    return customList.map(s => ({ ...s }));
  }

  // Fallback generator acak
  const soalList: Soal[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < jumlah; i++) {
    let soal: Soal;
    let key: string;

    do {
      soal = generateSoal(operasi, kesulitan);
      key = `${soal.angka1}-${soal.angka2}`;
    } while (seen.has(key) && seen.size < 50);

    seen.add(key);
    soalList.push(soal);
  }

  return soalList;
}

/**
 * Validasi kebenaran constraints soal
 */
export function isValidSoal(soal: Soal): boolean {
  const { angka1, angka2, operasi } = soal;
  if (angka1 <= 0 || angka2 <= 0) return false;
  if (angka1 > 999 || angka2 > 999) return false;
  if (operasi === 'pengurangan' && angka1 < angka2) return false;
  return true;
}

/**
 * Generate soal berurutan (tidak diacak) dari level mudah → sedang → sulit.
 * Terutama untuk Peta Belajar (sekarang digantikan dataset statis per modul).
 */
export function generateSesiSoalBerurutan(
  operasi: Operasi,
  jumlah: number
): Soal[] {
  const soalList: Soal[] = [];
  const seen = new Set<string>();
  const perLevel = Math.ceil(jumlah / 3);
  const levels: Kesulitan[] = ['mudah', 'sedang', 'sulit'];

  for (const level of levels) {
    const target = Math.min(perLevel, jumlah - soalList.length);
    if (target <= 0) break;

    for (let i = 0; i < target; i++) {
      let soal: Soal;
      let key: string;
      let attempts = 0;

      do {
        soal = generateSoal(operasi, level);
        key = `${soal.angka1}-${soal.angka2}`;
        attempts++;
      } while (seen.has(key) && attempts < 50);

      seen.add(key);
      soalList.push(soal);
    }
  }

  return soalList;
}
