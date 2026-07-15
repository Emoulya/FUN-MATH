'use client';

// ============================================
// Modul 4 — Latihan Campuran
// ============================================
// 10 soal campuran (5 penjumlahan + 5 pengurangan, diacak).
// Langsung masuk latihan tanpa penjelasan.

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ErrorBoundary } from 'react-error-boundary';
import MathBoard from '@/components/math/math-board';
import FeedbackOverlay from '@/components/math/feedback-overlay';
import { useLatihan } from '@/hooks/use-latihan';
import { useModulProgress } from '@/hooks/use-modul-progress';
import { MODUL4_SOAL } from '@/lib/dataset-soal';

import {
  MAX_PERCOBAAN,
  STORAGE_KEY_FROM_MODUL,
} from '@/lib/constants';

/** Fallback ErrorBoundary */
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

export default function Modul4Page() {
  const router = useRouter();
  const latihan = useLatihan();
  const { selesaikanModul } = useModulProgress();
  const sesiMulaiRef = useRef(0);

  useEffect(() => {
    // Memuat 10 soal statis campuran (5 penjumlahan + 5 pengurangan) sesuai dataset
    latihan.mulaiSesi(MODUL4_SOAL);
    sesiMulaiRef.current = Date.now();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Saat sesi selesai
  useEffect(() => {
    if (!latihan.sesiSelesai) return;

    const rekap = latihan.rekap;
    const benar = rekap.filter((r) => r.status === 'benar').length;
    const salah = rekap.filter((r) => r.status !== 'benar').length;
    const skor = rekap.length > 0 ? Math.round((benar / rekap.length) * 100) : 0;

    // Simpan ke database sebagai sesi campuran (gunakan 'penjumlahan' sebagai operasi utama)
    fetch('/api/sesi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siswa_id: sessionStorage.getItem('siswaId'),
        operasi: 'penjumlahan', // label sesi (campuran tidak ada di type)
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

    selesaikanModul('modul4');

    sessionStorage.setItem('rekap', JSON.stringify(rekap));
    sessionStorage.setItem('operasi', 'penjumlahan');
    sessionStorage.setItem(STORAGE_KEY_FROM_MODUL, 'modul4');
    router.push('/rekap');
  }, [latihan.sesiSelesai, latihan.rekap, router, selesaikanModul]);

  if (!latihan.soalAktif) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Menyiapkan soal campuran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full max-w-sm"
      >
        <h2 className="text-xl font-bold">🔀 Latihan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Soal {latihan.indexSoal + 1}/{latihan.totalSoal}
          {' • '}
          <span className="font-bold">
            {latihan.soalAktif.operasi === 'penjumlahan' ? '➕ Tambah' : '➖ Kurang'}
          </span>
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <Progress
          value={(latihan.indexSoal / latihan.totalSoal) * 100}
          className="h-2"
        />
      </div>

      {/* MathBoard */}
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

      {/* Status messages */}
      <AnimatePresence mode="wait">
        {latihan.state === 'SELESAI_BENAR' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
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
            exit={{ opacity: 0 }}
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
      </AnimatePresence>

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
