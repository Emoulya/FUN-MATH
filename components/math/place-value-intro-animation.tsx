'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, SkipBack, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface PlaceValueIntroAnimationProps {
  onSelesai: () => void;
}

export default function PlaceValueIntroAnimation({ onSelesai }: PlaceValueIntroAnimationProps) {
  // Fase 1: Pengenalan (angka 11)
  // Fase 2: Contoh Angka Puluhan (angka 23)
  // Fase 3: Contoh Angka 3 Puluhan (angka 35)
  const [fase, setFase] = useState<1 | 2 | 3>(1);

  // States Fase 1
  const [jumlahSatuan, setJumlahSatuan] = useState(0);
  const [isMerged, setIsMerged] = useState(false);
  const [showBelasan, setShowBelasan] = useState(false);
  const [step, setStep] = useState<'counting' | 'full' | 'merging' | 'merged' | 'belasan' | 'gabung'>('counting');

  // States Fase 2
  const [jumlahSatuanFase2, setJumlahSatuanFase2] = useState(0);

  // States Fase 3
  const [jumlahSatuanFase3, setJumlahSatuanFase3] = useState(0);

  // Kontrol navigasi animasi manual
  const [langkahSekarang, setLangkahSekarang] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const totalLangkah = fase === 1 ? 6 : fase === 2 ? 4 : 4;

  // ============================================
  // EFFECT FASE 1
  // ============================================
  
  // Loop hitung satuan di Langkah 0 (Counting)
  useEffect(() => {
    if (fase === 1 && langkahSekarang === 0 && isPlaying) {
      const interval = setInterval(() => {
        setJumlahSatuan((prev) => {
          if (prev >= 10) {
            clearInterval(interval);
            setLangkahSekarang(1);
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [fase, langkahSekarang, isPlaying]);

  // Transisi otomatis langkah 1 -> 2 -> 3 -> 4 -> 5
  useEffect(() => {
    if (fase === 1 && langkahSekarang > 0 && langkahSekarang < 5 && isPlaying) {
      const delay = 2500;
      const timer = setTimeout(() => {
        setLangkahSekarang((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [fase, langkahSekarang, isPlaying]);

  // Sinkronisasi status visual Fase 1
  useEffect(() => {
    if (fase === 1) {
      if (langkahSekarang === 0) {
        setStep('counting');
        setJumlahSatuan(0);
        setIsMerged(false);
        setShowBelasan(false);
      } else if (langkahSekarang === 1) {
        setStep('full');
        setJumlahSatuan(10);
        setIsMerged(false);
        setShowBelasan(false);
      } else if (langkahSekarang === 2) {
        setStep('merging');
        setJumlahSatuan(10);
        setIsMerged(false);
        setShowBelasan(false);
      } else if (langkahSekarang === 3) {
        setStep('merged');
        setJumlahSatuan(10);
        setIsMerged(true);
        setShowBelasan(false);
      } else if (langkahSekarang === 4) {
        setStep('belasan');
        setJumlahSatuan(10);
        setIsMerged(true);
        setShowBelasan(true);
      } else if (langkahSekarang === 5) {
        setStep('gabung');
        setJumlahSatuan(10);
        setIsMerged(true);
        setShowBelasan(true);
      }
    }
  }, [fase, langkahSekarang]);

  // ============================================
  // EFFECT FASE 2 (CONTOH ANGKA 23)
  // ============================================

  // Loop hitung satuan di Fase 2 Langkah 1 (Counting)
  useEffect(() => {
    if (fase === 2 && langkahSekarang === 1 && isPlaying) {
      const interval = setInterval(() => {
        setJumlahSatuanFase2((prev) => {
          if (prev >= 3) {
            clearInterval(interval);
            setLangkahSekarang(2);
            return 3;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [fase, langkahSekarang, isPlaying]);

  // Transisi otomatis langkah Fase 2: 0 -> 1 dan 2 -> 3
  useEffect(() => {
    if (fase === 2 && isPlaying) {
      if (langkahSekarang === 0) {
        const timer = setTimeout(() => {
          setLangkahSekarang(1);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (langkahSekarang === 2) {
        const timer = setTimeout(() => {
          setLangkahSekarang(3);
        }, 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [fase, langkahSekarang, isPlaying]);

  // Sinkronisasi status visual Fase 2
  useEffect(() => {
    if (fase === 2) {
      if (langkahSekarang === 0) {
        setJumlahSatuanFase2(0);
      } else if (langkahSekarang === 1) {
        // mulai counting
      } else if (langkahSekarang >= 2) {
        setJumlahSatuanFase2(3);
      }
    }
  }, [fase, langkahSekarang]);

  // ============================================
  // EFFECT FASE 3 (CONTOH ANGKA 35)
  // ============================================

  // Loop hitung satuan di Fase 3 Langkah 1 (Counting)
  useEffect(() => {
    if (fase === 3 && langkahSekarang === 1 && isPlaying) {
      const interval = setInterval(() => {
        setJumlahSatuanFase3((prev) => {
          if (prev >= 5) {
            clearInterval(interval);
            setLangkahSekarang(2);
            return 5;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [fase, langkahSekarang, isPlaying]);

  // Transisi otomatis langkah Fase 3: 0 -> 1 dan 2 -> 3
  useEffect(() => {
    if (fase === 3 && isPlaying) {
      if (langkahSekarang === 0) {
        const timer = setTimeout(() => {
          setLangkahSekarang(1);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (langkahSekarang === 2) {
        const timer = setTimeout(() => {
          setLangkahSekarang(3);
        }, 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [fase, langkahSekarang, isPlaying]);

  // Sinkronisasi status visual Fase 3
  useEffect(() => {
    if (fase === 3) {
      if (langkahSekarang === 0) {
        setJumlahSatuanFase3(0);
      } else if (langkahSekarang === 1) {
        // mulai counting
      } else if (langkahSekarang >= 2) {
        setJumlahSatuanFase3(5);
      }
    }
  }, [fase, langkahSekarang]);

  // Penjelasan text berdasarkan step & fase
  const getPenjelasan = () => {
    if (fase === 1) {
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
          return `Sekarang, mari kita tambahkan <b>1 kotak satuan</b> lagi di sebelah kanan.`;
        case 'gabung':
          return `Jika digabungkan, 1 puluhan (10) dan 1 satuan (1) membentuk angka <b>11 (sebelas)</b>!`;
        default:
          return '';
      }
    } else if (fase === 2) {
      switch (langkahSekarang) {
        case 0:
          return `Mari kita lihat angka <b>23 (dua puluh tiga)</b>. Angka 23 memiliki <b>2 batang puluhan</b> (nilainya 20).`;
        case 1:
          return `Lalu kita tambahkan <b>3 kotak satuan</b> di sebelah kanan... <b>${jumlahSatuanFase2} satuan</b>!`;
        case 2:
          return `Jadi, 2 puluhan (20) dan 3 satuan (3) jika diletakkan berdampingan...`;
        case 3:
          return `Bergabung membentuk angka <b>23 (dua puluh tiga)</b>!`;
        default:
          return '';
      }
    } else {
      switch (langkahSekarang) {
        case 0:
          return `Sekarang, mari kita lihat angka <b>35 (tiga puluh lima)</b>. Angka 35 memiliki <b>3 batang puluhan</b> (nilainya 30).`;
        case 1:
          return `Lalu kita tambahkan <b>5 kotak satuan</b> di sebelah kanan... <b>${jumlahSatuanFase3} satuan</b>!`;
        case 2:
          return `Jadi, 3 puluhan (30) dan 5 satuan (5) jika diletakkan berdampingan...`;
        case 3:
          return `Bergabung membentuk angka <b>35 (tiga puluh lima)</b>! Hebat!`;
        default:
          return '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md p-6 bg-card rounded-3xl border border-border shadow-xl">
      {/* Label Informasi Fase */}
      <div className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950/20 text-xs font-bold rounded-full">
        {fase === 1 
          ? 'Bagian 1: Pengenalan Dasar' 
          : fase === 2 
            ? 'Bagian 2: Contoh Puluhan (23)' 
            : 'Bagian 3: Contoh Puluhan (35)'}
      </div>

      {/* Box Penjelasan */}
      <div className="text-center w-full min-h-[60px]">
        <p
          className="text-sm font-semibold text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: getPenjelasan() }}
        />
      </div>

      {/* Visualisasi Animasi */}
      <div className="relative flex items-end justify-center gap-8 w-full h-72 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6 overflow-hidden">
        
        {fase === 1 ? (
          // === VISUALISASI FASE 1 ===
          <>
            {/* Angka 11 di Atas Tengah */}
            <AnimatePresence>
              {step === 'gabung' && (
                <motion.div
                  initial={{ scale: 0, y: -20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0, y: -20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                  className="absolute top-4 left-0 right-0 mx-auto text-center z-10 flex flex-col items-center"
                >
                  <span className="text-3xl font-black text-slate-800 bg-amber-100 dark:bg-amber-950/40 px-4 py-1 rounded-2xl border-2 border-amber-300 shadow-md flex items-center gap-1 animate-bounce">
                    11 <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wadah Satuan / Puluhan */}
            <motion.div
              animate={{ x: step === 'gabung' ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              className="flex flex-col items-center gap-2 relative"
            >
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
                  {(step === 'merging' || step === 'merged') && (
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
                  {(step === 'merged' || step === 'belasan') && (
                    <motion.div
                      key="puluhan-value-label"
                      initial={{ scale: 0.5, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.5, opacity: 0, y: 10 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute bottom-[154px] text-center text-lg font-bold text-emerald-600"
                    >
                      10
                    </motion.div>
                  )}
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
                        height: 146,
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

              {/* Keterangan di bawah balok untuk step 6/6 */}
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence>
                  {step === 'gabung' && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-sm font-bold text-emerald-600"
                    >
                      1 Puluhan
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Kotak Satuan Tambahan untuk Belasan */}
            <AnimatePresence>
              {showBelasan && (
                <motion.div
                  initial={{ x: 100, y: -50, opacity: 0 }}
                  animate={{ 
                    x: step === 'gabung' ? -20 : 0, 
                    y: 0, 
                    opacity: 1 
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15, delay: step === 'gabung' ? 0 : 0.5 }}
                  className="flex flex-col items-center gap-2 relative"
                >
                  <div className="h-6 flex items-center justify-center">
                    {step !== 'belasan' && step !== 'gabung' && (
                      <span className="text-lg font-bold text-blue-600">
                        1 Satuan
                      </span>
                    )}
                  </div>
                  <div className="w-20 h-44 flex items-end justify-center p-2 relative">
                    <AnimatePresence>
                      {step === 'belasan' && (
                        <motion.div
                          key="satuan-value-label"
                          initial={{ scale: 0.5, opacity: 0, y: 10 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.5, opacity: 0, y: 10 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                          className="absolute bottom-[34px] text-center text-lg font-bold text-blue-600"
                        >
                          1
                        </motion.div>
                      )}
                    </AnimatePresence>
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

                  {/* Keterangan di bawah balok untuk step 6/6 */}
                  <div className="h-6 flex items-center justify-center">
                    <AnimatePresence>
                      {step === 'gabung' && (
                        <motion.span
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-sm font-bold text-blue-600"
                        >
                          1 Satuan
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : fase === 2 ? (
          // === VISUALISASI FASE 2 (ANGKA 23) ===
          <>
            {/* Angka 23 di Atas Tengah */}
            <AnimatePresence>
              {langkahSekarang === 3 && (
                <motion.div
                  initial={{ scale: 0, y: -20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0, y: -20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                  className="absolute top-4 left-0 right-0 mx-auto text-center z-10 flex flex-col items-center"
                >
                  <span className="text-3xl font-black text-slate-800 bg-amber-100 dark:bg-amber-950/40 px-4 py-1 rounded-2xl border-2 border-amber-300 shadow-md flex items-center gap-1 animate-bounce">
                    23 <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bagian Puluhan (2 Batang Puluhan) */}
            <motion.div
              animate={{ x: langkahSekarang === 3 ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              className="flex flex-col items-center gap-2 relative"
            >
              <div className="h-6 flex items-center justify-center">
                {langkahSekarang < 2 && (
                  <span className="text-lg font-black text-emerald-600">
                    2 Puluhan
                  </span>
                )}
              </div>
              <div className="flex gap-2 items-end justify-center w-36 h-44 p-2 relative">
                <AnimatePresence>
                  {langkahSekarang >= 0 && langkahSekarang !== 3 && (
                    <motion.div
                      key="puluhan-f2-value-label"
                      initial={{ scale: 0.5, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.5, opacity: 0, y: 10 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute bottom-[154px] text-center text-lg font-bold text-emerald-600"
                    >
                      20
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Batang 1 */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                  className="flex flex-col overflow-hidden rounded-[4px]"
                  style={{
                    width: 20,
                    height: 146,
                    transformOrigin: 'bottom',
                    border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
                    backgroundColor: 'var(--block-puluhan)',
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

                {/* Batang 2 */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.3 }}
                  className="flex flex-col overflow-hidden rounded-[4px]"
                  style={{
                    width: 20,
                    height: 146,
                    transformOrigin: 'bottom',
                    border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
                    backgroundColor: 'var(--block-puluhan)',
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
              </div>

              {/* Keterangan di bawah balok untuk langkah 4/4 */}
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence>
                  {langkahSekarang === 3 && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-sm font-bold text-emerald-600"
                    >
                      2 Puluhan
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Bagian Satuan (3 Kotak Satuan) */}
            <motion.div
              animate={{ x: langkahSekarang === 3 ? -20 : 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              className="flex flex-col items-center gap-2 relative"
            >
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {langkahSekarang === 1 && jumlahSatuanFase2 > 0 && (
                    <motion.span
                      key={`cnt-f2-${jumlahSatuanFase2}`}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 10, opacity: 0 }}
                      className="text-lg font-bold text-blue-600"
                    >
                      {jumlahSatuanFase2} Satuan
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="w-20 h-44 flex items-end justify-center p-2 relative">
                <AnimatePresence>
                  {langkahSekarang === 2 && (
                    <motion.div
                      key="satuan-f2-value-label"
                      initial={{ scale: 0.5, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.5, opacity: 0, y: 10 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute bottom-[62px] text-center text-lg font-bold text-blue-600"
                    >
                      3
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex flex-col-reverse gap-0.5 items-center w-full">
                  {Array.from({ length: jumlahSatuanFase2 }).map((_, idx) => (
                    <motion.div
                      key={`satuan-f2-block-${idx}`}
                      initial={{ y: -150, opacity: 0, scale: 0.5 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="rounded-[2px]"
                      style={{
                        width: 20,
                        height: 14,
                        backgroundColor: 'var(--block-satuan)',
                        border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Keterangan di bawah balok untuk langkah 4/4 */}
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence>
                  {langkahSekarang === 3 && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-sm font-bold text-blue-600"
                    >
                      3 Satuan
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        ) : (
          // === VISUALISASI FASE 3 (ANGKA 35) ===
          <>
            {/* Angka 35 di Atas Tengah */}
            <AnimatePresence>
              {langkahSekarang === 3 && (
                <motion.div
                  initial={{ scale: 0, y: -20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0, y: -20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                  className="absolute top-4 left-0 right-0 mx-auto text-center z-10 flex flex-col items-center"
                >
                  <span className="text-3xl font-black text-slate-800 bg-amber-100 dark:bg-amber-950/40 px-4 py-1 rounded-2xl border-2 border-amber-300 shadow-md flex items-center gap-1 animate-bounce">
                    35 <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bagian Puluhan (3 Batang Puluhan) */}
            <motion.div
              animate={{ x: langkahSekarang === 3 ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              className="flex flex-col items-center gap-2 relative"
            >
              <div className="h-6 flex items-center justify-center">
                {langkahSekarang < 2 && (
                  <span className="text-lg font-black text-emerald-600">
                    3 Puluhan
                  </span>
                )}
              </div>
              <div className="flex gap-2 items-end justify-center w-36 h-44 p-2 relative">
                <AnimatePresence>
                  {langkahSekarang >= 0 && langkahSekarang !== 3 && (
                    <motion.div
                      key="puluhan-f3-value-label"
                      initial={{ scale: 0.5, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.5, opacity: 0, y: 10 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute bottom-[154px] text-center text-lg font-bold text-emerald-600"
                    >
                      30
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Batang 1 */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                  className="flex flex-col overflow-hidden rounded-[4px]"
                  style={{
                    width: 18,
                    height: 146,
                    transformOrigin: 'bottom',
                    border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
                    backgroundColor: 'var(--block-puluhan)',
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

                {/* Batang 2 */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
                  className="flex flex-col overflow-hidden rounded-[4px]"
                  style={{
                    width: 18,
                    height: 146,
                    transformOrigin: 'bottom',
                    border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
                    backgroundColor: 'var(--block-puluhan)',
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

                {/* Batang 3 */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.4 }}
                  className="flex flex-col overflow-hidden rounded-[4px]"
                  style={{
                    width: 18,
                    height: 146,
                    transformOrigin: 'bottom',
                    border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
                    backgroundColor: 'var(--block-puluhan)',
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
              </div>

              {/* Keterangan di bawah balok untuk langkah 4/4 */}
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence>
                  {langkahSekarang === 3 && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-sm font-bold text-emerald-600"
                    >
                      3 Puluhan
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Bagian Satuan (5 Kotak Satuan) */}
            <motion.div
              animate={{ x: langkahSekarang === 3 ? -20 : 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              className="flex flex-col items-center gap-2 relative"
            >
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {langkahSekarang === 1 && jumlahSatuanFase3 > 0 && (
                    <motion.span
                      key={`cnt-f3-${jumlahSatuanFase3}`}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 10, opacity: 0 }}
                      className="text-lg font-bold text-blue-600"
                    >
                      {jumlahSatuanFase3} Satuan
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="w-20 h-44 flex items-end justify-center p-2 relative">
                <AnimatePresence>
                  {langkahSekarang === 2 && (
                    <motion.div
                      key="satuan-f3-value-label"
                      initial={{ scale: 0.5, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.5, opacity: 0, y: 10 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="absolute bottom-[90px] text-center text-lg font-bold text-blue-600"
                    >
                      5
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex flex-col-reverse gap-0.5 items-center w-full">
                  {Array.from({ length: jumlahSatuanFase3 }).map((_, idx) => (
                    <motion.div
                      key={`satuan-f3-block-${idx}`}
                      initial={{ y: -150, opacity: 0, scale: 0.5 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="rounded-[2px]"
                      style={{
                        width: 20,
                        height: 14,
                        backgroundColor: 'var(--block-satuan)',
                        border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Keterangan di bawah balok untuk langkah 4/4 */}
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence>
                  {langkahSekarang === 3 && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-sm font-bold text-blue-600"
                    >
                      5 Satuan
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Kontrol Navigasi Animasi */}
      <div className="flex flex-col gap-3 w-full max-w-sm mx-auto mt-2 border-t border-border pt-4">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground w-12 text-right">
            Langkah {langkahSekarang + 1} / {totalLangkah}
          </span>
          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300" 
              style={{ width: `${((langkahSekarang + 1) / totalLangkah) * 100}%` }}
            />
          </div>
        </div>

        {/* Tombol-tombol kontrol */}
        <div className="flex items-center justify-center gap-3">
          {/* Ulangi */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setLangkahSekarang(0);
              if (fase === 1) {
                setJumlahSatuan(0);
                setIsMerged(false);
                setShowBelasan(false);
              } else if (fase === 2) {
                setJumlahSatuanFase2(0);
              } else {
                setJumlahSatuanFase3(0);
              }
              setIsPlaying(true);
            }}
            disabled={langkahSekarang === 0 && !isPlaying}
            title="Ulangi dari awal"
            className="rounded-xl w-10 h-10"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          {/* Sebelumnya (Mendukung Back lintas Fase) */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (langkahSekarang > 0) {
                setLangkahSekarang((prev) => prev - 1);
              } else if (fase === 2 && langkahSekarang === 0) {
                // Kembali ke Fase 1 langkah terakhir
                setFase(1);
                setLangkahSekarang(5);
                setIsPlaying(false);
              } else if (fase === 3 && langkahSekarang === 0) {
                // Kembali ke Fase 2 langkah terakhir
                setFase(2);
                setLangkahSekarang(3);
                setIsPlaying(false);
              }
            }}
            disabled={fase === 1 && langkahSekarang === 0}
            title="Langkah sebelumnya"
            className="rounded-xl w-10 h-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Play/Pause */}
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsPlaying((prev) => !prev)}
            disabled={(fase === 2 || fase === 3) && langkahSekarang === 3 && !isPlaying}
            title={isPlaying ? 'Jeda' : 'Putar otomatis'}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          {/* Berikutnya (Mendukung Next lintas Fase) */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (langkahSekarang < totalLangkah - 1) {
                setLangkahSekarang((prev) => prev + 1);
              } else if (fase === 1 && langkahSekarang === 5) {
                // Pindah ke Fase 2 langkah 0
                setFase(2);
                setLangkahSekarang(0);
                setJumlahSatuanFase2(0);
                setIsPlaying(true);
              } else if (fase === 2 && langkahSekarang === 3) {
                // Pindah ke Fase 3 langkah 0
                setFase(3);
                setLangkahSekarang(0);
                setJumlahSatuanFase3(0);
                setIsPlaying(true);
              }
            }}
            disabled={fase === 3 && langkahSekarang === 3}
            title="Langkah berikutnya"
            className="rounded-xl w-10 h-10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Button aksi transisi fase atau selesai */}
      <div className="w-full flex justify-end">
        {fase === 1 && langkahSekarang === 5 ? (
          <Button
            onClick={() => {
              setFase(2);
              setLangkahSekarang(0);
              setJumlahSatuanFase2(0);
              setIsPlaying(true);
            }}
            className="gap-2 px-6 shadow-md rounded-2xl w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            Lanjut Contoh ke 2
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : fase === 2 && langkahSekarang === 3 ? (
          <Button
            onClick={() => {
              setFase(3);
              setLangkahSekarang(0);
              setJumlahSatuanFase3(0);
              setIsPlaying(true);
            }}
            className="gap-2 px-6 shadow-md rounded-2xl w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            Lanjut Contoh ke 3
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={onSelesai}
            disabled={fase !== 3 || langkahSekarang !== 3}
            className="gap-2 px-6 shadow-md rounded-2xl w-full"
          >
            Lanjut ke Game Mencocokkan
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
