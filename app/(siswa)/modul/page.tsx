'use client';

// ============================================
// Peta Modul — Hub Utama Siswa
// ============================================
// Menampilkan semua modul dalam urutan linear dengan lock system.
// Siswa hanya bisa mengakses modul yang sudah unlocked.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModulCard from '@/components/math/modul-card';
import { useModulProgress } from '@/hooks/use-modul-progress';
import { MODUL_LIST } from '@/lib/constants';

export default function PetaModulPage() {
  const router = useRouter();
  const { getStatus, resetProgress, isLoading } = useModulProgress();

  const [isTutorial, setIsTutorial] = useState(false);

  useEffect(() => {
    const siswaId = sessionStorage.getItem('siswaId');
    if (siswaId) {
      const tutorialDone = localStorage.getItem(`tutorial_done_${siswaId}`);
      if (!tutorialDone) {
        setIsTutorial(true);
      }
    }
  }, []);

  // Hitung progress keseluruhan
  const totalModul = MODUL_LIST.length;
  const completedCount = MODUL_LIST.filter((m) => getStatus(m.id) === 'completed').length;
  const progressPersen = Math.round((completedCount / totalModul) * 100);

  // Cari modul pertama yang belum selesai untuk target tutorial
  const targetTutorialId = MODUL_LIST.find((m) => getStatus(m.id) !== 'completed')?.id || null;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-6 p-6 max-w-lg mx-auto w-full relative">
      {/* Tutorial Overlay Background */}
      {isTutorial && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm pointer-events-auto" />
      )}

      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full relative"
      >
        <div className={`absolute left-4 top-0 ${isTutorial && !targetTutorialId ? 'z-50 bg-white ring-4 ring-primary rounded-xl shadow-2xl p-1' : 'z-50'}`}>
          {isTutorial && !targetTutorialId && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-12 left-0 whitespace-nowrap bg-white text-blue-600 px-4 py-1.5 rounded-full font-bold shadow-lg border-2 border-blue-200 text-sm z-50"
            >
              Semua modul selesai! Klik Kembali untuk lanjut 👈
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isTutorial && !targetTutorialId) {
                const siswaId = sessionStorage.getItem('siswaId');
                if (siswaId) {
                  localStorage.setItem(`tutorial_step_${siswaId}`, 'PILIH_OPERASI');
                }
              }
              router.push('/pilih-operasi');
            }}
            className="text-muted-foreground gap-1.5 hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>
        <h2 className="text-2xl font-black mt-10 md:mt-0">📚 Peta Belajar</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selesaikan setiap modul untuk membuka yang berikutnya
        </p>
      </motion.div>

      {/* Progress bar keseluruhan */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span className="font-semibold">Progress</span>
          <span className="font-bold">{completedCount}/{totalModul} modul</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPersen}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--modul-completed)' }}
          />
        </div>
      </motion.div>

      {/* Daftar modul */}
      <div className="w-full flex flex-col gap-3">
        {MODUL_LIST.map((modul, index) => {
          const isTargetTutorial = isTutorial && modul.id === targetTutorialId;
          return (
            <div key={modul.id} className={`relative ${isTargetTutorial ? 'z-50' : 'z-0'} ${isTutorial && !isTargetTutorial ? 'opacity-50 pointer-events-none' : ''}`}>
              {isTargetTutorial && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-blue-600 px-4 py-1.5 rounded-full font-bold shadow-lg border-2 border-blue-200 text-sm z-10"
                >
                  Pilih {modul.judul} untuk memulai! 👇
                </motion.div>
              )}
              <div className={isTargetTutorial ? 'bg-white ring-4 ring-primary rounded-2xl shadow-2xl scale-[1.02] transition-transform' : ''}>
                <ModulCard
                  modul={modul}
                  status={getStatus(modul.id)}
                  index={index}
                  onClick={() => router.push(modul.href)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tombol reset (kecil, di bawah) */}
      {completedCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={resetProgress}
            className="text-xs text-muted-foreground gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            Mulai Ulang
          </Button>
        </motion.div>
      )}
    </div>
  );
}
