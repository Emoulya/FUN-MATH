'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveRegroupingBlocksProps {
  mode: 'penjumlahan' | 'pengurangan';
  initialTens: number;
  initialOnes: number;
  targetSubtractTens?: number;
  targetSubtractOnes?: number;
  problemText?: string;
  onComplete?: (finalTens: number, finalOnes: number) => void;
}

function SatuanBlock({ id, isDraggable, onDragEnd }: { id: string, isDraggable: boolean, onDragEnd?: (e: any, info: any, id: string) => void }) {
  return (
    <motion.div
      layoutId={id}
      drag={isDraggable}
      dragSnapToOrigin
      onDragEnd={(e, info) => onDragEnd && onDragEnd(e, info, id)}
      whileDrag={{ scale: 1.2, zIndex: 50, cursor: 'grabbing' }}
      whileHover={isDraggable ? { scale: 1.1 } : {}}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        width: 16,
        height: 16,
        backgroundColor: 'var(--block-satuan)',
        border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
        borderRadius: 4,
        cursor: isDraggable ? 'grab' : 'default',
        touchAction: 'none'
      }}
      className="shadow-sm relative z-10 shrink-0"
    />
  );
}

function PuluhanBlock({ id, isDraggable, onDragEnd }: { id: string, isDraggable: boolean, onDragEnd?: (e: any, info: any, id: string) => void }) {
  return (
    <motion.div
      layoutId={id}
      drag={isDraggable}
      dragSnapToOrigin
      onDragEnd={(e, info) => onDragEnd && onDragEnd(e, info, id)}
      whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
      whileHover={isDraggable ? { scale: 1.05 } : {}}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        width: 16,
        height: 160,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--block-puluhan)',
        border: '1.5px solid color-mix(in oklch, var(--block-puluhan) 70%, black)',
        borderRadius: 4,
        overflow: 'hidden',
        cursor: isDraggable ? 'grab' : 'default',
        touchAction: 'none'
      }}
      className="shadow-sm relative z-10 shrink-0"
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderBottom: i < 9 ? '1px solid color-mix(in oklch, var(--block-puluhan) 50%, black)' : 'none',
          }}
        />
      ))}
    </motion.div>
  );
}

export default function InteractiveRegroupingBlocks({
  mode,
  initialTens,
  initialOnes,
  targetSubtractTens = 0,
  targetSubtractOnes = 0,
  problemText,
  onComplete
}: InteractiveRegroupingBlocksProps) {
  const isPenjumlahan = mode === 'penjumlahan';
  
  const [tens, setTens] = useState<{ id: string }[]>([]);
  const [ones, setOnes] = useState<{ id: string }[]>([]);
  const [isTestUser, setIsTestUser] = useState(false);
  
  // Addition states Box 2
  const [tens2, setTens2] = useState<{ id: string }[]>([]);
  const [ones2, setOnes2] = useState<{ id: string }[]>([]);
  
  // Addition states
  const [groupedOnes, setGroupedOnes] = useState<{ id: string }[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  
  // Subtraction states
  const [breakingTens, setBreakingTens] = useState<{ id: string }[]>([]);
  const [isShattering, setIsShattering] = useState(false);
  const [subtractedTens, setSubtractedTens] = useState<{ id: string }[]>([]);
  const [subtractedOnes, setSubtractedOnes] = useState<{ id: string }[]>([]);

  const tensBoxRef = useRef<HTMLDivElement>(null);
  const onesBoxRef = useRef<HTMLDivElement>(null);
  const takeAwayBoxRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    setTens(Array.from({ length: initialTens }).map((_, i) => ({ id: `t-init-${i}` })));
    setOnes(Array.from({ length: initialOnes }).map((_, i) => ({ id: `s-init-${i}` })));
    
    if (mode === 'penjumlahan') {
      setTens2(Array.from({ length: targetSubtractTens || 0 }).map((_, i) => ({ id: `t2-init-${i}` })));
      setOnes2(Array.from({ length: targetSubtractOnes || 0 }).map((_, i) => ({ id: `s2-init-${i}` })));
    }
    
    setGroupedOnes([]);
    setBreakingTens([]);
    setSubtractedTens([]);
    setSubtractedOnes([]);
    
    setIsTestUser(sessionStorage.getItem('siswaNama') === 'test');
  }, [initialTens, initialOnes, targetSubtractTens, targetSubtractOnes, mode]);

  // Handle Dragging Ones
  const handleDragOneEnd = (e: any, info: any, id: string) => {
    const point = { x: info.point.x, y: info.point.y };
    const MARGIN = 100; // Increase margin significantly for easier drops

    if (isPenjumlahan) {
      if (!tensBoxRef.current) return;
      const boxRect = tensBoxRef.current.getBoundingClientRect();
      const boxLeft = boxRect.left + window.scrollX;
      const boxRight = boxRect.right + window.scrollX;
      const boxTop = boxRect.top + window.scrollY;
      const boxBottom = boxRect.bottom + window.scrollY;

      if (
        point.x >= boxLeft - MARGIN && point.x <= boxRight + MARGIN &&
        point.y >= boxTop - MARGIN && point.y <= boxBottom + MARGIN
      ) {
        setOnes2((prev) => prev.filter((o) => o.id !== id));
        setOnes((prev) => [...prev, { id }]);
      }
    } else {
      if (!takeAwayBoxRef.current) return;
      const boxRect = takeAwayBoxRef.current.getBoundingClientRect();
      const boxLeft = boxRect.left + window.scrollX;
      const boxRight = boxRect.right + window.scrollX;
      const boxTop = boxRect.top + window.scrollY;
      const boxBottom = boxRect.bottom + window.scrollY;

      if (
        point.x >= boxLeft - MARGIN && point.x <= boxRight + MARGIN &&
        point.y >= boxTop - MARGIN && point.y <= boxBottom + MARGIN
      ) {
        if (subtractedOnes.length < targetSubtractOnes) {
          setOnes((prev) => prev.filter((o) => o.id !== id));
          setSubtractedOnes((prev) => [...prev, { id: `${id}-subtracted` }]);
        }
      }
    }
  };

  // Handle Dragging Tens
  const handleDragTenEnd = (e: any, info: any, id: string) => {
    const point = { x: info.point.x, y: info.point.y };
    const MARGIN = 100; // Increase margin significantly for easier drops

    if (isPenjumlahan) {
      if (!tensBoxRef.current) return;
      const boxRect = tensBoxRef.current.getBoundingClientRect();
      const boxLeft = boxRect.left + window.scrollX;
      const boxRight = boxRect.right + window.scrollX;
      const boxTop = boxRect.top + window.scrollY;
      const boxBottom = boxRect.bottom + window.scrollY;

      if (
        point.x >= boxLeft - MARGIN && point.x <= boxRight + MARGIN &&
        point.y >= boxTop - MARGIN && point.y <= boxBottom + MARGIN
      ) {
        setTens2((prev) => prev.filter((t) => t.id !== id));
        setTens((prev) => [...prev, { id }]);
      }
      return;
    }

    // 1. Check Drop to Take Away Box
    if (takeAwayBoxRef.current) {
      const boxRect = takeAwayBoxRef.current.getBoundingClientRect();
      const boxLeft = boxRect.left + window.scrollX;
      const boxRight = boxRect.right + window.scrollX;
      const boxTop = boxRect.top + window.scrollY;
      const boxBottom = boxRect.bottom + window.scrollY;

      if (
        point.x >= boxLeft - MARGIN && point.x <= boxRight + MARGIN &&
        point.y >= boxTop - MARGIN && point.y <= boxBottom + MARGIN
      ) {
        if (subtractedTens.length < targetSubtractTens) {
          setTens((prev) => prev.filter((t) => t.id !== id));
          setSubtractedTens((prev) => [...prev, { id: `${id}-subtracted` }]);
          return;
        }
      }
    }

    // 2. Check Drop to Ones Box (Borrowing)
    if (onesBoxRef.current) {
      const boxRect = onesBoxRef.current.getBoundingClientRect();
      const boxLeft = boxRect.left + window.scrollX;
      const boxRight = boxRect.right + window.scrollX;
      const boxTop = boxRect.top + window.scrollY;
      const boxBottom = boxRect.bottom + window.scrollY;

      if (
        point.x >= boxLeft - MARGIN && point.x <= boxRight + MARGIN &&
        point.y >= boxTop - MARGIN && point.y <= boxBottom + MARGIN
      ) {
        setTens((prev) => prev.filter((t) => t.id !== id));
        setIsShattering(true);
        const newOnes = Array.from({ length: 10 }).map((_, i) => ({ id: `s-new-${Date.now()}-${i}` }));
        setBreakingTens(newOnes);
        setTimeout(() => {
          setBreakingTens([]);
          setOnes((prev) => [...prev, ...newOnes]);
          setIsShattering(false);
        }, 1500);
      }
    }
  };

  // Check for merge condition (Addition)
  useEffect(() => {
    if (isPenjumlahan && ones.length >= 10 && !isMerging) {
      const onesToMerge = ones.slice(0, 10);
      const remainingOnes = ones.slice(10);
      
      setIsMerging(true);
      setGroupedOnes(onesToMerge);
      setOnes(remainingOnes);
      
      setTimeout(() => {
        setGroupedOnes([]);
        setTens((prev) => [...prev, { id: `t-new-${Date.now()}` }]);
        setIsMerging(false);
      }, 2000); // Diperlambat dari 600ms menjadi 2000ms
    }
  }, [ones, isPenjumlahan, isMerging]);

  const totalValue = tens.length * 10 + ones.length + groupedOnes.length + breakingTens.length + tens2.length * 10 + ones2.length;

  const isSubtractComplete = !isPenjumlahan && subtractedTens.length === targetSubtractTens && subtractedOnes.length === targetSubtractOnes;
  const isAdditionComplete = isPenjumlahan && ones2.length === 0 && tens2.length === 0 && !isMerging && ones.length < 10;
  const isComplete = isPenjumlahan ? isAdditionComplete : isSubtractComplete;

  const targetNumber = targetSubtractTens * 10 + targetSubtractOnes;
  const initialNumber = initialTens * 10 + initialOnes;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl select-none">
      {/* Soal Banner */}
      {problemText ? (
        <div className={`text-3xl font-black px-8 py-3 rounded-2xl border-4 shadow-md ${isPenjumlahan ? 'text-blue-600 bg-blue-100 border-blue-200' : 'text-rose-600 bg-rose-100 border-rose-200'}`}>
          {problemText}
        </div>
      ) : !isPenjumlahan ? (
        <div className="text-3xl font-black text-rose-600 bg-rose-100 px-8 py-3 rounded-2xl border-4 border-rose-200 shadow-md">
          {initialNumber} - {targetNumber} = ?
        </div>
      ) : null}

      {/* Header Info */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl border w-full max-w-2xl text-sm font-medium transition-colors ${isPenjumlahan ? 'bg-blue-50/80 border-blue-200 text-blue-900' : 'bg-rose-50/80 border-rose-200 text-rose-900'}`}>
        <Info className="w-5 h-5 shrink-0" />
        <div className="flex flex-col gap-1">
          {isPenjumlahan ? (
            <p>Geser semua kotak dari jawaban 2 ke jawaban 1. Hitung jumhlahnya.  Jika satuan menjadi 10, kotak akan berubah menjadi 1 puluhan (warna hijau).</p>
          ) : (
            <>
              <p><strong>Langkah 1:</strong> Geser balok ke Kotak Pengurang sesuai target untuk menguranginya.</p>
              <p><strong>Langkah 2:</strong> Jika satuan tidak cukup geser balok puluhan untuk meminjam.(pecah jadi 10 satuan).</p>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-6 w-full">
        {isPenjumlahan ? (
          <>
            {/* Box 1 (Kotak Jawaban 1) */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-center font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-200 shadow-sm">
                Kotak Jawaban 1 (Tujuan)
              </div>
              <div 
                ref={tensBoxRef}
                className="flex justify-center gap-6 p-6 rounded-2xl border-4 border-dashed border-emerald-300 bg-emerald-50/30 min-h-[250px] transition-colors relative"
              >
                {/* Tens Area */}
                <div className="flex gap-2 items-end min-w-[40px] justify-end">
                   <AnimatePresence>
                    {isMerging && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                        exit={{ opacity: 0 }}
                        className="absolute text-emerald-500 font-bold text-xl pointer-events-none drop-shadow-md bg-white/80 px-3 py-1 rounded-full z-20"
                        style={{ top: '30%', left: '50%', transform: 'translateX(-50%)' }}
                      >
                        ✨ Gabung!
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {tens.map((t) => (
                      <PuluhanBlock key={t.id} id={t.id} isDraggable={false} />
                    ))}
                  </AnimatePresence>
                </div>
                {/* Ones Area */}
                <div className="flex flex-col-reverse flex-wrap gap-[2px] w-[80px] h-[178px] justify-start content-start self-end">
                  <AnimatePresence>
                    {ones.map((o) => (
                      <SatuanBlock key={o.id} id={o.id} isDraggable={false} />
                    ))}
                  </AnimatePresence>
                  
                  {groupedOnes.length > 0 && (
                    <div className="flex flex-col-reverse gap-[1px] bg-blue-50/50 p-1 rounded-lg border border-blue-200 shadow-sm self-end h-[160px] justify-start ml-2">
                      <AnimatePresence>
                        {groupedOnes.map((o) => (
                          <motion.div
                            key={o.id}
                            layoutId={o.id}
                            initial={{ scale: 1 }}
                            animate={isMerging ? { scale: [1, 1.2, 0], backgroundColor: 'var(--block-puluhan)', opacity: 0 } : { scale: 1 }}
                            transition={{ duration: 1.5 }}
                            style={{
                              width: 16,
                              height: 15,
                              backgroundColor: 'var(--block-satuan)',
                              border: '1px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                              borderRadius: 2,
                            }}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Box 2 (Kotak Jawaban 2) */}
            <div className="flex-1 flex flex-col gap-2 max-w-[250px]">
              <div className="text-center font-bold text-blue-600 bg-blue-50 py-2 rounded-xl border border-blue-200 shadow-sm">
                Kotak Jawaban 2
              </div>
              <div 
                className="flex justify-center gap-6 p-6 rounded-2xl border-4 border-dashed border-blue-300 bg-blue-50/30 min-h-[250px] transition-colors relative"
              >
                {/* Tens Area */}
                <div className="flex gap-2 items-end min-w-[40px] justify-end">
                  <AnimatePresence>
                    {tens2.map((t) => (
                      <PuluhanBlock 
                        key={t.id} 
                        id={t.id} 
                        isDraggable={true}
                        onDragEnd={handleDragTenEnd}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                {/* Ones Area */}
                <div className="flex flex-wrap gap-2 w-[80px] justify-start content-end h-full">
                  <AnimatePresence>
                    {ones2.map((o) => (
                      <SatuanBlock 
                        key={o.id} 
                        id={o.id} 
                        isDraggable={true}
                        onDragEnd={handleDragOneEnd}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Box 1 (Kotak Nilai Awal) */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-center font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-200 shadow-sm">
                Kotak Nilai Awal
              </div>
              <div 
                className="flex justify-center gap-6 p-6 rounded-2xl border-4 border-dashed border-emerald-300 bg-emerald-50/30 min-h-[250px] transition-colors relative"
              >
                {/* Tens Area */}
                <div ref={tensBoxRef} className="flex gap-2 items-end min-w-[40px] justify-end relative">
                  <AnimatePresence>
                    {isShattering && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                        exit={{ opacity: 0 }}
                        className="absolute text-rose-500 font-bold text-xl pointer-events-none drop-shadow-md bg-white/80 px-3 py-1 rounded-full z-20"
                        style={{ top: '30%', left: '50%', transform: 'translateX(-50%)' }}
                      >
                        💥 Pecah!
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {tens.map((t) => (
                      <PuluhanBlock 
                        key={t.id} 
                        id={t.id} 
                        isDraggable={!isPenjumlahan} 
                        onDragEnd={handleDragTenEnd}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Ones Area */}
                <div ref={onesBoxRef} className="flex flex-col-reverse flex-wrap gap-[2px] w-[80px] h-[178px] justify-start content-start self-end">
                  <AnimatePresence>
                    {ones.map((o) => (
                      <SatuanBlock 
                        key={o.id} 
                        id={o.id} 
                        isDraggable={targetSubtractOnes > 0} 
                        onDragEnd={handleDragOneEnd}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {breakingTens.length > 0 && (
                    <div className="flex flex-col-reverse gap-[1px] bg-blue-50/50 p-1 rounded-lg border border-blue-200 shadow-sm self-end h-[160px] justify-start ml-2">
                      <AnimatePresence>
                        {breakingTens.map((o) => (
                          <motion.div
                            key={o.id}
                            initial={{ scale: 0, backgroundColor: 'var(--block-puluhan)' }}
                            animate={{ scale: [0, 1.2, 1], backgroundColor: 'var(--block-satuan)' }}
                            transition={{ duration: 1.5 }}
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                            }}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Box 2 (Kotak Pengurang) */}
            {!isSubtractComplete && (
              <div className="flex-1 flex flex-col gap-2 max-w-[250px]">
                <div className="text-center font-bold text-rose-600 bg-rose-50 py-2 rounded-xl border border-rose-200 shadow-sm">
                Kotak Pengurang
              </div>
              <div 
                ref={takeAwayBoxRef}
                className="flex justify-center items-end gap-6 p-6 rounded-2xl border-4 border-dashed border-rose-300 bg-rose-50/30 min-h-[250px] transition-colors relative"
              >
                {/* Petunjuk Target */}
                <div className="absolute top-4 left-0 right-0 text-center font-semibold text-rose-500 opacity-60 text-sm">
                  Target: {targetSubtractTens > 0 ? `${targetSubtractTens} Puluhan, ` : ''}{targetSubtractOnes} Satuan
                </div>

                {/* Tens Area */}
                <div className="flex gap-2 items-end min-w-[40px] justify-end">
                  <AnimatePresence>
                    {subtractedTens.map((t) => (
                      <PuluhanBlock key={t.id} id={t.id} isDraggable={false} />
                    ))}
                  </AnimatePresence>
                </div>
                {/* Ones Area */}
                <div className="flex flex-wrap gap-2 w-[80px] justify-start content-end">
                  <AnimatePresence>
                    {subtractedOnes.map((o) => (
                      <SatuanBlock key={o.id} id={o.id} isDraggable={false} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            )}
          </>
        )}
      </div>
      
      {/* Kotak Hasil Akhir Gabungan */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          className="w-full flex flex-col items-center gap-2 mt-4 overflow-hidden"
        >
          <div className="text-center font-bold text-slate-600 bg-slate-100 py-2 px-6 rounded-xl border border-slate-200 shadow-sm">
            Kotak Hasil Akhir ({isPenjumlahan ? 'Total Gabungan' : 'Sisa Balok'} = ?)
          </div>
          <div className="flex gap-4 items-end justify-center p-6 rounded-2xl border-2 border-slate-300 bg-slate-50 min-h-[180px] w-full max-w-sm">
            <div className="flex gap-1.5 h-[160px] items-end">
              {tens.map((t, i) => (
                <div
                  key={`final-t-${i}`}
                  className="shrink-0"
                  style={{
                    width: 14,
                    height: 140,
                    backgroundColor: 'var(--block-puluhan)',
                    border: '1.5px solid color-mix(in oklch, var(--block-puluhan) 70%, black)',
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 w-[120px] justify-start content-end">
              {[...ones, ...groupedOnes, ...breakingTens].map((o, i) => (
                <div
                  key={`final-s-${i}`}
                  className="shrink-0"
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: 'var(--block-satuan)',
                    border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-2 flex items-center justify-center gap-4">
        {onComplete && (
          <Button 
            onClick={() => onComplete(tens.length, ones.length)}
            className="gap-2 px-8 shadow-md rounded-xl"
            size="lg"
            variant={!isComplete ? 'secondary' : 'default'}
            disabled={!isComplete}
          >
            <Check className="w-5 h-5" /> Selesai
          </Button>
        )}
        
        {isTestUser && onComplete && (
          <Button 
            onClick={() => {
               const finalTens = Math.floor(totalValue / 10);
               const finalOnes = totalValue % 10;
               onComplete(finalTens, finalOnes);
            }}
            className="gap-2 px-8 shadow-md rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300"
            variant="outline"
            size="lg"
          >
            <SkipForward className="w-5 h-5" /> Skip (Test)
          </Button>
        )}
      </div>
    </div>
  );
}
