'use client';

// ============================================
// Peta Modul — Hub Utama Siswa
// ============================================
// Menampilkan semua modul dalam urutan linear dengan lock system.
// Siswa hanya bisa mengakses modul yang sudah unlocked.

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModulCard from '@/components/math/modul-card';
import { useModulProgress } from '@/hooks/use-modul-progress';
import { MODUL_LIST } from '@/lib/constants';

export default function PetaModulPage() {
  const router = useRouter();
  const { getStatus, resetProgress, isLoading } = useModulProgress();

  // Hitung progress keseluruhan
  const totalModul = MODUL_LIST.length;
  const completedCount = MODUL_LIST.filter((m) => getStatus(m.id) === 'completed').length;
  const progressPersen = Math.round((completedCount / totalModul) * 100);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-6 p-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full"
      >
        <h2 className="text-2xl font-black">📚 Peta Belajar</h2>
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
        {MODUL_LIST.map((modul, index) => (
          <ModulCard
            key={modul.id}
            modul={modul}
            status={getStatus(modul.id)}
            index={index}
            onClick={() => router.push(modul.href)}
          />
        ))}
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
