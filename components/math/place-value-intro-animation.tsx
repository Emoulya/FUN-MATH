'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PlaceValueIntroAnimationProps {
  onSelesai: () => void;
}

export default function PlaceValueIntroAnimation({ onSelesai }: PlaceValueIntroAnimationProps) {
  const [jumlahSatuan, setJumlahSatuan] = useState(0);
  const [isMerged, setIsMerged] = useState(false);
  const [showBelasan, setShowBelasan] = useState(false);
  const [step, setStep] = useState<'counting' | 'full' | 'merging' | 'merged' | 'belasan'>('counting');

  useEffect(() => {
    if (step === 'counting') {
      const interval = setInterval(() => {
        setJumlahSatuan((prev) => {
          if (prev >= 9) {
            clearInterval(interval);
            setStep('full');
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'full') {
      const timer = setTimeout(() => {
        setStep('merging');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'merging') {
      const timer = setTimeout(() => {
        setIsMerged(true);
        setStep('merged');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'merged') {
      const timer = setTimeout(() => {
        setShowBelasan(true);
        setStep('belasan');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Penjelasan text berdasarkan step
  const getPenjelasan = () => {
    switch (step) {
      case 'counting':
        return `Ayo kumpulkan kotak satuan satu demi satu... <b>${jumlahSatuan} satuan</b>!`;
      case 'full':
        return `Hebat! Kita sudah mengumpulkan <b>10 kotak satuan</b>.`;
      case 'merging':
        return `Lihat! 10 kotak satuan berubah warna menjadi hijau...`;
      case 'merged':
        return `Dan bergabung menjadi <b>1 batang puluhan</b> yang kokoh!`;
      case 'belasan':
        return `Sekarang, jika kita tambah <b>1 kotak satuan</b> lagi, nilainya menjadi <b>11 (sebelas)</b>!`;
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md p-6 bg-card rounded-3xl border border-border shadow-xl">
      {/* Box Penjelasan */}
      <div className="text-center w-full min-h-[60px]">
        <p
          className="text-sm font-semibold text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: getPenjelasan() }}
        />
      </div>

      {/* Visualisasi Animasi */}
      <div className="relative flex items-end justify-center gap-8 w-full h-64 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6 overflow-hidden">
        
        {/* Wadah Satuan / Puluhan */}
        <div className="flex flex-col items-center gap-2 relative">
          {/* Label atas */}
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {step === 'counting' && (
                <motion.span
                  key={`cnt-${jumlahSatuan}`}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="text-lg font-bold text-blue-600"
                >
                  {jumlahSatuan}
                </motion.span>
              )}
              {step === 'full' && (
                <motion.span
                  key="full-label"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-lg font-black text-blue-600"
                >
                  10 Satuan
                </motion.span>
              )}
              {(step === 'merging' || step === 'merged' || step === 'belasan') && (
                <motion.span
                  key="puluhan-label"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-lg font-black text-emerald-600 flex items-center gap-1"
                >
                  1 Puluhan {step === 'merged' && <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Area Balok */}
          <div className="w-32 h-44 flex items-end justify-center p-2 relative">
            <AnimatePresence>
              {!isMerged ? (
                // Tampilan 10 satuan menumpuk
                <div className="flex flex-col-reverse gap-0.5 items-center w-full">
                  {Array.from({ length: jumlahSatuan }).map((_, idx) => {
                    const isGreen = step === 'merging';
                    return (
                      <motion.div
                        key={`satuan-block-${idx}`}
                        initial={{ y: -150, opacity: 0, scale: 0.5 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="rounded-[2px]"
                        style={{
                          width: 20,
                          height: 14,
                          backgroundColor: isGreen ? 'var(--block-puluhan)' : 'var(--block-satuan)',
                          border: isGreen 
                            ? '1.5px solid color-mix(in oklch, var(--block-puluhan) 70%, black)'
                            : '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                          transition: 'background-color 0.5s, border-color 0.5s',
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                // Batang puluhan hijau yang menyatu
                <motion.div
                  key="puluhan-solid"
                  initial={{ scaleY: 0.8, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="flex flex-col overflow-hidden rounded-[4px]"
                  style={{
                    width: 24,
                    height: 146, // Menyesuaikan tinggi 10 satuan + gap
                    transformOrigin: 'bottom',
                    border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
                    backgroundColor: 'var(--block-puluhan)',
                    gap: 0,
                  }}
                >
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '100%',
                        flex: 1,
                        backgroundColor: i % 2 === 0
                          ? 'color-mix(in oklch, var(--block-puluhan) 100%, transparent)'
                          : 'color-mix(in oklch, var(--block-puluhan) 70%, black 30%)',
                        borderBottom: i < 9 ? '1px solid color-mix(in oklch, var(--block-puluhan) 40%, black 60%)' : 'none',
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Kotak Satuan Tambahan untuk Belasan */}
        <AnimatePresence>
          {showBelasan && (
            <motion.div
              initial={{ x: 100, y: -50, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.5 }}
              className="flex flex-col items-center gap-2 relative"
            >
              <span className="text-lg font-bold text-blue-600 h-6">
                1 Satuan
              </span>
              <div className="w-20 h-44 flex items-end justify-center p-2">
                <div
                  className="rounded-[3px]"
                  style={{
                    width: 24,
                    height: 22,
                    backgroundColor: 'var(--block-satuan)',
                    border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button aksi */}
      <div className="w-full flex justify-end">
        <Button
          onClick={onSelesai}
          disabled={step !== 'belasan'}
          className="gap-2 px-6 shadow-md rounded-2xl"
        >
          Lanjut ke Game Mencocokkan
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
