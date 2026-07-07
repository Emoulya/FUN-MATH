'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DragDropCarryProps {
  onSelesai: () => void;
}

export default function DragDropCarry({ onSelesai }: DragDropCarryProps) {
  const jumlahSatuanAwal = 12;
  const targetSatuan = 10;
  
  const [satuanDipindah, setSatuanDipindah] = useState(0);
  const [showPuluhan, setShowPuluhan] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const sisaSatuan = jumlahSatuanAwal - satuanDipindah;

  const handleDragEnd = (e: any, info: any) => {
    // Jika digeser ke kanan atau bawah
    if (info.offset.x > 30 || info.offset.y > 30) {
      if (satuanDipindah < targetSatuan) {
        setSatuanDipindah(prev => prev + 1);
      }
    }
  };

  useEffect(() => {
    if (satuanDipindah === targetSatuan && !showPuluhan) {
      const timer = setTimeout(() => {
        setShowPuluhan(true);
        setIsDone(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [satuanDipindah, showPuluhan]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="text-center bg-blue-50 border border-blue-200 p-4 rounded-xl w-full shadow-sm">
        <h3 className="font-bold text-blue-700 mb-1">Menyimpan (Carry)</h3>
        <p className="text-sm text-blue-600/80">
          Kita punya {jumlahSatuanAwal} satuan. Karena lebih dari 9, kita harus menyimpannya! <br/>
          <strong>Tarik (drag) {targetSatuan} satuan ke wadah di sebelah kanan</strong> untuk menukarnya menjadi 1 puluhan.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
        {/* Wadah Asal: Satuan */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <h4 className="font-bold text-sm" style={{ color: 'var(--block-satuan)' }}>Sisa Satuan</h4>
          <div className="min-h-[180px] w-full p-4 bg-muted/30 rounded-xl border-2 border-dashed border-border flex flex-wrap gap-2 content-start justify-center">
            {Array.from({ length: sisaSatuan }).map((_, i) => (
              <motion.div
                key={`src-s-${i}`}
                drag={satuanDipindah < targetSatuan}
                dragSnapToOrigin
                onDragEnd={handleDragEnd}
                className={satuanDipindah < targetSatuan ? "cursor-grab active:cursor-grabbing z-10" : "opacity-50"}
                whileHover={satuanDipindah < targetSatuan ? { scale: 1.1 } : {}}
                whileDrag={{ scale: 1.2, zIndex: 50 }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: 'var(--block-satuan)',
                    border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                    borderRadius: 4
                  }}
                />
              </motion.div>
            ))}
          </div>
          <div className="text-5xl font-black mt-2" style={{ color: 'var(--block-satuan)' }}>
            {sisaSatuan}
          </div>
        </div>

        {/* Panah Indikator */}
        <div className="hidden sm:flex flex-col items-center justify-center text-muted-foreground/50">
          <ArrowRight className="w-8 h-8" />
        </div>

        {/* Wadah Tujuan: Puluhan */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <h4 className="font-bold text-sm" style={{ color: 'var(--block-puluhan)' }}>Tukar jadi Puluhan</h4>
          <div className="min-h-[180px] w-full p-4 bg-blue-50/50 rounded-xl border-2 border-dashed flex items-end justify-center gap-2 overflow-hidden" style={{ borderColor: 'var(--block-puluhan)' }}>
            <AnimatePresence mode="wait">
              {!showPuluhan ? (
                <motion.div 
                  key="satuan-terkumpul"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex flex-col-reverse flex-wrap max-h-[150px] gap-1 items-center justify-center w-full content-center"
                >
                  {Array.from({ length: satuanDipindah }).map((_, i) => (
                    <motion.div
                      key={`tgt-s-${i}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: 'var(--block-satuan)',
                        border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                        borderRadius: 4
                      }}
                    />
                  ))}
                  {satuanDipindah === 0 && (
                    <span className="text-sm font-medium text-muted-foreground self-center">Tarik ke sini!</span>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="puluhan-jadi"
                  initial={{ opacity: 0, scale: 0, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="flex justify-center w-full pb-2 relative"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5 }}
                    style={{
                      width: 24,
                      height: 150,
                      backgroundColor: 'var(--block-puluhan)',
                      border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, borderBottom: i < 9 ? '1px solid color-mix(in oklch, var(--block-puluhan) 40%, black 60%)' : 'none' }} />
                    ))}
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-4 -right-2 text-3xl"
                  >
                    ✨
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-col items-center mt-2">
            <div className="text-5xl font-black" style={{ color: 'var(--block-puluhan)' }}>
              {showPuluhan ? "10" : satuanDipindah}
            </div>
            <span className="text-xs font-bold text-muted-foreground mt-1">
              {satuanDipindah} / 10 Terkumpul
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mt-2"
          >
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
              <span>Hebat! 10 satuan berubah jadi 1 puluhan!</span>
            </div>
            <Button onClick={onSelesai} size="lg" className="gap-2 px-8 shadow-md">
              Lanjut Belajar <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
