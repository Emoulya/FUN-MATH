'use client';

// ============================================
// Modul 3 — Pengurangan Meminjam
// ============================================
// Layar 1: Penjelasan step-by-step (MathBoard mode animasi)
// Layar 2: Latihan 5 soal (MathBoard mode latihan)
// Struktur sama dengan Modul 2, operasi: pengurangan.

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, RefreshCw, SkipForward } from 'lucide-react';
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
import { generateSoal, generateSesiSoalBerurutan } from '@/lib/soal-generator';
import { MAX_PERCOBAAN, SOAL_PER_SESI, STORAGE_KEY_FROM_MODUL } from '@/lib/constants';

type Layar = 'belajar' | 'latihan';

/** Fallback ErrorBoundary */
function ErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-center max-w-sm mx-auto my-10">
      <h3 className="font-bold mb-2">Terjadi Kesalahan!</h3>
      <p className="text-sm mb-4">
        Ada masalah saat menampilkan modul ini.
      </p>
      <Button onClick={resetErrorBoundary}>Coba Lagi</Button>
    </div>
  );
}

export default function Modul3Page() {
  const router = useRouter();
  const animasi = useAnimasi();
  const latihan = useLatihan();
  const { selesaikanModul } = useModulProgress();
  const [layar, setLayar] = useState<Layar>('belajar');
  const { isTutorial } = useTutorial();
  const sesiMulaiRef = useRef(0);

  useEffect(() => {
    const soal = generateSoal('pengurangan', 'mudah');
    animasi.setSoal(soal.angka1, soal.angka2, 'pengurangan', 'mudah');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mulai latihan
  const mulaiLatihan = useCallback(() => {
    setLayar('latihan');
    sessionStorage.setItem('operasi', 'pengurangan');
    sessionStorage.setItem('kesulitan', 'mudah');
    // Soal berurutan dari mudah → sulit (bukan acak, sesuai feedback Prof)
    const soalList = generateSesiSoalBerurutan('pengurangan', SOAL_PER_SESI);
    latihan.mulaiSesi(soalList);
    sesiMulaiRef.current = Date.now();
  }, [latihan]);

  // Generate soal belajar baru
  const soalBaruBelajar = useCallback(() => {
    const soal = generateSoal('pengurangan', 'mudah');
    animasi.setSoal(soal.angka1, soal.angka2, 'pengurangan', 'mudah');
  }, [animasi]);

  // Saat sesi latihan selesai
  useEffect(() => {
    if (!latihan.sesiSelesai) return;

    const rekap = latihan.rekap;
    const benar = rekap.filter((r) => r.status === 'benar').length;
    const salah = rekap.filter((r) => r.status !== 'benar').length;
    const skor = rekap.length > 0 ? Math.round((benar / rekap.length) * 100) : 0;

    fetch('/api/sesi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siswa_id: sessionStorage.getItem('siswaId'),
        operasi: 'pengurangan',
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

    selesaikanModul('modul3');

    sessionStorage.setItem('rekap', JSON.stringify(rekap));
    sessionStorage.setItem('operasi', 'pengurangan');
    sessionStorage.setItem(STORAGE_KEY_FROM_MODUL, 'modul3');
    router.push('/rekap');
  }, [latihan.sesiSelesai, latihan.rekap, router, selesaikanModul]);

  return (
    <div className="flex-1 flex flex-col items-center gap-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-xl font-bold">➖ Pengurangan Meminjam</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {layar === 'belajar'
            ? 'Perhatikan cara meminjam (borrow)'
            : `Soal ${latihan.indexSoal + 1}/${latihan.totalSoal}`}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {layar === 'belajar' ? (
          <motion.div
            key="belajar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            {animasi.perhitungan && (
              <>
                <MathBoard
                  angka1={animasi.perhitungan.angka1}
                  angka2={animasi.perhitungan.angka2}
                  operasi="pengurangan"
                  mode="animasi"
                  langkahAktif={animasi.langkahSekarang}
                  carryVisible={animasi.carryVisible}
                  borrowVisible={animasi.borrowVisible}
                  perhitunganOverride={animasi.perhitungan}
                />
              </>
            )}

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

            <StepControls
              langkahSekarang={animasi.langkahSekarang}
              totalLangkah={animasi.totalLangkah}
              isPlaying={animasi.isPlaying}
              onPrev={animasi.prevStep}
              onNext={animasi.nextStep}
              onReset={animasi.reset}
              onTogglePlay={animasi.togglePlay}
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={soalBaruBelajar} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Contoh Lain
              </Button>
              <Button onClick={isTutorial ? () => { 
                selesaikanModul('modul3'); 
                router.push('/modul'); 
              } : mulaiLatihan} className="gap-2">
                {isTutorial ? "Selesai & Lanjut" : "Mulai Latihan"}
                <ArrowRight className="w-4 h-4" />
              </Button>
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
            <div className="w-full">
              <Progress
                value={(latihan.indexSoal / latihan.totalSoal) * 100}
                className="h-2"
              />
            </div>

            {latihan.soalAktif && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <>
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
                </>
              </ErrorBoundary>
            )}

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
