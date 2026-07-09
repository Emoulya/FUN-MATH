'use client';

// ============================================
// SimpleMathDemo — Penjelasan Hitung Sederhana
// ============================================
// Modul 1B: Menyajikan contoh penjumlahan dan pengurangan tanpa carry/borrow.
// Menyajikan 3 contoh penjumlahan dan 3 contoh pengurangan statis (sesuai instruksi Prof).
// Scaffolding: dari konkret (gambar balok) ke abstrak (perhitungan susun angka).

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InteractiveMathBlocks from '@/components/math/interactive-math-blocks';
import InteractiveMathNumbers from '@/components/math/interactive-math-numbers';
import { MODUL1B_CONTOH } from '@/lib/dataset-soal';
import { OPERASI_SIMBOL } from '@/lib/constants';
import type { Operasi } from '@/types/math';

interface SimpleMathDemoProps {
  /** Callback saat seluruh contoh (3 penjumlahan & 3 pengurangan) selesai */
  onSelesai: () => void;
}

export default function SimpleMathDemo({ onSelesai }: SimpleMathDemoProps) {
  const [operasi, setOperasi] = useState<'penjumlahan' | 'pengurangan'>('penjumlahan');
  const [indexContoh, setIndexContoh] = useState(0); // 0, 1, 2
  const [subPhase, setSubPhase] = useState<'gambar' | 'angka'>('gambar');

  const contohList = operasi === 'penjumlahan' ? MODUL1B_CONTOH.penjumlahan : MODUL1B_CONTOH.pengurangan;
  const soal = contohList[indexContoh] || contohList[0];
  const simbol = OPERASI_SIMBOL[operasi];

  const handleNext = useCallback(() => {
    if (subPhase === 'gambar') {
      setSubPhase('angka');
    } else {
      // Jika subPhase adalah 'angka', lanjut ke contoh berikutnya atau ganti operasi
      if (indexContoh < 2) {
        setIndexContoh((prev) => prev + 1);
        setSubPhase('gambar');
      } else {
        if (operasi === 'penjumlahan') {
          setOperasi('pengurangan');
          setIndexContoh(0);
          setSubPhase('gambar');
        } else {
          onSelesai();
        }
      }
    }
  }, [subPhase, indexContoh, operasi, onSelesai]);

  const handleBack = useCallback(() => {
    if (subPhase === 'angka') {
      setSubPhase('gambar');
    } else {
      if (indexContoh > 0) {
        setIndexContoh((prev) => prev - 1);
        setSubPhase('angka');
      } else {
        if (operasi === 'pengurangan') {
          setOperasi('penjumlahan');
          setIndexContoh(2);
          setSubPhase('angka');
        }
      }
    }
  }, [subPhase, indexContoh, operasi]);

  // Hitung progress presentasi contoh (total 12 state: 3 penjumlahan x 2 + 3 pengurangan x 2)
  const currentStepNum = 
    (operasi === 'penjumlahan' ? 0 : 6) + 
    indexContoh * 2 + 
    (subPhase === 'gambar' ? 1 : 2);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg select-none">
      
      {/* Indikator Progress Contoh */}
      <div className="flex items-center justify-between w-full px-2 text-xs text-muted-foreground font-semibold">
        <span>📚 Contoh Penjelasan</span>
        <span className="font-mono text-primary bg-primary/5 px-2 py-0.5 rounded-full">
          Progress: {currentStepNum} / 12
        </span>
      </div>

      {/* Progress Bar Bulat/Titik */}
      <div className="flex items-center gap-1.5 justify-center w-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i + 1 === currentStepNum ? 24 : 8,
              backgroundColor: i + 1 <= currentStepNum ? 'var(--primary)' : 'var(--border)',
            }}
          />
        ))}
      </div>

      {/* Judul & Subtitle */}
      <motion.div
        key={`${operasi}-${indexContoh}-${subPhase}`}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h3 className="text-lg font-black tracking-tight text-slate-800">
          {subPhase === 'gambar' ? '🎨 Contoh Konsep (Gambar Balok)' : '🔢 Contoh Perhitungan (Susun Angka)'}
        </h3>
        <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider text-primary">
          {operasi === 'penjumlahan' ? 'Penjumlahan Sederhana' : 'Pengurangan Sederhana'} — Contoh {indexContoh + 1}
        </p>
      </motion.div>

      {/* Konten Demo */}
      <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 shadow-sm min-h-[480px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {subPhase === 'gambar' ? (
            <motion.div
              key={`gambar-${operasi}-${indexContoh}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <div className="text-2xl font-black text-center tabular-nums text-slate-700 bg-slate-50 px-6 py-2 rounded-full border border-slate-100 shadow-inner">
                {soal.angka1} {simbol} {soal.angka2}
              </div>

              <InteractiveMathBlocks
                angka1={soal.angka1}
                angka2={soal.angka2}
                operasi={operasi}
                onSelesai={handleNext}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`angka-${operasi}-${indexContoh}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <InteractiveMathNumbers
                angka1={soal.angka1}
                angka2={soal.angka2}
                operasi={operasi}
                onSelesai={handleNext}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigasi Manual */}
      <div className="flex gap-4 w-full justify-between items-center px-2">
        {/* Tombol Sebelumnya */}
        {(operasi === 'pengurangan' || indexContoh > 0 || subPhase === 'angka') ? (
          <Button variant="outline" onClick={handleBack} className="gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            Sebelumnya
          </Button>
        ) : (
          <div />
        )}

        {/* Tombol Lanjut */}
        <Button onClick={handleNext} className="gap-2 px-6 rounded-xl shadow-md">
          {operasi === 'pengurangan' && indexContoh === 2 && subPhase === 'angka' ? 'Mulai Latihan' : 'Lanjut'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
