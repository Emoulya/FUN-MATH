'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Wand2 } from 'lucide-react';
import type { Operasi } from '@/types/math';
import { OPERASI_SIMBOL } from '@/lib/constants';

// Pembantu untuk layout kolom balok satuan secara horizontal (maksimal 2 baris)
function getGridColsClass(count: number) {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-2';
  const cols = Math.ceil(count / 2);
  if (cols === 2) return 'grid-cols-2';
  if (cols === 3) return 'grid-cols-3';
  if (cols === 4) return 'grid-cols-4';
  if (cols === 5) return 'grid-cols-5';
  return 'grid-cols-5';
}

// Sub-components untuk Balok
function SatuanBlock({ ghost = false }: { ghost?: boolean }) {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        backgroundColor: ghost ? 'transparent' : 'var(--block-satuan)',
        border: ghost
          ? '1px dashed color-mix(in oklch, var(--block-satuan) 40%, transparent)'
          : '1px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
        borderRadius: 1.5,
      }}
      className="transition-all duration-300"
    />
  );
}

function PuluhanBlock({ ghost = false }: { ghost?: boolean }) {
  return (
    <div
      style={{
        width: 10,
        height: 60,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: ghost ? 'transparent' : 'var(--block-puluhan)',
        border: ghost
          ? '1px dashed color-mix(in oklch, var(--block-puluhan) 40%, transparent)'
          : '1px solid color-mix(in oklch, var(--block-puluhan) 70%, black)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
      className="transition-all duration-300"
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderBottom: i < 9 && !ghost ? '1px solid color-mix(in oklch, var(--block-puluhan) 50%, black)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

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

  // State sub-langkah interaktif baru
  const [step, setStep] = useState<'balok-satuan' | 'angka-satuan' | 'balok-puluhan' | 'angka-puluhan' | 'selesai'>(
    compact ? 'selesai' : 'balok-satuan'
  );
  
  const [satuanBalokProcessed, setSatuanBalokProcessed] = useState(compact ? true : false);
  const [satuanProcessed, setSatuanProcessed] = useState(compact ? true : false);
  const [puluhanBalokProcessed, setPuluhanBalokProcessed] = useState(compact ? true : false);
  const [puluhanProcessed, setPuluhanProcessed] = useState(compact ? true : false);

  const handleBalokSatuanClick = () => {
    if (step !== 'balok-satuan') return;
    setSatuanBalokProcessed(true);
    setTimeout(() => {
      if (puluhan2 === 0) {
        setPuluhanBalokProcessed(true);
        setStep('angka-satuan');
      } else {
        setStep('balok-puluhan');
      }
    }, 600);
  };

  const handleBalokPuluhanClick = () => {
    if (step !== 'balok-puluhan') return;
    setPuluhanBalokProcessed(true);
    setTimeout(() => {
      setStep('angka-satuan');
    }, 600);
  };

  const handleSatuanClick = () => {
    if (step !== 'angka-satuan') return;
    setSatuanProcessed(true);
    setTimeout(() => {
      if (puluhan2 === 0) {
        setPuluhanProcessed(true);
        setStep('selesai');
      } else {
        setStep('angka-puluhan');
      }
    }, 600);
  };

  const handlePuluhanClick = () => {
    if (step !== 'angka-puluhan') return;
    setPuluhanProcessed(true);
    setTimeout(() => {
      setStep('selesai');
    }, 600);
  };

  const handleOtomatis = () => {
    if (step === 'balok-satuan') handleBalokSatuanClick();
    else if (step === 'angka-satuan') handleSatuanClick();
    else if (step === 'balok-puluhan') handleBalokPuluhanClick();
    else if (step === 'angka-puluhan') handlePuluhanClick();
  };

  const instruksiSatuanBalok = `Klik BALOK SATUAN atas untuk memulai pengurangan.`;
  const instruksiSatuanAngka = isPenjumlahan 
    ? `Klik angka ${satuan2} pada kolom SATUAN bawah.`
    : `Klik angka ${satuan2} pada kolom SATUAN bawah.`;
    
  const instruksiPuluhanBalok = `Klik BALOK PULUHAN di atas untuk digabungkan!`;
  const instruksiPuluhanAngka = isPenjumlahan
    ? `Lanjut klik angka ${puluhan2} di kolom PULUHAN bawah.`
    : `Lanjut klik angka ${puluhan2} di kolom PULUHAN bawah.`;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Instruksi (Hanya tampil jika tidak compact) */}
      {!compact && (
      <div className={`text-center p-4 rounded-xl w-full shadow-sm transition-colors duration-500 ${step === 'selesai' ? 'bg-emerald-50 border border-emerald-200' : 'bg-blue-50 border border-blue-200'}`}>
        <h3 className="font-bold mb-3 text-lg">
          {isPenjumlahan ? 'Hitung Susun: Penjumlahan' : 'Hitung Susun: Pengurangan'}
        </h3>
        
        <div className="flex-col gap-2 text-left bg-white/60 p-3 rounded-lg inline-block border border-blue-200/50 shadow-sm mx-auto max-w-sm w-full">
          {/* Langkah 1: Balok Satuan */}
          <div className={`flex items-start gap-2 ${step === 'balok-satuan' ? 'font-bold text-blue-800 animate-pulse' : 'opacity-70 text-slate-600'}`}>
            <span className="shrink-0 mt-0.5">1.</span>
            <span>{instruksiSatuanBalok}</span>
            {satuanBalokProcessed && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          </div>

          {/* Langkah 2: Balok Puluhan */}
          {puluhan2 > 0 && (step === 'balok-puluhan' || step === 'angka-satuan' || step === 'angka-puluhan' || step === 'selesai' || puluhanBalokProcessed) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className={`flex items-start gap-2 ${step === 'balok-puluhan' ? 'font-bold text-emerald-800 animate-pulse' : 'opacity-70 text-slate-600'}`}
            >
              <span className="shrink-0 mt-0.5">2.</span>
              <span>{instruksiPuluhanBalok}</span>
              {puluhanBalokProcessed && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            </motion.div>
          )}

          {/* Langkah 3: Angka Satuan */}
          {(step === 'angka-satuan' || step === 'angka-puluhan' || step === 'selesai' || satuanProcessed) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className={`flex items-start gap-2 ${step === 'angka-satuan' ? 'font-bold text-blue-800 animate-pulse' : 'opacity-70 text-slate-600'}`}
            >
              <span className="shrink-0 mt-0.5">{puluhan2 > 0 ? '3.' : '2.'}</span>
              <span>{instruksiSatuanAngka}</span>
              {satuanProcessed && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            </motion.div>
          )}

          {/* Langkah 4: Angka Puluhan */}
          {puluhan2 > 0 && (step === 'angka-puluhan' || step === 'selesai' || puluhanProcessed) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className={`flex items-start gap-2 ${step === 'angka-puluhan' ? 'font-bold text-emerald-800 animate-pulse' : 'opacity-70 text-slate-600'}`}
            >
              <span className="shrink-0 mt-0.5">4.</span>
              <span>{instruksiPuluhanAngka}</span>
              {puluhanProcessed && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
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

      {/* Dua Kartu Terpisah Bertumpuk (Berlaku untuk Desktop & Mobile) */}
      <div className="flex flex-col items-center gap-5 w-full max-w-sm justify-center">
        
        {/* Atas: Board Hitung Susun Balok Pendamping */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 relative w-full flex flex-col justify-center">
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-6 gap-y-4 items-center">
            
            {/* Baris 1: Balok Atas */}
            <div />
            
            {/* Puluhan Atas */}
            <div 
              className={`relative flex justify-center items-center p-1.5 rounded-lg border-2 transition-all duration-300 min-h-18 ${
                step === 'balok-puluhan' 
                  ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300 animate-pulse' 
                  : 'border-transparent'
              }`}
            >
              <div className="flex gap-1 justify-center items-end flex-nowrap">
                {puluhan1 > 0 ? (
                  Array.from({ length: puluhan1 }).map((_, i) => (
                    <PuluhanBlock key={`mb-p1-${i}`} />
                  ))
                ) : (
                  <span className="text-slate-300 text-xs font-bold">-</span>
                )}
              </div>
            </div>

            
            {/* Satuan Atas */}
            <div 
              className={`relative flex justify-center items-center p-1.5 rounded-lg border-2 transition-all duration-300 min-h-18 ${
                step === 'balok-satuan' 
                  ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300 animate-pulse' 
                  : 'border-transparent'
              }`}
            >
              <div className={`grid ${getGridColsClass(satuan1)} gap-1 justify-items-center`}>
                {satuan1 > 0 ? (
                  Array.from({ length: satuan1 }).map((_, i) => (
                    <SatuanBlock key={`mb-s1-${i}`} />
                  ))
                ) : (
                  <span className="text-slate-300 text-xs font-bold">-</span>
                )}
              </div>
            </div>


            {/* Baris 2: Balok Bawah */}
            <div className="text-slate-400 self-center text-3xl font-bold flex justify-center items-center">
              {simbol}
            </div>

            {/* Puluhan Bawah */}
            <div 
              className={`relative flex justify-center items-center p-1.5 rounded-lg border-2 transition-all duration-300 min-h-18 ${
                step === 'balok-puluhan' 
                  ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300 animate-pulse cursor-pointer hover:scale-105' 
                  : 'border-transparent'
              }`}
              onClick={() => step === 'balok-puluhan' && handleBalokPuluhanClick()}
            >
              {/* Sideways Label Indicator (bawah, sama dengan atas) */}
              {(step === 'balok-puluhan' || step === 'angka-puluhan' || step === 'selesai') && puluhan2 > 0 && (
                <motion.div 
                  className={`absolute right-full mr-3 flex items-center font-bold text-sm whitespace-nowrap bg-white/90 px-2 py-1 rounded-lg shadow-sm border z-20 ${step === 'balok-puluhan' ? 'text-emerald-600 border-emerald-300' : 'text-slate-400 border-slate-200 opacity-60'}`}
                  animate={step === 'balok-puluhan' ? { x: [0, 6, 0] } : { x: 0 }}
                  transition={step === 'balok-puluhan' ? { repeat: Infinity, duration: 1.5 } : {}}
                >
                  Lanjut ke Puluhan →
                </motion.div>
              )}
              <div className="flex gap-1 justify-center items-end flex-nowrap">
                {puluhan2 > 0 ? (
                  Array.from({ length: puluhan2 }).map((_, i) => (
                    <PuluhanBlock key={`mb-p2-${i}`} />
                  ))
                ) : (
                  <span className="text-slate-300 text-xs font-bold">-</span>
                )}
              </div>
            </div>

            {/* Satuan Bawah */}
            <div 
              className={`relative flex justify-center items-center p-1.5 rounded-lg border-2 transition-all duration-300 min-h-18 ${
                step === 'balok-satuan' 
                  ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300 animate-pulse cursor-pointer hover:scale-105' 
                  : 'border-transparent'
              }`}
              onClick={() => step === 'balok-satuan' && handleBalokSatuanClick()}
            >
              {/* Sideways Label Indicator (bawah, sama dengan atas) */}
              <motion.div 
                className={`absolute left-full ml-3 flex items-center font-bold text-sm whitespace-nowrap bg-white/90 px-2 py-1 rounded-lg shadow-sm border z-20 ${step === 'balok-satuan' ? 'text-blue-600 border-blue-300' : 'text-slate-400 border-slate-200 opacity-60'}`}
                animate={step === 'balok-satuan' ? { x: [0, -6, 0] } : { x: 0 }}
                transition={step === 'balok-satuan' ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                ← Mulai dari Satuan
              </motion.div>
              <div className={`grid ${getGridColsClass(satuan2)} gap-1 justify-items-center`}>
                {satuan2 > 0 ? (
                  Array.from({ length: satuan2 }).map((_, i) => (
                    <SatuanBlock key={`mb-s2-${i}`} />
                  ))
                ) : (
                  <span className="text-slate-300 text-xs font-bold">-</span>
                )}
              </div>
            </div>

            {/* Garis pemisah */}
            <div className="col-span-3 h-1 bg-slate-800 rounded-full -my-2" />

            {/* Baris 3: Balok Hasil */}
            <div />

            {/* Puluhan Hasil */}
            <div className={`relative flex justify-center items-center p-1.5 rounded-lg border-2 border-transparent transition-all duration-300 min-h-18 ${
              step === 'balok-puluhan' ? 'bg-emerald-50/50 border-emerald-300' : ''
            }`}>
              {puluhanBalokProcessed ? (
                <div className="flex gap-1 justify-center items-end flex-nowrap">
                  {hasilPuluhan > 0 ? (
                    Array.from({ length: hasilPuluhan }).map((_, i) => (
                      <motion.div
                        key={`mb-res-p-${i}`}
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      >
                        <PuluhanBlock />
                      </motion.div>
                    ))
                  ) : (
                    <span className="text-slate-300 text-xs font-bold">-</span>
                  )}
                </div>
              ) : (
                <span className="text-slate-300 text-xl font-bold">?</span>
              )}
            </div>

            {/* Satuan Hasil */}
            <div className={`relative flex justify-center items-center p-1.5 rounded-lg border-2 border-transparent transition-all duration-300 min-h-18 ${
              step === 'balok-satuan' ? 'bg-blue-50/50 border-blue-300' : ''
            }`}>
              {satuanBalokProcessed ? (
                <div className={`grid ${getGridColsClass(hasilSatuan)} gap-1 justify-items-center`}>
                  {hasilSatuan > 0 ? (
                    Array.from({ length: hasilSatuan }).map((_, i) => (
                      <motion.div
                        key={`mb-res-s-${i}`}
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      >
                        <SatuanBlock />
                      </motion.div>
                    ))
                  ) : (
                    <span className="text-slate-300 text-xs font-bold">-</span>
                  )}
                </div>
              ) : (
                <span className="text-slate-300 text-xl font-bold">?</span>
              )}
            </div>

          </div>
        </div>

        {/* Bawah: Board Hitung Susun Angka */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 relative w-full flex flex-col justify-center">
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-6 gap-y-4 text-4xl font-black tabular-nums">
            {/* Baris 1: Angka Atas */}
            <div />
            
            {/* Angka Puluhan Atas */}
            <div className={`relative text-center flex justify-center items-center p-1 rounded-lg border-2 transition-all duration-300 ${
              step === 'angka-puluhan' ? 'bg-emerald-50/50 border-emerald-300 animate-pulse' : 'border-transparent'
            }`}>
              {puluhan1 > 0 ? puluhan1 : ''}
            </div>
            
            {/* Angka Satuan Atas */}
            <div className={`relative text-center flex justify-center items-center p-1 rounded-lg border-2 transition-all duration-300 ${
              step === 'angka-satuan' ? 'bg-blue-50/50 border-blue-300 animate-pulse' : 'border-transparent'
            }`}>
              {satuan1}
            </div>

            {/* Baris 2: Angka Bawah */}
            <div className="text-blue-500 self-end text-3xl font-bold">{simbol}</div>
            
            {/* Angka Puluhan Bawah */}
            <div className={`relative text-center flex justify-center items-center p-1 rounded-lg border-2 transition-all duration-300 ${
              step === 'angka-puluhan' ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300 animate-pulse' : 'border-transparent'
            }`}>
              {/* Sideways Label Indicator */}
              {(step === 'angka-puluhan' || step === 'selesai') && puluhan2 > 0 && (
                <motion.div 
                  className={`absolute right-full mr-3 flex items-center font-bold text-sm whitespace-nowrap bg-white/90 px-2 py-1 rounded-lg shadow-sm border z-20 ${step === 'angka-puluhan' ? 'text-emerald-600 border-emerald-300' : 'text-slate-400 border-slate-200 opacity-60'}`}
                  animate={step === 'angka-puluhan' ? { x: [0, 6, 0] } : { x: 0 }}
                  transition={step === 'angka-puluhan' ? { repeat: Infinity, duration: 1.5 } : {}}
                >
                  Lanjut ke Puluhan →
                </motion.div>
              )}

              {puluhan2 > 0 ? (
                <motion.div
                  className={`relative z-10 w-full rounded-lg ${step === 'angka-puluhan' ? 'cursor-pointer hover:scale-110 text-emerald-600' : ''}`}
                  onClick={() => step === 'angka-puluhan' && handlePuluhanClick()}
                  animate={!isPenjumlahan && puluhanProcessed ? { opacity: 0.3 } : {}}
                >
                  {puluhan2}
                </motion.div>
              ) : (
                <span className="text-slate-200 text-sm">-</span>
              )}
            </div>
            
            {/* Angka Satuan Bawah */}
            <div className={`relative text-center flex justify-center items-center p-1 rounded-lg border-2 transition-all duration-300 ${
              step === 'angka-satuan' ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300 animate-pulse' : 'border-transparent'
            }`}>
              {/* Sideways Label Indicator */}
              <motion.div 
                className={`absolute left-full ml-3 flex items-center font-bold text-sm whitespace-nowrap bg-white/90 px-2 py-1 rounded-lg shadow-sm border z-20 ${step === 'angka-satuan' ? 'text-blue-600 border-blue-300' : 'text-slate-400 border-slate-200 opacity-60'}`}
                animate={step === 'angka-satuan' ? { x: [0, -6, 0] } : { x: 0 }}
                transition={step === 'angka-satuan' ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                ← Mulai dari Satuan
              </motion.div>

              <motion.div
                className={`relative z-10 w-full rounded-lg ${step === 'angka-satuan' ? 'cursor-pointer hover:scale-110 text-blue-600' : ''}`}
                onClick={() => step === 'angka-satuan' && handleSatuanClick()}
                animate={!isPenjumlahan && satuanProcessed ? { opacity: 0.3 } : {}}
              >
                {satuan2}
              </motion.div>
            </div>

            {/* Garis pemisah */}
            <div className="col-span-3 h-1 bg-slate-800 rounded-full -my-2" />

            {/* Baris 3: Hasil */}
            <div />
            <div className="text-center text-emerald-600">
              {puluhanProcessed ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  {hasilPuluhan > 0 ? hasilPuluhan : ''}
                </motion.div>
              ) : (
                <span className="text-slate-300 text-lg font-bold">?</span>
              )}
            </div>
            <div className="text-center text-blue-600">
              {satuanProcessed ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  {hasilSatuan}
                </motion.div>
              ) : (
                <span className="text-slate-300 text-lg font-bold">?</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Hasil Akhir */}
      <div className="flex flex-col gap-2 w-full">
        <AnimatePresence>
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
