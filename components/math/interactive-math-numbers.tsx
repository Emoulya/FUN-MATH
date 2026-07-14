'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Wand2 } from 'lucide-react';
import type { Operasi } from '@/types/math';
import { OPERASI_SIMBOL } from '@/lib/constants';

interface InteractiveMathNumbersProps {
  angka1: number;
  angka2: number;
  operasi: Operasi;
  onSelesai?: () => void;
  compact?: boolean;
}

export default function InteractiveMathNumbers({ angka1, angka2, operasi, onSelesai, compact = false }: InteractiveMathNumbersProps) {
  const isPenjumlahan = operasi === 'penjumlahan';
  const simbol = OPERASI_SIMBOL[operasi];
  
  const puluhan1 = Math.floor(angka1 / 10);
  const satuan1 = angka1 % 10;
  const puluhan2 = Math.floor(angka2 / 10);
  const satuan2 = angka2 % 10;

  const hasilSatuan = isPenjumlahan ? satuan1 + satuan2 : satuan1 - satuan2;
  const hasilPuluhan = isPenjumlahan ? puluhan1 + puluhan2 : puluhan1 - puluhan2;
  const hasilAkhir = isPenjumlahan ? angka1 + angka2 : angka1 - angka2;

  const [step, setStep] = useState<'satuan' | 'puluhan' | 'selesai'>(compact ? 'selesai' : 'satuan');
  const [satuanProcessed, setSatuanProcessed] = useState(compact ? true : false);
  const [puluhanProcessed, setPuluhanProcessed] = useState(compact ? true : false);

  const handleSatuanClick = () => {
    if (step !== 'satuan') return;
    setSatuanProcessed(true);
    setTimeout(() => {
      // Jika tidak ada puluhan2 (misal angka2 < 10), langsung selesai
      if (puluhan2 === 0) {
        setStep('selesai');
      } else {
        setStep('puluhan');
      }
    }, 600); // Tunggu animasi selesai
  };

  const handlePuluhanClick = () => {
    if (step !== 'puluhan') return;
    setPuluhanProcessed(true);
    setTimeout(() => {
      setStep('selesai');
    }, 600);
  };

  const handleOtomatis = () => {
    if (step === 'satuan') handleSatuanClick();
    else if (step === 'puluhan') handlePuluhanClick();
  };

  const instruksiSatuan = isPenjumlahan 
    ? `Klik angka ${satuan2} di kolom SATUAN (kanan) untuk ditambah!`
    : `Klik angka ${satuan2} di kolom SATUAN (kanan) untuk dikurang!`;
    
  const instruksiPuluhan = isPenjumlahan
    ? `Lanjut klik angka ${puluhan2} di kolom PULUHAN (kiri).`
    : `Lanjut klik angka ${puluhan2} di kolom PULUHAN (kiri).`;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Instruksi (Hanya tampil jika tidak compact) */}
      {!compact && (
      <div className={`text-center p-4 rounded-xl w-full shadow-sm transition-colors duration-500 ${step === 'selesai' ? 'bg-emerald-50 border border-emerald-200' : 'bg-blue-50 border border-blue-200'}`}>
        <h3 className="font-bold mb-3 text-lg">
          {isPenjumlahan ? 'Hitung Susun: Penjumlahan' : 'Hitung Susun: Pengurangan'}
        </h3>
        
        <div className="flex-col gap-2 text-left bg-white/60 p-3 rounded-lg inline-block border border-blue-200/50 shadow-sm mx-auto max-w-sm">
          <div className={`flex items-start gap-2 ${step !== 'satuan' ? 'opacity-70 text-slate-600' : 'font-bold text-blue-800'}`}>
            <span className="shrink-0 mt-0.5">1.</span>
            <span>{instruksiSatuan}</span>
            {step !== 'satuan' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          </div>
          {(step === 'puluhan' || step === 'selesai') && puluhan2 > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className={`flex items-start gap-2 ${step === 'selesai' ? 'opacity-70 text-slate-600' : 'font-bold text-blue-800'}`}
            >
              <span className="shrink-0 mt-0.5">2.</span>
              <span>{instruksiPuluhan}</span>
              {step === 'selesai' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            </motion.div>
          )}
          {step === 'selesai' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 font-bold text-emerald-600 mt-1">
              <CheckCircle2 className="w-4 h-4" /> Selesai {isPenjumlahan ? 'ditambahkan' : 'dikurangi'}!
            </motion.div>
          )}
        </div>
        
        {step !== 'selesai' && (
          <Button onClick={handleOtomatis} variant="secondary" size="sm" className="mt-3 gap-2">
            <Wand2 className="w-4 h-4" /> Kerjakan Otomatis
          </Button>
        )}
      </div>
      )}

      {/* Board Hitung Susun */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 relative min-w-[280px]">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-8 gap-y-6 text-6xl font-black tabular-nums">
          {/* Baris 1: Angka Atas */}
          <div /> {/* Kosong untuk kolom simbol */}
          <div className="text-center">{puluhan1 > 0 ? puluhan1 : ''}</div>
          <div className="text-center">{satuan1}</div>

          {/* Baris 2: Angka Bawah */}
          <div className="text-blue-500 self-end text-5xl font-bold">{simbol}</div>
          
          <div className="relative text-center flex justify-center items-center">
            {/* Highlight Puluhan */}
            {step === 'puluhan' && !puluhanProcessed && puluhan2 > 0 && (
               <div className="absolute inset-0 -m-3 bg-primary/20 ring-4 ring-primary rounded-xl animate-pulse" />
            )}

            {/* Bouncing Arrow Indicator */}
            {step === 'puluhan' && !puluhanProcessed && puluhan2 > 0 && (
              <motion.div 
                className="absolute -top-10 text-primary text-4xl"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                ↓
              </motion.div>
            )}

            {/* Sideways Label Indicator */}
            {(step === 'puluhan' || step === 'selesai') && puluhan2 > 0 && (
              <motion.div 
                className={`absolute right-full mr-4 flex items-center font-bold text-lg whitespace-nowrap bg-white/90 p-2 rounded-lg shadow-sm border z-20 ${step === 'puluhan' ? 'text-primary border-primary/20' : 'text-slate-400 border-slate-200 opacity-60'}`}
                animate={step === 'puluhan' ? { x: [0, 10, 0] } : { x: 0 }}
                transition={step === 'puluhan' ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                Lanjut ke Puluhan →
              </motion.div>
            )}

            {puluhan2 > 0 && (
              <motion.div
                className={`relative z-10 w-full rounded-lg ${step === 'puluhan' && !puluhanProcessed ? 'cursor-pointer hover:scale-110 text-primary bg-primary/10' : ''}`}
                onClick={() => step === 'puluhan' && handlePuluhanClick()}
                animate={!isPenjumlahan && puluhanProcessed ? { opacity: 0.3 } : {}}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {puluhan2}
              </motion.div>
            )}
          </div>
          
          <div className="relative text-center flex justify-center items-center">
            {/* Highlight Satuan */}
            {step === 'satuan' && !satuanProcessed && (
               <div className="absolute inset-0 -m-3 bg-primary/20 ring-4 ring-primary rounded-xl animate-pulse" />
            )}

            {/* Bouncing Arrow Indicator */}
            {step === 'satuan' && !satuanProcessed && (
              <motion.div 
                className="absolute -top-10 text-primary text-4xl"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                ↓
              </motion.div>
            )}

            {/* Sideways Label Indicator */}
            <motion.div 
              className={`absolute left-full ml-4 flex items-center font-bold text-lg whitespace-nowrap bg-white/90 p-2 rounded-lg shadow-sm border z-20 ${step === 'satuan' ? 'text-primary border-primary/20' : 'text-slate-400 border-slate-200 opacity-60'}`}
              animate={step === 'satuan' ? { x: [0, -10, 0] } : { x: 0 }}
              transition={step === 'satuan' ? { repeat: Infinity, duration: 1.5 } : {}}
            >
              ← Mulai dari Satuan
            </motion.div>

            <motion.div
              className={`relative z-10 w-full rounded-lg ${step === 'satuan' && !satuanProcessed ? 'cursor-pointer hover:scale-110 text-primary bg-primary/10' : ''}`}
              onClick={() => step === 'satuan' && handleSatuanClick()}
              animate={!isPenjumlahan && satuanProcessed ? { opacity: 0.3 } : {}}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {satuan2}
            </motion.div>
          </div>

          {/* Garis pemisah */}
          <div className="col-span-3 h-[4px] bg-slate-800 rounded-full my-[-8px]" />

          {/* Baris 3: Hasil */}
          <div />
          <div className="text-center text-blue-600">
            {puluhanProcessed && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                {hasilPuluhan > 0 ? hasilPuluhan : ''}
              </motion.div>
            )}
          </div>
          <div className="text-center text-blue-600">
            {satuanProcessed && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                {hasilSatuan}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Penjelasan Langkah */}
      <div className="flex flex-col gap-2 w-full">
        <AnimatePresence>
          {satuanProcessed && (
            <motion.div
              key="penjelasan-satuan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-card rounded-lg border border-border text-sm"
            >
              <span className="font-bold" style={{ color: 'var(--block-satuan)' }}>Kolom satuan:</span>{' '}
              {satuan1} {simbol} {satuan2} = {hasilSatuan}
            </motion.div>
          )}
          {puluhanProcessed && (
            <motion.div
              key="penjelasan-puluhan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-card rounded-lg border border-border text-sm"
            >
              <span className="font-bold" style={{ color: 'var(--block-puluhan)' }}>Kolom puluhan:</span>{' '}
              {puluhan1} {simbol} {puluhan2} = {hasilPuluhan}
            </motion.div>
          )}
          {step === 'selesai' && (
            <motion.div
              key="penjelasan-selesai"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-3 p-5 bg-emerald-50 rounded-2xl border border-emerald-200 mt-2 w-full text-center"
            >
              <div className="text-lg font-bold text-emerald-900 w-full">
                Hasil Akhir: {angka1} {simbol} {angka2} = {hasilAkhir}
              </div>
              {!compact && onSelesai && (
                <Button onClick={onSelesai} size="lg" className="gap-2 px-8 shadow-md mt-1">
                  Lanjut Belajar
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
