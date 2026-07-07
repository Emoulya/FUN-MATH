'use client';

// ============================================
// Hook: useModulBelajarLatihan
// ============================================
// Mengabstraksi state, logic belajar (animasi), dan latihan
// untuk Modul 2 (Penjumlahan) dan Modul 3 (Pengurangan).

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAnimasi } from '@/hooks/use-animasi';
import { useLatihan } from '@/hooks/use-latihan';
import { useModulProgress } from '@/hooks/use-modul-progress';
import { generateSoal, generateSesiSoal } from '@/lib/soal-generator';
import { SOAL_PER_SESI, STORAGE_KEY_FROM_MODUL } from '@/lib/constants';
import type { Operasi } from '@/types/math';

export function useModulBelajarLatihan(operasi: Operasi, modulId: 'modul2' | 'modul3') {
  const router = useRouter();
  const animasi = useAnimasi();
  const latihan = useLatihan();
  const { selesaikanModul } = useModulProgress();
  const [layar, setLayar] = useState<'belajar' | 'latihan'>('belajar');
  const sesiMulaiRef = useRef(0);

  // Setup soal belajar awal
  useEffect(() => {
    const soal = generateSoal(operasi, 'sedang');
    animasi.setSoal(soal.angka1, soal.angka2, operasi, 'sedang');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operasi]);

  // Mulai latihan saat pindah ke layar latihan
  const mulaiLatihan = useCallback(() => {
    setLayar('latihan');
    sessionStorage.setItem('operasi', operasi);
    sessionStorage.setItem('kesulitan', 'sedang');
    const soalList = generateSesiSoal(operasi, 'sedang', SOAL_PER_SESI);
    latihan.mulaiSesi(soalList);
    sesiMulaiRef.current = Date.now();
  }, [operasi, latihan]);

  // Generate soal belajar baru
  const soalBaruBelajar = useCallback(() => {
    const soal = generateSoal(operasi, 'sedang');
    animasi.setSoal(soal.angka1, soal.angka2, operasi, 'sedang');
  }, [operasi, animasi]);

  // Selesai sesi latihan -> Simpan + redirect
  useEffect(() => {
    if (!latihan.sesiSelesai) return;

    const rekap = latihan.rekap;
    const benar = rekap.filter((r) => r.status === 'benar').length;
    const salah = rekap.filter((r) => r.status !== 'benar').length;
    const skor = rekap.length > 0 ? Math.round((benar / rekap.length) * 100) : 0;

    // Simpan ke database
    fetch('/api/sesi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siswa_id: sessionStorage.getItem('siswaId'),
        operasi,
        skor,
        total_soal: rekap.length,
        benar,
        salah,
        durasi_detik: Math.floor((Date.now() - sesiMulaiRef.current) / 1000),
        detail: rekap.map((r) => ({
          soal: { angka1: r.soal.angka1, angka2: r.soal.angka2, operasi: r.soal.operasi },
          jawaban_siswa: r.jawabanSiswa,
          status: r.status,
          jumlah_percobaan: r.jumlahPercobaan,
          waktu_detik: r.waktuDetik,
        })),
        tipe: 'modul',
      }),
    }).catch(() => {});

    // Tandai modul selesai
    selesaikanModul(modulId);

    // Simpan rekap ke sessionStorage
    sessionStorage.setItem('rekap', JSON.stringify(rekap));
    sessionStorage.setItem('operasi', operasi);
    sessionStorage.setItem(STORAGE_KEY_FROM_MODUL, modulId);
    router.push('/rekap');
  }, [latihan.sesiSelesai, latihan.rekap, router, selesaikanModul, operasi, modulId]);

  return {
    router,
    animasi,
    latihan,
    layar,
    setLayar,
    mulaiLatihan,
    soalBaruBelajar,
  };
}
