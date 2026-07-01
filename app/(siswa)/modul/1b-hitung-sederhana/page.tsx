'use client';

// ============================================
// Modul 1B — Hitung Sederhana (Tanpa Simpan/Pinjam)
// ============================================
// Contoh penjumlahan dan pengurangan sederhana.
// Scaffolding: gambar balok dulu → angka (hitung susun).
// Setelah selesai → tandai modul1b completed → unlock modul2

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SimpleMathDemo from '@/components/math/simple-math-demo';
import { useModulProgress } from '@/hooks/use-modul-progress';

export default function Modul1BPage() {
  const router = useRouter();
  const { selesaikanModul } = useModulProgress();

  const handleSelesai = useCallback(() => {
    selesaikanModul('modul1b');
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
        <h2 className="text-xl font-bold">🔢 Hitung Sederhana</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tambah dan kurang tanpa simpan atau pinjam
        </p>
      </motion.div>

      {/* Demo konten */}
      <SimpleMathDemo onSelesai={handleSelesai} />

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
