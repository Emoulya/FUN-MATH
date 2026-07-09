'use client';

// ============================================
// Modul 1A — Nilai Tempat
// ============================================
// Layar 1: Penjelasan visual angka → balok Base-10
// Layar 2: Game isian pendek (puluhan, satuan, angka)
// Setelah selesai → tandai modul1a completed → unlock modul1b

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlaceValueIntroAnimation from '@/components/math/place-value-intro-animation';
import PlaceValueGame from '@/components/math/place-value-game';
import { useModulProgress } from '@/hooks/use-modul-progress';

type Layar = 'penjelasan' | 'game';

export default function Modul1APage() {
  const router = useRouter();
  const { selesaikanModul } = useModulProgress();
  const [layar, setLayar] = useState<Layar>('penjelasan');

  const handleGameSelesai = useCallback(() => {
    selesaikanModul('modul1a');
    router.push('/modul');
  }, [selesaikanModul, router]);

  return (
    <div className="flex-1 flex flex-col items-center gap-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-xl font-bold">🧱 Nilai Tempat</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {layar === 'penjelasan'
            ? 'Kenali bagaimana puluhan dan satuan terbentuk!'
            : 'Ayo coba sendiri!'}
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setLayar('penjelasan')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            layar === 'penjelasan'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Penjelasan
        </button>
        <button
          onClick={() => setLayar('game')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            layar === 'game'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Game
        </button>
      </div>

      {/* Konten */}
      <AnimatePresence mode="wait">
        {layar === 'penjelasan' ? (
          <motion.div
            key="penjelasan"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex justify-center"
          >
            <PlaceValueIntroAnimation onSelesai={() => setLayar('game')} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full flex flex-col items-center"
          >
            <PlaceValueGame onSelesai={handleGameSelesai} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tombol kembali */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/modul')}
        className="text-xs text-muted-foreground gap-1.5"
      >
        <ArrowLeft className="w-3 h-3" />
        Kembali ke Peta Modul
      </Button>
    </div>
  );
}
