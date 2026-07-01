'use client';

// ============================================
// SimpleMathDemo — Penjelasan Hitung Sederhana
// ============================================
// Modul 1B: contoh penjumlahan/pengurangan tanpa carry/borrow.
// Dua layar: (1) gambar balok, (2) format hitung susun angka.
// Scaffolding: dari konkret (gambar) ke abstrak (angka).

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Base10Blocks from '@/components/math/base10-blocks';
import MathBoard from '@/components/math/math-board';
import { OPERASI_SIMBOL } from '@/lib/constants';
import type { Operasi } from '@/types/math';

interface SimpleMathDemoProps {
  /** Callback saat siswa selesai melihat kedua contoh */
  onSelesai: () => void;
}

/**
 * Generate soal sederhana tanpa carry/borrow.
 * Penjumlahan: digit satuan1 + digit satuan2 < 10
 * Pengurangan: digit atas >= digit bawah per kolom
 */
function generateSoalSederhana(operasi: Operasi): { angka1: number; angka2: number } {
  if (operasi === 'penjumlahan') {
    // Pastikan tidak ada carry: digit satuan + digit satuan < 10
    let angka1: number, angka2: number;
    do {
      angka1 = Math.floor(Math.random() * 30) + 10; // 10-39
      angka2 = Math.floor(Math.random() * 30) + 10; // 10-39
    } while (
      (angka1 % 10) + (angka2 % 10) >= 10 || // carry di satuan
      Math.floor(angka1 / 10) + Math.floor(angka2 / 10) >= 10 // carry di puluhan
    );
    return { angka1, angka2 };
  }

  // Pengurangan: digit atas >= digit bawah per kolom (tanpa borrow)
  let angka1: number, angka2: number;
  do {
    angka1 = Math.floor(Math.random() * 30) + 20; // 20-49
    angka2 = Math.floor(Math.random() * 20) + 10; // 10-29
  } while (
    angka1 <= angka2 ||
    (angka1 % 10) < (angka2 % 10) || // borrow di satuan
    Math.floor(angka1 / 10) < Math.floor(angka2 / 10) // borrow di puluhan
  );
  return { angka1, angka2 };
}

type DemoPhase = 'gambar-penjumlahan' | 'angka-penjumlahan' | 'gambar-pengurangan' | 'angka-pengurangan';

const PHASES: DemoPhase[] = [
  'gambar-penjumlahan',
  'angka-penjumlahan',
  'gambar-pengurangan',
  'angka-pengurangan',
];

export default function SimpleMathDemo({ onSelesai }: SimpleMathDemoProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [showHasil, setShowHasil] = useState(false);

  const phase = PHASES[phaseIndex];
  const operasi: Operasi = phase.includes('penjumlahan') ? 'penjumlahan' : 'pengurangan';
  const isGambar = phase.startsWith('gambar');

  // Generate soal per operasi (memoized agar tidak berubah saat phase switch)
  const [soalPenjumlahan] = useState(() => generateSoalSederhana('penjumlahan'));
  const [soalPengurangan] = useState(() => generateSoalSederhana('pengurangan'));

  const soal = operasi === 'penjumlahan' ? soalPenjumlahan : soalPengurangan;
  const simbol = OPERASI_SIMBOL[operasi];

  const hasil = useMemo(() => {
    return operasi === 'penjumlahan'
      ? soal.angka1 + soal.angka2
      : soal.angka1 - soal.angka2;
  }, [soal, operasi]);

  const nextPhase = useCallback(() => {
    setShowHasil(false);
    if (phaseIndex >= PHASES.length - 1) {
      onSelesai();
    } else {
      setPhaseIndex((prev) => prev + 1);
    }
  }, [phaseIndex, onSelesai]);

  const prevPhase = useCallback(() => {
    setShowHasil(false);
    if (phaseIndex > 0) {
      setPhaseIndex((prev) => prev - 1);
    }
  }, [phaseIndex]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        {PHASES.map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{
              backgroundColor: i <= phaseIndex ? 'var(--primary)' : 'var(--border)',
              transform: i === phaseIndex ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Title */}
      <motion.h3
        key={phase}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-bold text-center"
      >
        {isGambar ? '🎨 Contoh dengan Gambar' : '🔢 Contoh dengan Angka'}
        <span className="block text-sm font-medium text-muted-foreground mt-1">
          {operasi === 'penjumlahan' ? 'Penjumlahan Sederhana' : 'Pengurangan Sederhana'}
        </span>
      </motion.h3>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isGambar ? (
          <motion.div
            key={`gambar-${operasi}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            {/* Soal text */}
            <div className="text-2xl font-black text-center tabular-nums">
              {soal.angka1} {simbol} {soal.angka2}
              {showHasil && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {' '}= {hasil}
                </motion.span>
              )}
            </div>

            {/* Balok visual */}
            <div className="flex items-end justify-center gap-8 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <Base10Blocks angka={soal.angka1} tampilkanLabel animasi ukuran="sm" />
              </div>
              <div className="text-3xl font-black self-center">{simbol}</div>
              <div className="flex flex-col items-center gap-2">
                <Base10Blocks angka={soal.angka2} tampilkanLabel animasi ukuran="sm" />
              </div>
            </div>

            {/* Tombol lihat hasil */}
            {!showHasil ? (
              <Button onClick={() => setShowHasil(true)} variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                Lihat Hasilnya
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 p-4 bg-card rounded-xl border border-border"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {operasi === 'penjumlahan'
                    ? 'Balok-balok digabungkan menjadi:'
                    : 'Setelah dikurangi:'}
                </span>
                <Base10Blocks angka={hasil} tampilkanLabel animasi ukuran="sm" />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`angka-${operasi}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            {/* MathBoard mode tampil */}
            <MathBoard
              angka1={soal.angka1}
              angka2={soal.angka2}
              operasi={operasi}
              mode="tampil"
            />

            {/* Penjelasan per kolom */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-3 bg-card rounded-lg border border-border text-sm"
              >
                <span className="font-bold" style={{ color: 'var(--block-satuan)' }}>
                  Kolom satuan:
                </span>{' '}
                {operasi === 'penjumlahan'
                  ? `${soal.angka1 % 10} + ${soal.angka2 % 10} = ${(soal.angka1 % 10) + (soal.angka2 % 10)}`
                  : `${soal.angka1 % 10} − ${soal.angka2 % 10} = ${(soal.angka1 % 10) - (soal.angka2 % 10)}`}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-3 bg-card rounded-lg border border-border text-sm"
              >
                <span className="font-bold" style={{ color: 'var(--block-puluhan)' }}>
                  Kolom puluhan:
                </span>{' '}
                {operasi === 'penjumlahan'
                  ? `${Math.floor(soal.angka1 / 10)} + ${Math.floor(soal.angka2 / 10)} = ${Math.floor(soal.angka1 / 10) + Math.floor(soal.angka2 / 10)}`
                  : `${Math.floor(soal.angka1 / 10)} − ${Math.floor(soal.angka2 / 10)} = ${Math.floor(soal.angka1 / 10) - Math.floor(soal.angka2 / 10)}`}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-sm font-bold text-center"
              >
                Hasilnya: {soal.angka1} {simbol} {soal.angka2} = {hasil}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {phaseIndex > 0 && (
          <Button variant="outline" onClick={prevPhase} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Sebelumnya
          </Button>
        )}
        <Button onClick={nextPhase} className="gap-2">
          {phaseIndex >= PHASES.length - 1 ? 'Selesai' : 'Lanjut'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
