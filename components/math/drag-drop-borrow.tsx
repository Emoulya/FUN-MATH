'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DragDropBorrowProps {
  onSelesai: () => void;
}

export default function DragDropBorrow({ onSelesai }: DragDropBorrowProps) {
  const [puluhanDipindah, setPuluhanDipindah] = useState(false);
  const [showSatuan, setShowSatuan] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleDragEnd = (e: any, info: any) => {
    // Jika digeser ke kanan atau bawah
    if (info.offset.x > 30 || info.offset.y > 30) {
      if (!puluhanDipindah) {
        setPuluhanDipindah(true);
      }
    }
  };

  useEffect(() => {
    if (puluhanDipindah && !showSatuan) {
      const timer = setTimeout(() => {
        setShowSatuan(true);
        setIsDone(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [puluhanDipindah, showSatuan]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="text-center bg-emerald-50 border border-emerald-200 p-4 rounded-xl w-full shadow-sm">
        <h3 className="font-bold text-emerald-700 mb-1">Meminjam (Borrow)</h3>
        <p className="text-sm text-emerald-600/80">
          Kita kekurangan satuan untuk dikurangi! Kita butuh meminjam dari puluhan. <br/>
          <strong>Tarik (drag) 1 puluhan ke wadah di sebelah kanan</strong> untuk memecahnya menjadi 10 satuan.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
        {/* Wadah Asal: Puluhan */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <h4 className="font-bold text-sm" style={{ color: 'var(--block-puluhan)' }}>Puluhan</h4>
          <div className="min-h-[180px] w-full p-4 bg-muted/30 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
            {!puluhanDipindah && (
              <motion.div
                drag
                dragSnapToOrigin
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing z-10"
                whileHover={{ scale: 1.1 }}
                whileDrag={{ scale: 1.2, zIndex: 50 }}
              >
                <div
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
                </div>
              </motion.div>
            )}
            {puluhanDipindah && (
              <span className="text-sm font-medium text-muted-foreground/50">Kosong</span>
            )}
          </div>
          <div className="text-5xl font-black mt-2" style={{ color: 'var(--block-puluhan)' }}>
            {puluhanDipindah ? "0" : "10"}
          </div>
        </div>

        {/* Panah Indikator */}
        <div className="hidden sm:flex flex-col items-center justify-center text-muted-foreground/50">
          <ArrowRight className="w-8 h-8" />
        </div>

        {/* Wadah Tujuan: Satuan */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <h4 className="font-bold text-sm" style={{ color: 'var(--block-satuan)' }}>Wadah Pemecahan (Satuan)</h4>
          <div className="min-h-[180px] w-full p-4 bg-emerald-50/50 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 overflow-hidden" style={{ borderColor: 'var(--block-satuan)' }}>
            <AnimatePresence mode="wait">
              {puluhanDipindah && !showSatuan && (
                <motion.div
                  key="puluhan-masuk"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="flex justify-center"
                >
                  <div
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
                  </div>
                </motion.div>
              )}
              {showSatuan && (
                <motion.div
                  key="satuan-pecah"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                  className="flex flex-col-reverse flex-wrap max-h-[150px] gap-1 items-center justify-center w-full content-center relative"
                >
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={`tgt-s-${i}`}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: 'var(--block-satuan)',
                        border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                        borderRadius: 4
                      }}
                    />
                  ))}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    className="absolute -top-4 -right-2 text-3xl"
                  >
                    💥
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {!puluhanDipindah && (
              <span className="text-sm font-medium text-muted-foreground self-center">Tarik ke sini!</span>
            )}
          </div>
          <div className="flex flex-col items-center mt-2">
            <div className="text-5xl font-black" style={{ color: 'var(--block-satuan)' }}>
              {puluhanDipindah ? "10" : "0"}
            </div>
            <span className="text-xs font-bold text-muted-foreground mt-1">
              {showSatuan ? "10 Satuan Terkumpul" : "Menunggu Puluhan..."}
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
              <span>Hebat! 1 puluhan terpecah jadi 10 satuan!</span>
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
