'use client';

// ============================================
// Pilih Operasi — Halaman pemilihan operasi + mode
// ============================================
// 3 kartu besar dengan ikon: ➕ ➖ ✖️
// Setelah pilih operasi → pilih kesulitan + mode (Belajar / Latihan)

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, PenTool, ArrowLeft, ClipboardList, Map, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OperationCard from '@/components/math/operation-card';
import { useTutorial } from '@/hooks/use-tutorial';
import type { Operasi, Kesulitan } from '@/types/math';
import { OPERASI_LABEL, KESULITAN_LIST, KESULITAN_LABEL } from '@/lib/constants';

export default function PilihOperasiPage() {
  const router = useRouter();
  const [operasiTerpilih, setOperasiTerpilih] = useState<Operasi | null>(null);
  const [kesulitanTerpilih, setKesulitanTerpilih] = useState<Kesulitan | null>(null);
  const [isTestUser, setIsTestUser] = useState(false);
  const { isTutorial, tutorialStep, setStep, resetTutorial } = useTutorial();

  useEffect(() => {
    setIsTestUser(sessionStorage.getItem('siswaNama') === 'test');
  }, []);



  const handleUlangTutorial = async () => {
    await resetTutorial();
    setOperasiTerpilih(null);
    setKesulitanTerpilih(null);
  };

  const handlePilihOperasi = async (operasi: Operasi) => {
    setOperasiTerpilih(operasi);
  };

  const handlePilihKesulitan = async (k: Kesulitan) => {
    setKesulitanTerpilih(k);
  };

  const handlePilihMode = async (mode: 'belajar' | 'latihan') => {
    if (!operasiTerpilih || !kesulitanTerpilih) return;

    // Simpan pilihan ke sessionStorage
    sessionStorage.setItem('operasi', operasiTerpilih);
    sessionStorage.setItem('kesulitan', kesulitanTerpilih);

    if (mode === 'belajar') {
      router.push('/belajar');
    } else {
      // Hapus data simpanan latihan mandiri agar mulai sesi baru
      localStorage.removeItem('latihan_mandiri');
      localStorage.removeItem('latihan_mandiri_timer');
      router.push('/latihan');
    }
  };

  const KESULITAN_EMOJI: Record<Kesulitan, string> = {
    mudah: '🌟',
    sedang: '⭐',
    sulit: '🔥',
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      {!isTestUser && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUlangTutorial}
          className="absolute top-4 left-4 z-50 bg-white/50 hover:bg-white text-muted-foreground shadow-sm rounded-full font-bold"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Ulang Tutorial
        </Button>
      )}

      <AnimatePresence mode="wait">
        {!operasiTerpilih ? (
          /* ============================================
             Step 1: Pilih Operasi
             ============================================ */
          <motion.div
            key="operasi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-center"
            >
              Mau belajar apa? 🤔
            </motion.h2>

            {/* Tutorial Overlay Background */}
            {isTutorial && (
              <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm pointer-events-auto" />
            )}

            {/* Banner Peta Modul */}
            <div className={`relative ${(isTutorial && tutorialStep === 'PETA_BELAJAR') ? 'z-50' : 'z-0'} ${(isTutorial && tutorialStep !== 'PETA_BELAJAR') ? 'opacity-50 pointer-events-none' : ''}`}>
              {isTutorial && tutorialStep === 'PETA_BELAJAR' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-blue-600 px-4 py-2 rounded-full font-bold shadow-lg border-2 border-blue-200"
                >
                  Mulai dari sini ya! 👇
                </motion.div>
              )}
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/modul')}
                className={`flex items-center justify-between w-full max-w-sm p-4 bg-primary/10 border-2 border-primary/30 rounded-2xl hover:border-primary/50 shadow-sm hover:shadow-md transition-all group ${isTutorial && tutorialStep === 'PETA_BELAJAR' ? 'bg-white ring-4 ring-primary shadow-2xl scale-105 relative' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Map className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-primary text-lg">Peta Belajar</h3>
                    <p className="text-sm text-primary/70 font-medium">Ikuti modul bertahap</p>
                  </div>
                </div>
              </motion.button>
            </div>

            <div className={(isTutorial) ? 'opacity-50 pointer-events-none' : ''}>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/tugas')}
                className="flex items-center justify-between w-full max-w-sm p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl hover:border-orange-400 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <ClipboardList className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-orange-800 text-lg">Tugas & PR</h3>
                    <p className="text-sm text-orange-600/80 font-medium">Kerjakan tugas dari Guru</p>
                  </div>
                </div>
              </motion.button>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <div className={(isTutorial) ? 'opacity-50 pointer-events-none' : ''}>
                <OperationCard operasi="penjumlahan" onClick={handlePilihOperasi} delay={0.1} />
              </div>
              
              <div className={(isTutorial) ? 'opacity-50 pointer-events-none' : ''}>
                <OperationCard operasi="pengurangan" onClick={handlePilihOperasi} delay={0.2} />
              </div>
            </div>
          </motion.div>
        ) : !kesulitanTerpilih ? (
          /* ============================================
             Step 2: Pilih Kesulitan
             ============================================ */
          <motion.div
            key="kesulitan"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center gap-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOperasiTerpilih(null)}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold">
                {OPERASI_LABEL[operasiTerpilih]} — Pilih Tingkat
              </h2>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {KESULITAN_LIST.map((k, i) => (
                <div key={k} className={`relative ${(isTutorial) ? 'opacity-50 pointer-events-none' : ''}`}>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePilihKesulitan(k)}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-card border-2 border-border hover:border-primary/30 shadow-sm hover:shadow-md transition-all cursor-pointer w-full"
                  >
                    <span className="text-3xl">{KESULITAN_EMOJI[k]}</span>
                    <div className="text-left">
                      <p className="font-bold text-base">{KESULITAN_LABEL[k]}</p>
                    </div>
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ============================================
             Step 3: Pilih Mode (Belajar / Latihan)
             ============================================ */
          <motion.div
            key="mode"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setKesulitanTerpilih(null)}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold">
                Pilih Mode
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full relative">
              {/* Mode Belajar */}
              <div className={`relative flex flex-col items-center ${(isTutorial) ? 'opacity-50 pointer-events-none' : ''}`}>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handlePilihMode('belajar')}
                  className="flex flex-col items-center justify-center h-full gap-3 p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all cursor-pointer w-full"
                >
                  <BookOpen className="w-10 h-10 text-blue-500" />
                  <span className="text-base font-bold text-blue-700 dark:text-blue-300">
                    📖 Belajar
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    Lihat cara mengerjakan langkah demi langkah
                  </span>
                </motion.button>
              </div>

              {/* Mode Latihan */}
              <div className={(isTutorial) ? 'opacity-50 pointer-events-none' : ''}>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handlePilihMode('latihan')}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                >
                  <PenTool className="w-10 h-10 text-emerald-500" />
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                    ✏️ Latihan
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    Kerjakan soal sendiri dengan bantuan
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
