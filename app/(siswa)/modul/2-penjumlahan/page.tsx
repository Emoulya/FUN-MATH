'use client';

// ============================================
// Modul 2 — Penjumlahan Menyimpan (Carry)
// ============================================
// Penjelasan konsep penjumlahan menyimpan dengan 3 contoh statis.
// Setelah selesai belajar, dilanjutkan dengan latihan 5 soal statis yang divalidasi kolom per kolom.
// Menyimpan progres ke database Supabase setelah selesai latihan.

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, RefreshCw, SkipForward, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ErrorBoundary } from 'react-error-boundary';
import MathBoard from '@/components/math/math-board';
import StepControls from '@/components/math/step-controls';
import FeedbackOverlay from '@/components/math/feedback-overlay';
import { useAnimasi } from '@/hooks/use-animasi';
import { useLatihan } from '@/hooks/use-latihan';
import { useModulProgress } from '@/hooks/use-modul-progress';
import { useTutorial } from '@/hooks/use-tutorial';
import { MODUL2_CONTOH, MODUL2_SOAL } from '@/lib/dataset-soal';
import { MAX_PERCOBAAN, STORAGE_KEY_FROM_MODUL } from '@/lib/constants';

type Layar = 'belajar' | 'latihan';

function ErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
      <span className="text-4xl">⚠️</span>
      <p className="text-sm text-red-500 font-medium">
        Ada masalah saat menampilkan modul ini.
      </p>
      <Button onClick={resetErrorBoundary}>Coba Lagi</Button>
    </div>
  );
}

export default function Modul2Page() {
  const router = useRouter();
  const animasi = useAnimasi();
  const latihan = useLatihan();
  const { selesaikanModul } = useModulProgress();
  const [layar, setLayar] = useState<Layar>('belajar');
  const [indexContoh, setIndexContoh] = useState(0); // 0, 1, 2 contoh
  const { isTutorial } = useTutorial();
  const sesiMulaiRef = useRef(0);

  // Load soal contoh berdasarkan indexContoh
  useEffect(() => {
    const soal = MODUL2_CONTOH[indexContoh];
    if (soal) {
      animasi.setSoal(soal.angka1, soal.angka2, 'penjumlahan', soal.kesulitan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexContoh]);

  // Mulai latihan saat pindah ke layar latihan
  const mulaiLatihan = useCallback(() => {
    setLayar('latihan');
    sessionStorage.setItem('operasi', 'penjumlahan');
    sessionStorage.setItem('kesulitan', 'mudah');
    // Mulai sesi latihan dengan dataset statis MODUL2_SOAL
    latihan.mulaiSesi(MODUL2_SOAL);
    sesiMulaiRef.current = Date.now();
  }, [latihan]);

  const contohBerikutnya = useCallback(() => {
    if (indexContoh < 2) {
      setIndexContoh((prev) => prev + 1);
    }
  }, [indexContoh]);

  const contohSebelumnya = useCallback(() => {
    if (indexContoh > 0) {
      setIndexContoh((prev) => prev - 1);
    }
  }, [indexContoh]);

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
        operasi: 'penjumlahan',
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
    selesaikanModul('modul2');

    // Simpan rekap untuk halaman rekap
    sessionStorage.setItem('rekap', JSON.stringify(rekap));
    sessionStorage.setItem('operasi', 'penjumlahan');
    sessionStorage.setItem(STORAGE_KEY_FROM_MODUL, 'modul2');
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
        <h2 className="text-xl font-bold">➕ Penjumlahan Menyimpan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {layar === 'belajar'
            ? `Contoh Penjelasan ${indexContoh + 1}/3`
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
            className="flex flex-col items-center gap-6"
          >
            {/* MathBoard mode animasi */}
            {animasi.perhitungan && (
              <MathBoard
                angka1={animasi.perhitungan.angka1}
                angka2={animasi.perhitungan.angka2}
                operasi="penjumlahan"
                mode="animasi"
                langkahAktif={animasi.langkahSekarang}
                carryVisible={animasi.carryVisible}
                borrowVisible={animasi.borrowVisible}
                perhitunganOverride={animasi.perhitungan}
              />
            )}

            {/* Penjelasan langkah */}
            <motion.div
              key={animasi.langkahSekarang}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center px-4 py-3 bg-card rounded-xl border border-border max-w-sm"
            >
              <p
                className="text-sm font-medium"
                dangerouslySetInnerHTML={{ __html: animasi.penjelasan }}
              />
            </motion.div>

            {/* Kontrol animasi */}
            <StepControls
              langkahSekarang={animasi.langkahSekarang}
              totalLangkah={animasi.totalLangkah}
              isPlaying={animasi.isPlaying}
              onPrev={animasi.prevStep}
              onNext={animasi.nextStep}
              onReset={animasi.reset}
              onTogglePlay={animasi.togglePlay}
            />

            {/* Tombol aksi penjelasan */}
            <div className="flex gap-3 justify-center items-center mt-2">
              {/* Tombol Contoh Sebelumnya */}
              {indexContoh > 0 && (
                <Button variant="outline" onClick={contohSebelumnya} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Sebelumnya
                </Button>
              )}

              {/* Tombol Contoh Berikutnya / Mulai Latihan */}
              {indexContoh < 2 ? (
                <Button variant="outline" onClick={contohBerikutnya} className="gap-2 border-primary/50 text-primary">
                  Contoh Berikutnya
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={isTutorial ? () => { selesaikanModul('modul2'); router.push('/modul'); } : mulaiLatihan} className="gap-2 shadow-md">
                  {isTutorial ? "Selesai & Lanjut" : "Mulai Latihan"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
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
        className="text-xs text-muted-foreground gap-1.5"
      >
        <ArrowLeft className="w-3 h-3" />
        Kembali ke Peta Modul
      </Button>
    </div>
  );
}
