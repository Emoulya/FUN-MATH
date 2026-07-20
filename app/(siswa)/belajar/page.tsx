'use client';

// ============================================
// Halaman Belajar — Animasi Step-by-Step
// ============================================
// Menggunakan MathBoard mode 'animasi' + StepControls.
// Menampilkan cara mengerjakan soal langkah demi langkah.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MathBoard from '@/components/math/math-board';
import StepControls from '@/components/math/step-controls';
import { useAnimasi } from '@/hooks/use-animasi';
import { useTutorial } from '@/hooks/use-tutorial';
import { generateSoal } from '@/lib/soal-generator';
import { OPERASI_LABEL } from '@/lib/constants';
import type { Operasi, Kesulitan } from '@/types/math';

export default function BelajarPage() {
  const router = useRouter();
  const animasi = useAnimasi();
  const [operasi, setOperasi] = useState<Operasi>('penjumlahan');
  const [kesulitan, setKesulitan] = useState<Kesulitan>('mudah');
  const [isFromLatihan, setIsFromLatihan] = useState(false);
  const { isTutorial: isTutorialActive, tutorialStep, setStep } = useTutorial();

  const isTutorial = isTutorialActive && tutorialStep === 'BELAJAR';

  // Load pilihan dari sessionStorage atau query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qAngka1 = params.get('angka1');
    const qAngka2 = params.get('angka2');
    const qOperasi = params.get('operasi') as Operasi | null;
    const fromLatihan = params.get('fromLatihan') === 'true';

    if (qAngka1 && qAngka2 && qOperasi) {
      setOperasi(qOperasi);
      animasi.setSoal(parseInt(qAngka1, 10), parseInt(qAngka2, 10), qOperasi, 'mudah');
      setIsFromLatihan(true);
    } else {
      const op = sessionStorage.getItem('operasi') as Operasi | null;
      const ks = sessionStorage.getItem('kesulitan') as Kesulitan | null;
      if (op) setOperasi(op);
      if (ks) setKesulitan(ks);

      // Generate soal awal
      const soal = generateSoal(op ?? 'penjumlahan', ks ?? 'mudah');
      animasi.setSoal(soal.angka1, soal.angka2, soal.operasi, ks ?? 'mudah');
      setIsFromLatihan(false);
    }
  }, []);

  const handleCobaLatihan = async () => {
    if (isTutorial) {
      await setStep('LATIHAN');
    }
    router.push('/latihan');
  };

  // Generate soal baru
  const soalBaru = () => {
    const soal = generateSoal(operasi, kesulitan);
    animasi.setSoal(soal.angka1, soal.angka2, soal.operasi, kesulitan);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
      {/* Header dengan Tombol Kembali */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex items-center justify-between gap-4"
      >
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-xl w-9 h-9 shrink-0"
          onClick={() => router.push('/pilih-operasi')}
          disabled={isTutorial}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="text-center flex-1 pr-9">
          <h2 className="text-xl font-bold">
            📖 Belajar {OPERASI_LABEL[operasi]}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Perhatikan langkah demi langkah
          </p>
        </div>
      </motion.div>

      {/* MathBoard — mode animasi */}
      {animasi.perhitungan && (
        <MathBoard
          angka1={animasi.perhitungan.angka1}
          angka2={animasi.perhitungan.angka2}
          operasi={operasi}
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
        <p className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: animasi.penjelasan }} />
      </motion.div>

      {/* Kontrol navigasi */}
      <StepControls
        langkahSekarang={animasi.langkahSekarang}
        totalLangkah={animasi.totalLangkah}
        isPlaying={animasi.isPlaying}
        onPrev={animasi.prevStep}
        onNext={animasi.nextStep}
        onReset={animasi.reset}
        onTogglePlay={animasi.togglePlay}
      />

      {/* Tombol aksi */}
      <div className="flex gap-3">
        {isFromLatihan ? (
          // Jika datang dari Latihan, hanya tampilkan tombol "Lanjut Latihan?" saat langkah selesai
          animasi.langkahSekarang === animasi.totalLangkah - 1 && (
            <Button
              variant="default"
              onClick={() => router.push('/latihan?resetActiveSoal=true')}
              className="gap-2 ring-4 ring-primary ring-offset-2 animate-bounce font-bold"
            >
              🎯 Lanjut Latihan?
            </Button>
          )
        ) : (
          <>
            <Button
              variant="outline"
              onClick={soalBaru}
              className="gap-2"
              disabled={isTutorial}
            >
              <RefreshCw className="w-4 h-4" />
              Soal Baru
            </Button>
            <div className="relative">
              {isTutorial && animasi.langkahSekarang === animasi.totalLangkah - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-blue-600 px-3 py-1 rounded-full font-bold shadow-lg border-2 border-blue-200 text-sm z-10"
                >
                  Lanjut ke Latihan! 👇
                </motion.div>
              )}
              <Button
                variant="default"
                onClick={handleCobaLatihan}
                className={isTutorial && animasi.langkahSekarang === animasi.totalLangkah - 1 ? 'ring-4 ring-primary ring-offset-2 animate-bounce' : ''}
              >
                ✏️ Coba Latihan
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
