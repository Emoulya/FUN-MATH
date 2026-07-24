'use client';

// ============================================
// Halaman Latihan — Sesi Latihan Interaktif
// ============================================
// MathBoard mode 'latihan' + state machine useLatihan.
// Validasi real-time per kolom, hint system, feedback overlay.
// Timer per soal. Simpan ke DB setelah sesi selesai.

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Timer, SkipForward, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ErrorBoundary } from 'react-error-boundary';
import MathBoard from '@/components/math/math-board';
import FeedbackOverlay from '@/components/math/feedback-overlay';
import { useLatihan } from '@/hooks/use-latihan';
import { generateSesiSoal } from '@/lib/soal-generator';
import { OPERASI_LABEL, MAX_PERCOBAAN, SOAL_PER_SESI, TIMER_DEFAULT_DETIK } from '@/lib/constants';
import type { Operasi, Kesulitan } from '@/types/math';

/** Fallback saat ErrorBoundary menangkap error */
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

export default function LatihanPage() {
  const router = useRouter();
  const latihan = useLatihan('latihan_mandiri');
  const [operasi, setOperasi] = useState<Operasi>('penjumlahan');
  const [kesulitan, setKesulitan] = useState<Kesulitan>('mudah');
  const [timerDetik, setTimerDetik] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('latihan_mandiri_timer');
      if (saved) return parseInt(saved, 10);
    }
    return TIMER_DEFAULT_DETIK;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const sesiMulaiRef = useRef(Date.now());

  // Simpan referensi fungsi yang stabil untuk dipakai di timer
  const lewatiSoalRef = useRef(latihan.lewatiSoal);
  lewatiSoalRef.current = latihan.lewatiSoal;

  // Simpan timer ke localStorage
  useEffect(() => {
    localStorage.setItem('latihan_mandiri_timer', timerDetik.toString());
  }, [timerDetik]);

  // Load pilihan dan mulai sesi
  useEffect(() => {
    sessionStorage.setItem('rekapSource', 'latihan');
    sessionStorage.removeItem('fromModul');
    const op = sessionStorage.getItem('operasi') as Operasi | null;
    const ks = sessionStorage.getItem('kesulitan') as Kesulitan | null;
    if (op) setOperasi(op);
    if (ks) setKesulitan(ks);

    // Cek apakah ada sesi latihan mandiri yang sedang berjalan
    const saved = localStorage.getItem('latihan_mandiri');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.daftarSoal && parsed.daftarSoal.length > 0) {
          setIsTimerRunning(true);
          sesiMulaiRef.current = parsed.waktuMulai || Date.now();
          return;
        }
      } catch (e) {
        console.error('Gagal memuat sesi latihan tersimpan:', e);
      }
    }

    const soalList = generateSesiSoal(op ?? 'penjumlahan', ks ?? 'mudah', SOAL_PER_SESI);
    latihan.mulaiSesi(soalList);
    setIsTimerRunning(true);
    sesiMulaiRef.current = Date.now();
  }, []);

  // Konfirmasi saat menutup/me-refresh tab browser
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (latihan.state === 'MENGERJAKAN' || latihan.state === 'WRONG') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [latihan.state]);

  // Intersepsi tombol Back browser menggunakan history.pushState
  useEffect(() => {
    if (latihan.state === 'MENGERJAKAN' || latihan.state === 'WRONG') {
      window.history.pushState(null, '', window.location.href);
      
      const handlePopState = () => {
        setShowExitConfirm(true);
        window.history.pushState(null, '', window.location.href);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [latihan.state]);

  // Timer countdown — gunakan ref untuk menghindari dependency pada object latihan
  useEffect(() => {
    if (!isTimerRunning || latihan.state !== 'MENGERJAKAN') return;

    const interval = setInterval(() => {
      setTimerDetik((prev) => {
        if (prev <= 1) {
          lewatiSoalRef.current();
          return TIMER_DEFAULT_DETIK;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, latihan.state]);

  // Reset timer saat soal berikutnya
  const handleSoalBerikutnya = useCallback(() => {
    setTimerDetik(TIMER_DEFAULT_DETIK);
    latihan.soalBerikutnya();
  }, [latihan]);

  // Ulangi pengerjaan soal jika kembali dari belajar ulang
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const doReset = params.get('resetActiveSoal') === 'true';
      if (doReset) {
        latihan.resetSoalAktif();
        setTimerDetik(TIMER_DEFAULT_DETIK);
        // Hapus query params agar tidak terus menerus reset saat refresh berikutnya
        router.replace('/latihan');
      }
    }
  }, [latihan.resetSoalAktif, router]);

  // Simpan sesi ke DB + navigasi ke rekap saat sesi selesai
  useEffect(() => {
    if (!latihan.sesiSelesai) return;

    // Bersihkan data simpanan
    localStorage.removeItem('latihan_mandiri');
    localStorage.removeItem('latihan_mandiri_timer');

    const rekap = latihan.rekap;
    const benar = rekap.filter((r) => r.status === 'benar').length;
    const salah = rekap.filter((r) => r.status !== 'benar').length;
    const skor = rekap.length > 0 ? Math.round((benar / rekap.length) * 100) : 0;

    // Kirim ke database (fire-and-forget)
    fetch('/api/sesi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siswa_id: sessionStorage.getItem('siswaId'),
        operasi,
        skor,
        total_soal: rekap.length,
        benar,
        salah,
        durasi_detik: Math.floor((Date.now() - sesiMulaiRef.current) / 1000),
        tipe: 'bebas',
        detail: rekap.map((r) => ({
          soal: { angka1: r.soal.angka1, angka2: r.soal.angka2, operasi: r.soal.operasi },
          jawaban_siswa: r.jawabanSiswa,
          status: r.status,
          jumlah_percobaan: r.jumlahPercobaan,
          waktu_detik: r.waktuDetik,
        })),
      }),
    }).catch(console.error);

    // Simpan rekap ke sessionStorage dan navigate
    sessionStorage.setItem('rekapSource', 'latihan');
    sessionStorage.removeItem('fromModul');
    sessionStorage.setItem('rekap', JSON.stringify(rekap));
    router.push('/rekap');
  }, [latihan.sesiSelesai, latihan.rekap, router, operasi]);

  // Format timer
  const formatTimer = (detik: number) => {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerColor = timerDetik <= 30
    ? 'text-red-500'
    : timerDetik <= 60
      ? 'text-amber-500'
      : 'text-muted-foreground';

  if (!latihan.soalAktif) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Menyiapkan soal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 relative">
      {/* Header info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 w-full max-w-sm"
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl w-9 h-9 shrink-0"
          onClick={() => {
            if (latihan.state === 'MENGERJAKAN' || latihan.state === 'WRONG') {
              setShowExitConfirm(true);
            } else {
              router.push('/pilih-operasi');
            }
          }}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        {/* Progress soal */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">
              ✏️ {OPERASI_LABEL[operasi]} — Soal {latihan.indexSoal + 1}/{latihan.totalSoal}
            </span>
            {/* Timer */}
            <div className={`flex items-center gap-1 font-mono font-bold ${timerColor}`}>
              <Timer className="w-3.5 h-3.5" />
              {formatTimer(timerDetik)}
            </div>
          </div>
          <Progress
            value={((latihan.indexSoal) / latihan.totalSoal) * 100}
            className="h-2"
          />
        </div>
      </motion.div>

      {/* MathBoard — mode latihan, dibungkus ErrorBoundary */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <MathBoard
          angka1={latihan.soalAktif.angka1}
          angka2={latihan.soalAktif.angka2}
          operasi={latihan.soalAktif.operasi}
          mode="latihan"
          jawabanState={latihan.jawabanState}
          carryJawabanState={latihan.carryJawabanState}
          barisPerkalianJawaban={latihan.barisPerkalianJawaban}
          barisPerkalianCarryJawaban={latihan.barisPerkalianCarryJawaban}
          onJawaban={latihan.isiJawaban}
          onCarryJawaban={latihan.isiCarryJawaban}
          onParsialJawaban={latihan.isiParsialJawaban}
          carryVisible={latihan.carryVisible}
          borrowVisible={latihan.borrowVisible}
        />
      </ErrorBoundary>

      {/* Status message */}
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
            <Button onClick={handleSoalBerikutnya} className="gap-2">
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
              Tidak apa-apa! Perhatikan jawabannya, lalu coba soal berikutnya.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (latihan.soalAktif) {
                    const { angka1, angka2, operasi } = latihan.soalAktif;
                    router.push(`/belajar?angka1=${angka1}&angka2=${angka2}&operasi=${operasi}&fromLatihan=true`);
                  } else {
                    router.push('/belajar');
                  }
                }}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Pelajari Dulu
              </Button>
              <Button onClick={handleSoalBerikutnya} className="gap-2">
                Soal Berikutnya →
              </Button>
            </div>
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

      {/* Dialog Konfirmasi Keluar (Ramah Anak) */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border-2 border-primary/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-4"
            >
              <div className="text-5xl">⚠️</div>
              <h3 className="text-lg font-bold text-foreground">Yakin ingin keluar?</h3>
              <p className="text-sm text-muted-foreground">
                Eits! Sayang sekali kalau kamu keluar sekarang, hasil latihanmu hari ini tidak akan tercatat dan kamu harus mengulang dari awal lagi. Yakin ingin keluar?
              </p>
              <div className="flex gap-3 w-full mt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Yuk Lanjut! 🚀
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold"
                  onClick={() => {
                    localStorage.removeItem('latihan_mandiri');
                    localStorage.removeItem('latihan_mandiri_timer');
                    setShowExitConfirm(false);
                    router.push('/pilih-operasi');
                  }}
                >
                  Keluar Saja
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
