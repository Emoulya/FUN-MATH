'use client';

// ============================================
// Modul 1B — Hitung Sederhana (Tanpa Simpan/Pinjam)
// ============================================
// Penjelasan konsep hitung sederhana (3 penjumlahan + 3 pengurangan contoh).
// Setelah penjelasan selesai, siswa langsung lanjut ke sesi latihan (6 soal interaktif).
// Menyimpan progres ke database Supabase setelah selesai latihan.

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ErrorBoundary } from 'react-error-boundary';
import SimpleMathDemo from '@/components/math/simple-math-demo';
import MathBoard from '@/components/math/math-board';
import FeedbackOverlay from '@/components/math/feedback-overlay';
import { useLatihan } from '@/hooks/use-latihan';
import { useModulProgress } from '@/hooks/use-modul-progress';
import { MODUL1B_SOAL } from '@/lib/dataset-soal';
import { MAX_PERCOBAAN, STORAGE_KEY_FROM_MODUL } from '@/lib/constants';

function ErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
      <span className="text-4xl">⚠️</span>
      <p className="text-sm text-muted-foreground text-center">
        Terjadi kesalahan. Coba refresh halaman.
      </p>
      <Button onClick={resetErrorBoundary}>Coba Lagi</Button>
    </div>
  );
}

export default function Modul1BPage() {
  const router = useRouter();
  const latihan = useLatihan();
  const { selesaikanModul } = useModulProgress();

  const [layar, setLayar] = useState<'belajar' | 'latihan'>('belajar');
  const sesiMulaiRef = useRef(0);

  // Callback saat penjelasan konsep/demo selesai
  const handleDemoSelesai = useCallback(() => {
    setLayar('latihan');
    // Acak atau berurutan: Gunakan dataset statis MODUL1B_SOAL
    latihan.mulaiSesi(MODUL1B_SOAL);
    sesiMulaiRef.current = Date.now();
  }, [latihan]);

  // Saat sesi latihan selesai → simpan ke DB + tandai modul selesai
  useEffect(() => {
    if (!latihan.sesiSelesai || layar !== 'latihan') return;

    const rekap = latihan.rekap;
    const benar = rekap.filter((r) => r.status === 'benar').length;
    const salah = rekap.filter((r) => r.status !== 'benar').length;
    const skor = rekap.length > 0 ? Math.round((benar / rekap.length) * 100) : 0;

    // Simpan ke database (fire-and-forget)
    fetch('/api/sesi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siswa_id: sessionStorage.getItem('siswaId'),
        operasi: 'penjumlahan', // default category
        skor,
        total_soal: rekap.length,
        benar,
        salah,
        durasi_detik: Math.floor((Date.now() - sesiMulaiRef.current) / 1000),
        tipe: 'modul',
        detail: rekap.map((r) => ({
          soal: { angka1: r.soal.angka1, angka2: r.soal.angka2, operasi: r.soal.operasi },
          jawaban_siswa: r.jawabanSiswa,
          status: r.status,
          jumlah_percobaan: r.jumlahPercobaan,
          waktu_detik: r.waktuDetik,
        })),
      }),
    }).catch(() => {});

    // Tandai modul selesai
    selesaikanModul('modul1b');

    // Simpan rekap untuk halaman rekap
    sessionStorage.setItem('rekap', JSON.stringify(rekap));
    sessionStorage.setItem('operasi', 'penjumlahan');
    sessionStorage.setItem(STORAGE_KEY_FROM_MODUL, 'modul1b');
    router.push('/rekap');
  }, [latihan.sesiSelesai, latihan.rekap, layar, router, selesaikanModul]);

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
          {layar === 'belajar'
            ? 'Pahami penambahan dan pengurangan dasar'
            : `Soal ${latihan.indexSoal + 1}/${latihan.totalSoal}`}
        </p>
      </motion.div>

      {/* Konten */}
      <AnimatePresence mode="wait">
        {layar === 'belajar' ? (
          <motion.div
            key="belajar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            <SimpleMathDemo onSelesai={handleDemoSelesai} />
          </motion.div>
        ) : (
          <motion.div
            key="latihan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 w-full max-w-sm"
          >
            {/* Progress bar */}
            <div className="w-full">
              <Progress
                value={(latihan.indexSoal / latihan.totalSoal) * 100}
                className="h-2"
              />
            </div>

            {/* MathBoard mode latihan */}
            {latihan.soalAktif && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <MathBoard
                  angka1={latihan.soalAktif.angka1}
                  angka2={latihan.soalAktif.angka2}
                  operasi={latihan.soalAktif.operasi}
                  mode="latihan"
                  jawabanState={latihan.jawabanState}
                  carryJawabanState={latihan.carryJawabanState}
                  onJawaban={latihan.isiJawaban}
                  onCarryJawaban={latihan.isiCarryJawaban}
                  carryVisible={latihan.carryVisible}
                  borrowVisible={latihan.borrowVisible}
                />
              </ErrorBoundary>
            )}

            {/* Status benar/revealed */}
            {latihan.state === 'SELESAI_BENAR' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: 2, duration: 0.3 }}
                  className="text-4xl"
                >
                  🎉
                </motion.span>
                <p className="font-bold text-lg" style={{ color: 'var(--input-correct-border)' }}>
                  Benar! Hebat!
                </p>
                <Button onClick={latihan.soalBerikutnya} className="gap-2">
                  Soal Berikutnya →
                </Button>
              </motion.div>
            )}

            {latihan.state === 'REVEALED' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <span className="text-3xl">💡</span>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Tidak apa-apa! Perhatikan jawabannya.
                </p>
                <Button onClick={latihan.soalBerikutnya} className="gap-2">
                  Soal Berikutnya →
                </Button>
              </motion.div>
            )}

            {/* Tombol lewati */}
            {(latihan.state === 'MENGERJAKAN' || latihan.state === 'WRONG') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={latihan.lewatiSoal}
                className="text-xs text-muted-foreground gap-1"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Lewati
              </Button>
            )}

            {/* Feedback overlay */}
            <FeedbackOverlay
              visible={latihan.state === 'WRONG' && latihan.feedbackPesan !== ''}
              pesan={latihan.feedbackPesan}
              hint={latihan.feedbackHint}
              kolomSalah={latihan.kolomSalah ?? undefined}
              percobaan={latihan.percobaanAktif}
              maxPercobaan={MAX_PERCOBAAN}
              onCobaLagi={latihan.cobaLagi}
              onLihatCara={latihan.lihatCara}
              onTutup={latihan.tutupFeedback}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tombol kembali ke peta modul */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/modul')}
        className="text-xs text-muted-foreground gap-1.5 mt-4"
      >
        <ArrowLeft className="w-3 h-3" />
        Kembali ke Peta Modul
      </Button>
    </div>
  );
}
