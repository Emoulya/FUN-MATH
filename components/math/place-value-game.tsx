'use client';

// ============================================
// PlaceValueGame — Game Isian Nilai Tempat
// ============================================
// Siswa melihat representasi balok Base-10, lalu mengisi:
// __ puluhan __ satuan = __
// Tanpa timer, tanpa skor ketat — sesuai prinsip AHD.

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Base10Blocks from '@/components/math/base10-blocks';
import { MIN_SOAL_GAME } from '@/lib/constants';

interface PlaceValueGameProps {
  /** Jumlah soal dalam game */
  jumlahSoal?: number;
  /** Callback saat semua soal selesai */
  onSelesai: () => void;
}

/** Generate angka acak 2 digit (10-99) */
function generateAngka(): number {
  return Math.floor(Math.random() * 90) + 10;
}

type SoalState = 'mengerjakan' | 'benar' | 'salah';

export default function PlaceValueGame({
  jumlahSoal = MIN_SOAL_GAME,
  onSelesai,
}: PlaceValueGameProps) {
  const [angka, setAngka] = useState(() => generateAngka());
  const [indexSoal, setIndexSoal] = useState(0);
  const [inputPuluhan, setInputPuluhan] = useState('');
  const [inputSatuan, setInputSatuan] = useState('');
  const [inputAngka, setInputAngka] = useState('');
  const [soalState, setSoalState] = useState<SoalState>('mengerjakan');

  const puluhanRef = useRef<HTMLInputElement>(null);
  const satuanRef = useRef<HTMLInputElement>(null);
  const angkaRef = useRef<HTMLInputElement>(null);

  const puluhanBenar = Math.floor(angka / 10);
  const satuanBenar = angka % 10;

  const selesaiSemua = indexSoal >= jumlahSoal;

  // Focus input puluhan saat soal baru
  useEffect(() => {
    if (soalState === 'mengerjakan') {
      puluhanRef.current?.focus();
    }
  }, [angka, soalState]);

  /** Periksa jawaban */
  const periksaJawaban = useCallback(() => {
    const p = parseInt(inputPuluhan, 10);
    const s = parseInt(inputSatuan, 10);
    const a = parseInt(inputAngka, 10);

    if (p === puluhanBenar && s === satuanBenar && a === angka) {
      setSoalState('benar');
    } else {
      setSoalState('salah');
      // Kembali ke mengerjakan setelah 1.5 detik
      setTimeout(() => {
        setSoalState('mengerjakan');
      }, 1500);
    }
  }, [inputPuluhan, inputSatuan, inputAngka, puluhanBenar, satuanBenar, angka]);

  /** Lanjut ke soal berikutnya */
  const soalBerikutnya = useCallback(() => {
    const nextIndex = indexSoal + 1;
    setIndexSoal(nextIndex);

    if (nextIndex >= jumlahSoal) {
      return; // Akan tampilkan tombol "Lanjut"
    }

    setAngka(generateAngka());
    setInputPuluhan('');
    setInputSatuan('');
    setInputAngka('');
    setSoalState('mengerjakan');
  }, [indexSoal, jumlahSoal]);

  /** Handle input — auto pindah ke field berikutnya */
  const handleInputPuluhan = (val: string) => {
    const filtered = val.replace(/\D/g, '').slice(0, 1);
    setInputPuluhan(filtered);
    if (filtered.length === 1) {
      satuanRef.current?.focus();
    }
  };

  const handleInputSatuan = (val: string) => {
    const filtered = val.replace(/\D/g, '').slice(0, 1);
    setInputSatuan(filtered);
    if (filtered.length === 1) {
      angkaRef.current?.focus();
    }
  };

  const handleInputAngka = (val: string) => {
    const filtered = val.replace(/\D/g, '').slice(0, 2);
    setInputAngka(filtered);
  };

  /** Handle keyboard Enter */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && soalState === 'mengerjakan') {
      periksaJawaban();
    }
  };

  // Tampilan selesai
  if (selesaiSemua) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 p-6"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: 2, duration: 0.4 }}
          className="text-5xl"
        >
          🎉
        </motion.div>
        <p className="text-lg font-bold text-center">
          Hebat! Kamu sudah mengenal nilai tempat!
        </p>
        <Button onClick={onSelesai} size="lg" className="gap-2">
          Lanjut <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-semibold">
          Soal {indexSoal + 1} dari {jumlahSoal}
        </span>
      </div>

      {/* Visualisasi balok */}
      <AnimatePresence mode="wait">
        <motion.div
          key={angka}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Base10Blocks angka={angka} tampilkanLabel={false} animasi ukuran="md" />
        </motion.div>
      </AnimatePresence>

      {/* Form isian */}
      <motion.div
        key={`form-${angka}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 flex-wrap justify-center"
        onKeyDown={handleKeyDown}
      >
        {/* Input puluhan */}
        <div className="flex items-center gap-1.5">
          <input
            ref={puluhanRef}
            type="text"
            inputMode="numeric"
            value={inputPuluhan}
            onChange={(e) => handleInputPuluhan(e.target.value)}
            disabled={soalState !== 'mengerjakan'}
            className={`input-box w-12 h-14 text-xl ${
              soalState === 'benar'
                ? 'input-box--correct'
                : soalState === 'salah'
                  ? 'input-box--wrong'
                  : ''
            }`}
            aria-label="Jumlah puluhan"
          />
          <span className="text-sm font-bold" style={{ color: 'var(--block-puluhan)' }}>
            puluhan
          </span>
        </div>

        {/* Input satuan */}
        <div className="flex items-center gap-1.5">
          <input
            ref={satuanRef}
            type="text"
            inputMode="numeric"
            value={inputSatuan}
            onChange={(e) => handleInputSatuan(e.target.value)}
            disabled={soalState !== 'mengerjakan'}
            className={`input-box w-12 h-14 text-xl ${
              soalState === 'benar'
                ? 'input-box--correct'
                : soalState === 'salah'
                  ? 'input-box--wrong'
                  : ''
            }`}
            aria-label="Jumlah satuan"
          />
          <span className="text-sm font-bold" style={{ color: 'var(--block-satuan)' }}>
            satuan
          </span>
        </div>

        {/* Separator */}
        <span className="text-xl font-bold mx-1">=</span>

        {/* Input angka */}
        <input
          ref={angkaRef}
          type="text"
          inputMode="numeric"
          value={inputAngka}
          onChange={(e) => handleInputAngka(e.target.value)}
          disabled={soalState !== 'mengerjakan'}
          className={`input-box w-16 h-14 text-xl ${
            soalState === 'benar'
              ? 'input-box--correct'
              : soalState === 'salah'
                ? 'input-box--wrong'
                : ''
          }`}
          aria-label="Angka lengkap"
        />
      </motion.div>

      {/* Feedback & aksi */}
      <AnimatePresence mode="wait">
        {soalState === 'mengerjakan' && (
          <motion.div
            key="periksa"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              onClick={periksaJawaban}
              disabled={!inputPuluhan || !inputSatuan || !inputAngka}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Periksa
            </Button>
          </motion.div>
        )}

        {soalState === 'benar' && (
          <motion.div
            key="benar"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: 1, duration: 0.3 }}
                className="text-3xl"
              >
                ✅
              </motion.span>
              <span className="font-bold text-lg" style={{ color: 'var(--input-correct-border)' }}>
                Benar!
              </span>
            </div>
            <Button onClick={soalBerikutnya} className="gap-2">
              {indexSoal + 1 >= jumlahSoal ? 'Selesai' : 'Soal Berikutnya'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {soalState === 'salah' && (
          <motion.div
            key="salah"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">🤔</span>
            <span className="text-sm font-medium" style={{ color: 'var(--input-wrong-border)' }}>
              Coba lagi ya!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
