'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Wand2 } from 'lucide-react';
import type { Operasi } from '@/types/math';

interface InteractiveMathBlocksProps {
  angka1: number;
  angka2: number;
  operasi: Operasi;
  onSelesai: () => void;
}

// ---------------------------------------------
// Visual Blocks
// ---------------------------------------------
function SatuanBlock({ ghost = false, removed = false }: { ghost?: boolean; removed?: boolean }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        backgroundColor: ghost ? 'transparent' : 'var(--block-satuan)',
        border: ghost
          ? '2px dashed color-mix(in oklch, var(--block-satuan) 50%, transparent)'
          : '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
        borderRadius: 4,
        opacity: removed ? 0 : 1,
        transition: 'all 0.3s',
      }}
    />
  );
}

function PuluhanBlock({ ghost = false, removed = false }: { ghost?: boolean; removed?: boolean }) {
  return (
    <div
      style={{
        width: 24,
        height: 150,
        backgroundColor: ghost ? 'transparent' : 'var(--block-puluhan)',
        border: ghost
          ? '2px dashed color-mix(in oklch, var(--block-puluhan) 50%, transparent)'
          : '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        opacity: removed ? 0 : 1,
        transition: 'all 0.3s',
      }}
    >
      {!ghost && Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{ flex: 1, borderBottom: i < 9 ? '1px solid color-mix(in oklch, var(--block-puluhan) 40%, black 60%)' : 'none' }} />
      ))}
    </div>
  );
}

// ---------------------------------------------
// Main Component
// ---------------------------------------------
export default function InteractiveMathBlocks({ angka1, angka2, operasi, onSelesai }: InteractiveMathBlocksProps) {
  const isPenjumlahan = operasi === 'penjumlahan';
  
  const puluhan1 = Math.floor(angka1 / 10);
  const satuan1 = angka1 % 10;
  const puluhan2 = Math.floor(angka2 / 10);
  const satuan2 = angka2 % 10;

  // We need to process Satuan first, then Puluhan
  const targetSatuan = satuan2;
  const targetPuluhan = puluhan2;

  const [interactedSatuanIds, setInteractedSatuanIds] = useState<number[]>([]);
  const [interactedPuluhanIds, setInteractedPuluhanIds] = useState<number[]>([]);

  // step logic
  const step = interactedSatuanIds.length < targetSatuan 
    ? 'satuan' 
    : interactedPuluhanIds.length < targetPuluhan 
      ? 'puluhan' 
      : 'selesai';

  const handleSatuanClick = (id: number) => {
    if (step !== 'satuan') return;
    if (!interactedSatuanIds.includes(id) && interactedSatuanIds.length < targetSatuan) {
      setInteractedSatuanIds(prev => [...prev, id]);
    }
  };

  const handlePuluhanClick = (id: number) => {
    if (step !== 'puluhan') return;
    if (!interactedPuluhanIds.includes(id) && interactedPuluhanIds.length < targetPuluhan) {
      setInteractedPuluhanIds(prev => [...prev, id]);
    }
  };

  const handleOtomatis = () => {
    if (step === 'satuan') {
      const newIds = [...interactedSatuanIds];
      const maxIds = isPenjumlahan ? targetSatuan : satuan1;
      for (let i = 0; i < maxIds && newIds.length < targetSatuan; i++) {
        if (!newIds.includes(i)) newIds.push(i);
      }
      setInteractedSatuanIds(newIds);
    } else if (step === 'puluhan') {
      const newIds = [...interactedPuluhanIds];
      const maxIds = isPenjumlahan ? targetPuluhan : puluhan1;
      for (let i = 0; i < maxIds && newIds.length < targetPuluhan; i++) {
        if (!newIds.includes(i)) newIds.push(i);
      }
      setInteractedPuluhanIds(newIds);
    }
  };

  const currentPuluhanCount = isPenjumlahan ? puluhan1 + interactedPuluhanIds.length : puluhan1 - interactedPuluhanIds.length;
  const currentSatuanCount = isPenjumlahan ? satuan1 + interactedSatuanIds.length : satuan1 - interactedSatuanIds.length;

  // Render variables
  const judulStep = step === 'satuan' ? 'Langkah 1: Kolom Satuan' : step === 'puluhan' ? 'Langkah 2: Kolom Puluhan' : 'Selesai';
  const persamaanStep = step === 'satuan' 
    ? `${satuan1} ${operasi === 'penjumlahan' ? '+' : '-'} ${satuan2} = ?` 
    : step === 'puluhan' 
      ? `${puluhan1} ${operasi === 'penjumlahan' ? '+' : '-'} ${puluhan2} = ?` 
      : '';

  const instruksi = isPenjumlahan 
    ? step === 'satuan'
      ? `Ada ${satuan1} satuan. Klik ${targetSatuan} balok bayangan SATUAN untuk menambahkannya!`
      : step === 'puluhan'
        ? `Bagus! Ada ${puluhan1} puluhan. Klik ${targetPuluhan} balok bayangan PULUHAN untuk menambahkannya!`
        : 'Selesai ditambahkan!'
    : step === 'satuan'
      ? `Ada ${satuan1} satuan. Klik ${targetSatuan} balok SATUAN untuk membuang/menghapusnya!`
      : step === 'puluhan'
        ? `Bagus! Ada ${puluhan1} puluhan. Klik ${targetPuluhan} balok PULUHAN untuk membuangnya!`
        : 'Selesai dikurangi!';

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      {/* Instruksi */}
      <div className={`text-center p-4 rounded-xl w-full shadow-sm transition-colors duration-500 ${step === 'selesai' ? 'bg-emerald-50 border border-emerald-200' : 'bg-blue-50 border border-blue-200'}`}>
        <h3 className="font-bold mb-2 text-lg">
          {isPenjumlahan ? 'Penjumlahan (Tambah)' : 'Pengurangan (Kurang)'}
        </h3>
        
        {step !== 'selesai' && (
          <div className="bg-white/60 p-3 rounded-lg mb-3 inline-block border border-blue-200 shadow-sm">
            <span className="font-bold text-sm text-blue-800">{judulStep}</span>
            <div className="text-3xl font-black text-blue-900 tracking-widest mt-1 tabular-nums">
              {persamaanStep}
            </div>
          </div>
        )}
        
        <p className="font-medium text-blue-700/80">{instruksi}</p>
        
        {step !== 'selesai' && (
          <Button onClick={handleOtomatis} variant="secondary" size="sm" className="mt-3 gap-2 bg-white/80 hover:bg-white">
            <Wand2 className="w-4 h-4" /> Kerjakan Otomatis
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-8 w-full px-4">
        {/* Kolom Puluhan */}
        <div className={`flex flex-col items-center gap-4 flex-1 p-4 rounded-xl border-4 transition-all duration-300 ${step === 'puluhan' ? 'border-primary bg-primary/5 shadow-md scale-105' : 'border-transparent'}`}>
          <h4 className="font-bold text-lg" style={{ color: 'var(--block-puluhan)' }}>Puluhan</h4>
          <div className="flex flex-wrap justify-center gap-3 min-h-[160px]">
            {isPenjumlahan ? (
              <>
                {/* Asli */}
                {Array.from({ length: puluhan1 }).map((_, i) => (
                  <PuluhanBlock key={`p1-${i}`} />
                ))}
                {/* Tambahan (Ghost -> Solid) */}
                {Array.from({ length: puluhan2 }).map((_, i) => {
                  const isAdded = interactedPuluhanIds.includes(i);
                  const isClickable = step === 'puluhan' && !isAdded;
                  return (
                    <motion.div
                      key={`p2-${i}`}
                      onClick={() => handlePuluhanClick(i)}
                      className={isClickable ? 'cursor-pointer' : ''}
                      whileHover={isClickable ? { scale: 1.05 } : {}}
                      whileTap={isClickable ? { scale: 0.95 } : {}}
                    >
                      <PuluhanBlock ghost={!isAdded} />
                    </motion.div>
                  );
                })}
              </>
            ) : (
              <>
                {/* Pengurangan: Semua Asli, bisa diklik untuk hilang */}
                {Array.from({ length: puluhan1 }).map((_, i) => {
                  const isRemoved = interactedPuluhanIds.includes(i);
                  const isClickable = step === 'puluhan' && !isRemoved && interactedPuluhanIds.length < targetPuluhan;
                  return (
                    <motion.div
                      key={`p1-${i}`}
                      onClick={() => handlePuluhanClick(i)}
                      className={isClickable ? 'cursor-pointer' : ''}
                      whileHover={isClickable ? { scale: 1.05, y: -5 } : {}}
                      whileTap={isClickable ? { scale: 0.95 } : {}}
                      animate={{ opacity: isRemoved ? 0 : 1, scale: isRemoved ? 0.8 : 1 }}
                    >
                      <PuluhanBlock />
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
          <div className="text-4xl font-black mt-4 tabular-nums" style={{ color: 'var(--block-puluhan)' }}>
            {currentPuluhanCount}
          </div>
          <div className="text-sm font-bold text-muted-foreground mt-1">
            {interactedPuluhanIds.length} / {targetPuluhan} 
            {isPenjumlahan ? ' Ditambah' : ' Dikurang'}
          </div>
        </div>

        {/* Kolom Satuan */}
        <div className={`flex flex-col items-center gap-4 flex-1 p-4 rounded-xl border-4 transition-all duration-300 ${step === 'satuan' ? 'border-primary bg-primary/5 shadow-md scale-105' : 'border-transparent'}`}>
          <h4 className="font-bold text-lg" style={{ color: 'var(--block-satuan)' }}>Satuan</h4>
          <div className="flex flex-wrap justify-center gap-2 max-w-[150px] min-h-[160px] content-start">
            {isPenjumlahan ? (
              <>
                {/* Asli */}
                {Array.from({ length: satuan1 }).map((_, i) => (
                  <SatuanBlock key={`s1-${i}`} />
                ))}
                {/* Tambahan */}
                {Array.from({ length: satuan2 }).map((_, i) => {
                  const isAdded = interactedSatuanIds.includes(i);
                  const isClickable = step === 'satuan' && !isAdded;
                  return (
                    <motion.div
                      key={`s2-${i}`}
                      onClick={() => handleSatuanClick(i)}
                      className={isClickable ? 'cursor-pointer' : ''}
                      whileHover={isClickable ? { scale: 1.1 } : {}}
                      whileTap={isClickable ? { scale: 0.9 } : {}}
                    >
                      <SatuanBlock ghost={!isAdded} />
                    </motion.div>
                  );
                })}
              </>
            ) : (
              <>
                {/* Pengurangan */}
                {Array.from({ length: satuan1 }).map((_, i) => {
                  const isRemoved = interactedSatuanIds.includes(i);
                  const isClickable = step === 'satuan' && !isRemoved && interactedSatuanIds.length < targetSatuan;
                  return (
                    <motion.div
                      key={`s1-${i}`}
                      onClick={() => handleSatuanClick(i)}
                      className={isClickable ? 'cursor-pointer' : ''}
                      whileHover={isClickable ? { scale: 1.1, y: -2 } : {}}
                      whileTap={isClickable ? { scale: 0.9 } : {}}
                      animate={{ opacity: isRemoved ? 0 : 1, scale: isRemoved ? 0.5 : 1 }}
                    >
                      <SatuanBlock />
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
          <div className="text-4xl font-black mt-4 tabular-nums" style={{ color: 'var(--block-satuan)' }}>
            {currentSatuanCount}
          </div>
          <div className="text-sm font-bold text-muted-foreground mt-1">
            {interactedSatuanIds.length} / {targetSatuan} 
            {isPenjumlahan ? ' Ditambah' : ' Dikurang'}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {step === 'selesai' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mt-4"
          >
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-6 py-3 rounded-full border border-emerald-200 text-lg">
              <CheckCircle2 className="w-6 h-6" />
              <span>
                Hasilnya adalah {isPenjumlahan ? angka1 + angka2 : angka1 - angka2}!
              </span>
            </div>
            <Button onClick={onSelesai} size="lg" className="gap-2 px-8 shadow-md">
              Lanjut ke Perhitungan Angka
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
