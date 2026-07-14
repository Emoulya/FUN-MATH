'use client';

// ============================================
// PlaceValueIntroAnimation — Dekomposisi Nilai Tempat
// ============================================
// Menjelaskan konsep nilai tempat dengan mengurai angka menjadi
// puluhan dan satuan melalui animasi visual bertahap.
// 3 contoh angka berbeda, masing-masing 4 langkah dekomposisi.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

interface PlaceValueIntroAnimationProps {
  onSelesai: () => void;
}

// Dataset 3 contoh dekomposisi
const CONTOH_DEKOMPOSISI = [
  { angka: 12, puluhan: 1, satuan: 2 },
  { angka: 25, puluhan: 2, satuan: 5 },
  { angka: 34, puluhan: 3, satuan: 4 },
];

const TOTAL_LANGKAH_PER_CONTOH = 4;

// Sub-komponen: Batang Puluhan
function PuluhanBar({ animate = false }: { animate?: boolean }) {
  return (
    <motion.div
      className="flex flex-col overflow-hidden rounded-[4px]"
      style={{
        width: 20,
        height: 120,
        border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
        backgroundColor: 'color-mix(in oklch, var(--block-puluhan) 15%, transparent)', // Hollow look before fill
      }}
      variants={animate ? {
        hidden: {},
        show: { transition: { staggerChildren: 0.4, staggerDirection: -1 } }
      } : undefined}
      initial={animate ? 'hidden' : 'show'}
      animate="show"
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          variants={animate ? {
            hidden: { opacity: 0 },
            show: { opacity: 1 }
          } : undefined}
          style={{
            flex: 1,
            backgroundColor:
              i % 2 === 0
                ? 'color-mix(in oklch, var(--block-puluhan) 100%, transparent)'
                : 'color-mix(in oklch, var(--block-puluhan) 70%, black 30%)',
            borderBottom:
              i < 9
                ? '1px solid color-mix(in oklch, var(--block-puluhan) 40%, black 60%)'
                : 'none',
          }}
        />
      ))}
    </motion.div>
  );
}

// Sub-komponen: Kotak Satuan
function SatuanBox({ animate = false, delayIndex = 0 }: { animate?: boolean, delayIndex?: number }) {
  return (
    <motion.div
      className="rounded-[3px]"
      variants={animate ? {
        hidden: { opacity: 0, scale: 0.3 },
        show: { opacity: 1, scale: 1, transition: { delay: delayIndex * 0.5 } }
      } : undefined}
      initial={animate ? 'hidden' : 'show'}
      animate="show"
      style={{
        width: 20,
        height: 20,
        backgroundColor: 'var(--block-satuan)',
        border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
      }}
    />
  );
}

export default function PlaceValueIntroAnimation({
  onSelesai,
}: PlaceValueIntroAnimationProps) {
  const [contohIndex, setContohIndex] = useState(0);
  const [langkah, setLangkah] = useState(0); // 0-3 per contoh
  const [isPlaying, setIsPlaying] = useState(true);

  const contoh = CONTOH_DEKOMPOSISI[contohIndex];
  const isContohTerakhir = contohIndex === CONTOH_DEKOMPOSISI.length - 1;
  const isLangkahTerakhir = langkah === TOTAL_LANGKAH_PER_CONTOH - 1;

  // Transisi otomatis antar langkah
  useEffect(() => {
    if (isPlaying && langkah < TOTAL_LANGKAH_PER_CONTOH - 1) {
      // Delay diperpanjang agar animasi tumpukan yang lebih lambat bisa selesai
      const delay = langkah === 0 ? 3500 : langkah === 1 ? 4500 : 3500;
      const timer = setTimeout(() => {
        setLangkah((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [langkah, isPlaying]);

  // Reset saat ganti contoh
  useEffect(() => {
    setLangkah(0);
    setIsPlaying(true);
  }, [contohIndex]);

  // Label penjelasan per langkah
  const getPenjelasan = () => {
    switch (langkah) {
      case 0:
        return `Lihat angka <b>${contoh.angka}</b>! Mari kita urai menjadi puluhan dan satuan.`;
      case 1:
        return `Bagian ini adalah <b>${contoh.puluhan} puluhan</b>, nilainya <b>${contoh.puluhan * 10}</b>.`;
      case 2:
        return `Dan bagian ini adalah <b>${contoh.satuan} satuan</b>, nilainya <b>${contoh.satuan}</b>.`;
      case 3:
        return `Jadi, <b>${contoh.puluhan * 10}</b> + <b>${contoh.satuan}</b> = <b>${contoh.angka}</b>!`;
      default:
        return '';
    }
  };

  // Global step number untuk progress bar (total 12 langkah: 3 contoh × 4 langkah)
  const globalStep = contohIndex * TOTAL_LANGKAH_PER_CONTOH + langkah + 1;
  const totalGlobalSteps = CONTOH_DEKOMPOSISI.length * TOTAL_LANGKAH_PER_CONTOH;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md p-6 bg-card rounded-3xl border border-border shadow-xl">
      {/* Label Contoh */}
      <div className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950/20 text-xs font-bold rounded-full">
        Contoh {contohIndex + 1} dari {CONTOH_DEKOMPOSISI.length}
      </div>

      {/* Box Penjelasan */}
      <div className="text-center w-full min-h-[56px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${contohIndex}-${langkah}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm font-semibold text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: getPenjelasan() }}
          />
        </AnimatePresence>
      </div>

      {/* Area Visualisasi */}
      <div className="relative flex items-center justify-center w-full min-h-[280px] bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`vis-${contohIndex}-${langkah}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            {/* Langkah 0: Tampilkan semua balok + angka */}
            {langkah === 0 && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-end gap-6 justify-center">
                  {/* Puluhan */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: contoh.puluhan }).map((_, i) => (
                      <motion.div
                        key={`p-${i}`}
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
                      >
                        <PuluhanBar />
                      </motion.div>
                    ))}
                  </div>
                  {/* Satuan */}
                  <div className="flex flex-wrap gap-1.5 max-w-[120px] content-end">
                    {Array.from({ length: contoh.satuan }).map((_, i) => (
                      <motion.div
                        key={`s-${i}`}
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          delay: contoh.puluhan * 0.15 + i * 0.1,
                          type: 'spring',
                          stiffness: 200,
                        }}
                      >
                        <SatuanBox />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="text-3xl font-black text-slate-700"
                >
                  {contoh.angka}
                </motion.span>
              </div>
            )}

            {/* Langkah 1: Lingkari Puluhan */}
            {langkah === 1 && (
              <div className="flex items-end gap-10 justify-center">
                {/* Puluhan — dilingkari */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="relative p-3 rounded-2xl border-[3px] border-emerald-500 bg-emerald-50/40 shadow-md">
                    <div className="flex gap-1.5">
                      {Array.from({ length: contoh.puluhan }).map((_, i) => (
                        <PuluhanBar key={`p-h-${i}`} animate={true} />
                      ))}
                    </div>
                    {/* Badge label */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-sm font-black px-3 py-0.5 rounded-full shadow"
                    >
                      {contoh.puluhan * 10}
                    </motion.div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {contoh.puluhan} Puluhan
                  </span>
                </motion.div>

                {/* Satuan — belum dilingkari (samar) */}
                <div className="flex flex-col items-center gap-3 opacity-40">
                  <div className="flex flex-wrap gap-1.5 max-w-[80px] content-end p-2">
                    {Array.from({ length: contoh.satuan }).map((_, i) => (
                      <SatuanBox key={`s-dim-${i}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400">?</span>
                </div>
              </div>
            )}

            {/* Langkah 2: Lingkari Satuan */}
            {langkah === 2 && (
              <div className="flex items-end gap-10 justify-center">
                {/* Puluhan — sudah dilingkari */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative p-3 rounded-2xl border-[3px] border-emerald-500 bg-emerald-50/40">
                    <div className="flex gap-1.5">
                      {Array.from({ length: contoh.puluhan }).map((_, i) => (
                        <PuluhanBar key={`p-done-${i}`} />
                      ))}
                    </div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-sm font-black px-3 py-0.5 rounded-full shadow">
                      {contoh.puluhan * 10}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {contoh.puluhan} Puluhan
                  </span>
                </div>

                {/* Satuan — dilingkari */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="relative p-3 rounded-2xl border-[3px] border-blue-500 bg-blue-50/40 shadow-md">
                    <div className="flex flex-wrap gap-1.5 max-w-[80px] content-end">
                      {Array.from({ length: contoh.satuan }).map((_, i) => (
                        <SatuanBox key={`s-h-${i}`} animate={true} delayIndex={i} />
                      ))}
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-black px-3 py-0.5 rounded-full shadow"
                    >
                      {contoh.satuan}
                    </motion.div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">
                    {contoh.satuan} Satuan
                  </span>
                </motion.div>
              </div>
            )}

            {/* Langkah 3: Saling Mendekat → Hasil */}
            {langkah === 3 && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 justify-center">
                  {/* Puluhan mendekat ke tengah */}
                  <motion.div
                    initial={{ x: -40 }}
                    animate={{ x: 0 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border-[3px] border-emerald-500 bg-emerald-50/40"
                  >
                    <div className="flex gap-1.5">
                      {Array.from({ length: contoh.puluhan }).map((_, i) => (
                        <PuluhanBar key={`p-f-${i}`} />
                      ))}
                    </div>
                    <span className="text-sm font-black text-emerald-600">
                      {contoh.puluhan * 10}
                    </span>
                  </motion.div>

                  {/* Tanda + */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-black text-slate-400"
                  >
                    +
                  </motion.span>

                  {/* Satuan mendekat ke tengah */}
                  <motion.div
                    initial={{ x: 40 }}
                    animate={{ x: 0 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border-[3px] border-blue-500 bg-blue-50/40"
                  >
                    <div className="flex flex-wrap gap-1.5 max-w-[80px] content-end">
                      {Array.from({ length: contoh.satuan }).map((_, i) => (
                        <SatuanBox key={`s-f-${i}`} />
                      ))}
                    </div>
                    <span className="text-sm font-black text-blue-600">
                      {contoh.satuan}
                    </span>
                  </motion.div>
                </div>

                {/* Hasil = angka */}
                <motion.div
                  initial={{ y: 20, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="flex items-center gap-2 bg-amber-50 border-2 border-amber-300 px-6 py-3 rounded-2xl shadow-md"
                >
                  <span className="text-lg font-bold text-slate-600">
                    {contoh.puluhan * 10} + {contoh.satuan} =
                  </span>
                  <span className="text-3xl font-black text-amber-600">
                    {contoh.angka}
                  </span>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Panel Kontrol Navigasi */}
      <div className="flex flex-col gap-3 w-full max-w-sm mx-auto border-t border-border pt-4">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground w-16 text-right">
            {globalStep} / {totalGlobalSteps}
          </span>
          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(globalStep / totalGlobalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Tombol kontrol */}
        <div className="flex items-center justify-center gap-3">
          {/* Ulangi */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setContohIndex(0);
              setLangkah(0);
              setIsPlaying(true);
            }}
            disabled={contohIndex === 0 && langkah === 0}
            title="Ulangi dari awal"
            className="rounded-xl w-10 h-10"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          {/* Sebelumnya */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (langkah > 0) {
                setLangkah((prev) => prev - 1);
              } else if (contohIndex > 0) {
                setContohIndex((prev) => prev - 1);
                setLangkah(TOTAL_LANGKAH_PER_CONTOH - 1);
                setIsPlaying(false);
              }
            }}
            disabled={contohIndex === 0 && langkah === 0}
            title="Langkah sebelumnya"
            className="rounded-xl w-10 h-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Play/Pause */}
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsPlaying((prev) => !prev)}
            title={isPlaying ? 'Jeda' : 'Putar otomatis'}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          {/* Berikutnya */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (langkah < TOTAL_LANGKAH_PER_CONTOH - 1) {
                setLangkah((prev) => prev + 1);
              } else if (!isContohTerakhir) {
                setContohIndex((prev) => prev + 1);
              }
            }}
            disabled={isContohTerakhir && isLangkahTerakhir}
            title="Langkah berikutnya"
            className="rounded-xl w-10 h-10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tombol aksi */}
      <div className="w-full">
        {isLangkahTerakhir && !isContohTerakhir && (
          <Button
            onClick={() => setContohIndex((prev) => prev + 1)}
            className="gap-2 w-full rounded-2xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            Contoh Berikutnya
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        {isLangkahTerakhir && isContohTerakhir && (
          <Button
            onClick={onSelesai}
            className="gap-2 w-full rounded-2xl shadow-md"
          >
            Lanjut ke Game
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
