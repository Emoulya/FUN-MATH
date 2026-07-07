// ============================================
// Generator Soal — Random berdasarkan operasi + kesulitan
// ============================================
// Menghasilkan soal acak sesuai parameter.
// Khusus pengurangan: angka1 selalu >= angka2 (hasil tidak negatif).

import type { Operasi, Kesulitan, Soal } from '@/types/math';

// ============================================
// Range Angka per Kesulitan
// ============================================

interface RangeAngka {
  min: number;
  max: number;
}

/**
 * Definisi range angka berdasarkan kesulitan.
 * - Mudah: 2 digit tanpa carry/borrow yang kompleks
 * - Sedang: 2 digit dengan kemungkinan carry/borrow
 * - Sulit: 2-3 digit dengan carry/borrow beruntun
 */
const RANGE_PER_KESULITAN: Record<Kesulitan, { angka1: RangeAngka; angka2: RangeAngka }> = {
  mudah: {
    angka1: { min: 10, max: 25 },
    angka2: { min: 10, max: 25 },
  },
  sedang: {
    angka1: { min: 15, max: 30 },
    angka2: { min: 10, max: 20 },
  },
  sulit: {
    angka1: { min: 20, max: 35 },
    angka2: { min: 10, max: 15 },
  },
};

/**
 * Range khusus perkalian — tidak dipakai, disesuaikan max 50
 */
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

// ============================================
// Utilitas Random
// ============================================

/**
 * Generate angka random antara min dan max (inklusif).
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// Generator Soal
// ============================================

/**
 * Generate satu soal random berdasarkan operasi dan kesulitan.
 *
 * Untuk pengurangan:
 * - Memastikan angka1 >= angka2 sehingga hasil tidak negatif
 *
 * Untuk perkalian:
 * - Menggunakan range lebih kecil agar hasil tidak terlalu besar
 */
export function generateSoal(operasi: Operasi, kesulitan: Kesulitan): Soal {
  if (operasi === 'perkalian') {
    const range = RANGE_PERKALIAN[kesulitan];
    const angka1 = randomInt(range.angka1.min, range.angka1.max);
    const angka2 = randomInt(range.angka2.min, range.angka2.max);
    return { angka1, angka2, operasi, kesulitan };
  }

  // Probabilitas 40% untuk memunculkan kombinasi Puluhan + Satuan atau Puluhan - Satuan
  const isPuluhanSatuan = Math.random() < 0.4;

  if (isPuluhanSatuan) {
    if (operasi === 'penjumlahan') {
      if (kesulitan === 'mudah') {
        // Puluhan + Satuan tanpa menyimpan (carry)
        const angka1 = randomInt(10, 39);
        const s1 = angka1 % 10;
        const maxSatuan = 9 - s1;
        const angka2 = maxSatuan >= 1 ? randomInt(1, maxSatuan) : randomInt(1, 9);
        return { angka1, angka2, operasi, kesulitan };
      } else {
        // Sedang / Sulit: Puluhan + Satuan dengan menyimpan (carry)
        let angka1 = randomInt(11, 39);
        while (angka1 % 10 === 0) {
          angka1 = randomInt(11, 39);
        }
        const s1 = angka1 % 10;
        const minSatuan = 10 - s1;
        const angka2 = randomInt(minSatuan, 9);
        return { angka1, angka2, operasi, kesulitan };
      }
    } else if (operasi === 'pengurangan') {
      if (kesulitan === 'mudah') {
        // Puluhan - Satuan tanpa meminjam (borrow)
        let angka1 = randomInt(11, 39);
        while (angka1 % 10 === 0) {
          angka1 = randomInt(11, 39);
        }
        const s1 = angka1 % 10;
        const angka2 = randomInt(1, s1);
        return { angka1, angka2, operasi, kesulitan };
      } else {
        // Sedang / Sulit: Puluhan - Satuan dengan meminjam (borrow)
        let angka1 = randomInt(11, 39);
        while (angka1 % 10 === 9) {
          angka1 = randomInt(11, 39);
        }
        const s1 = angka1 % 10;
        const minSatuan = s1 + 1;
        const angka2 = randomInt(minSatuan, 9);
        return { angka1, angka2, operasi, kesulitan };
      }
    }
  }

  // Alur biasa (Puluhan dengan Puluhan)
  const range = RANGE_PER_KESULITAN[kesulitan];
  let angka1 = randomInt(range.angka1.min, range.angka1.max);
  let angka2 = randomInt(range.angka2.min, range.angka2.max);

  if (operasi === 'penjumlahan') {
    while (angka1 + angka2 > 50) {
      const rangeVal = RANGE_PER_KESULITAN[kesulitan];
      angka1 = randomInt(rangeVal.angka1.min, rangeVal.angka1.max);
      angka2 = randomInt(rangeVal.angka2.min, rangeVal.angka2.max);
    }
  } else if (operasi === 'pengurangan') {
    if (angka1 < angka2) {
      [angka1, angka2] = [angka2, angka1];
    }
    while (angka1 > 50) {
      const rangeVal = RANGE_PER_KESULITAN[kesulitan];
      angka1 = randomInt(rangeVal.angka1.min, Math.min(50, rangeVal.angka1.max));
      angka2 = randomInt(rangeVal.angka2.min, Math.min(angka1, rangeVal.angka2.max));
      if (angka1 < angka2) {
        [angka1, angka2] = [angka2, angka1];
      }
    }
  }

  return { angka1, angka2, operasi, kesulitan };
}

/**
 * Generate array soal untuk satu sesi latihan.
 */
export function generateSesiSoal(
  operasi: Operasi,
  kesulitan: Kesulitan,
  jumlah: number
): Soal[] {
  const soalList: Soal[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < jumlah; i++) {
    let soal: Soal;
    let key: string;

    // Hindari soal duplikat dalam satu sesi
    do {
      soal = generateSoal(operasi, kesulitan);
      key = `${soal.angka1}-${soal.angka2}`;
    } while (seen.has(key) && seen.size < 50); // safety limit

    seen.add(key);
    soalList.push(soal);
  }

  return soalList;
}

/**
 * Validasi apakah soal valid berdasarkan constraint.
 */
export function isValidSoal(soal: Soal): boolean {
  const { angka1, angka2, operasi } = soal;

  // Angka harus positif
  if (angka1 <= 0 || angka2 <= 0) return false;

  // Angka harus dalam range 2-3 digit (kecuali pengali 1 digit untuk perkalian mudah)
  if (angka1 > 999 || angka2 > 999) return false;

  // Pengurangan: angka1 harus >= angka2
  if (operasi === 'pengurangan' && angka1 < angka2) return false;

  return true;
}
