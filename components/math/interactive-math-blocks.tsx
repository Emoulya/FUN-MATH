'use client';

// ============================================
// InteractiveMathBlocks — Visualisasi Gambar Balok
// ============================================
// Modul 1B: Demonstrasi konkret penjumlahan/pengurangan menggunakan balok Base-10.
// Didesain persis seperti coretan tangan dosen/Prof:
// - Menampilkan angka1 dan angka2 dengan balok terpisah & label nilai di bawahnya.
// - Menghubungkan satuan ke wadah satuan di bawah kanan dengan garis panah (Langkah 1).
// - Menghubungkan puluhan ke wadah puluhan di bawah kiri dengan garis panah (Langkah 2).
// - Menggabungkan keduanya ke hasil akhir di paling bawah tengah (Selesai).

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Wand2, CheckCircle2, SkipBack, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveMathBlocksProps {
  angka1: number;
  angka2: number;
  operasi: 'penjumlahan' | 'pengurangan';
  onSelesai?: () => void;
  compact?: boolean;
}

// ---------------------------------------------
// Sub-components untuk Balok
// ---------------------------------------------
function SatuanBlock({ ghost = false }: { ghost?: boolean }) {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        backgroundColor: ghost ? 'transparent' : 'var(--block-satuan)',
        border: ghost
          ? '1.5px dashed color-mix(in oklch, var(--block-satuan) 40%, transparent)'
          : '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
        borderRadius: 2,
      }}
      className="transition-all duration-300"
    />
  );
}

function PuluhanBlock({ ghost = false }: { ghost?: boolean }) {
  return (
    <div
      style={{
        width: 14,
        height: 80,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: ghost ? 'transparent' : 'var(--block-puluhan)',
        border: ghost
          ? '1.5px dashed color-mix(in oklch, var(--block-puluhan) 40%, transparent)'
          : '1.5px solid color-mix(in oklch, var(--block-puluhan) 70%, black)',
        borderRadius: 3,
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

export default function InteractiveMathBlocks({
  angka1,
  angka2,
  operasi,
  onSelesai,
  compact = false,
}: InteractiveMathBlocksProps) {
  const isPenjumlahan = operasi === 'penjumlahan';

  const puluhan1 = Math.floor(angka1 / 10);
  const satuan1 = angka1 % 10;
  const puluhan2 = Math.floor(angka2 / 10);
  const satuan2 = angka2 % 10;

  // Nilai tujuan / hasil per kolom
  const targetSatuan = isPenjumlahan ? satuan1 + satuan2 : satuan1 - satuan2;
  const targetPuluhan = isPenjumlahan ? puluhan1 + puluhan2 : puluhan1 - puluhan2;

  // Refs untuk deteksi koordinat dinamis & responsif
  const puluhan1Ref = useRef<HTMLDivElement>(null);
  const satuan1Ref = useRef<HTMLDivElement>(null);
  const puluhan2Ref = useRef<HTMLDivElement>(null);
  const satuan2Ref = useRef<HTMLDivElement>(null);
  const wadahPuluhanRef = useRef<HTMLDivElement>(null);
  const wadahSatuanRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [coords, setCoords] = useState<{
    p1: { x: number; y: number };
    s1: { x: number; y: number };
    p2: { x: number; y: number };
    s2: { x: number; y: number };
    wp: { x: number; y: number };
    ws: { x: number; y: number };
  }>({
    p1: { x: 120, y: 120 },
    s1: { x: 180, y: 120 },
    p2: { x: 270, y: 120 },
    s2: { x: 320, y: 120 },
    wp: { x: 130, y: 230 },
    ws: { x: 310, y: 230 },
  });

  // Hitung posisi pusat setiap elemen balok relatif terhadap SVG parent
  const updateCoords = useCallback(() => {
    if (
      !puluhan1Ref.current ||
      !satuan1Ref.current ||
      !puluhan2Ref.current ||
      !satuan2Ref.current ||
      !wadahPuluhanRef.current ||
      !wadahSatuanRef.current ||
      !svgRef.current
    )
      return;

    const svgRect = svgRef.current.getBoundingClientRect();

    const getCenter = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left - svgRect.left + rect.width / 2,
        y: rect.top - svgRect.top + rect.height / 2,
      };
    };

    setCoords({
      p1: getCenter(puluhan1Ref.current),
      s1: getCenter(satuan1Ref.current),
      p2: getCenter(puluhan2Ref.current),
      s2: getCenter(satuan2Ref.current),
      wp: getCenter(wadahPuluhanRef.current),
      ws: getCenter(wadahSatuanRef.current),
    });
  }, []);

  // State alur langkah: 'satuan' -> 'puluhan' -> 'selesai'
  const [step, setStep] = useState<'satuan' | 'puluhan' | 'selesai'>('satuan');
  const [satuanAnimateCount, setSatuanAnimateCount] = useState(satuan1);
  const [puluhanAnimateCount, setPuluhanAnimateCount] = useState(puluhan1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Kontrol navigasi animasi manual
  const [langkahSekarang, setLangkahSekarang] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // States untuk melacak balok satuan dan puluhan terbang saat pengurangan
  const [flyingUnits, setFlyingUnits] = useState<{ id: number }[]>([]);
  const [flyingPuluhan, setFlyingPuluhan] = useState<{ id: number }[]>([]);

  const removeFlyingUnit = (id: number) => {
    setFlyingUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const removeFlyingPuluhan = (id: number) => {
    setFlyingPuluhan((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    if (!isPenjumlahan && step === 'satuan' && satuanAnimateCount < satuan1) {
      const newId = Date.now() + Math.random();
      setFlyingUnits((prev) => [...prev, { id: newId }]);
    }
  }, [satuanAnimateCount, isPenjumlahan, step, satuan1]);

  useEffect(() => {
    if (!isPenjumlahan && step === 'puluhan' && puluhanAnimateCount < puluhan1) {
      const newId = Date.now() + Math.random();
      setFlyingPuluhan((prev) => [...prev, { id: newId }]);
    }
  }, [puluhanAnimateCount, isPenjumlahan, step, puluhan1]);

  // Update koordinat secara real-time saat mount, window resize, atau step berubah
  useEffect(() => {
    const timer = setTimeout(updateCoords, 100);
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoords);
    };
  }, [step, updateCoords]);

  // Sinkronisasi status visual berdasarkan langkahSekarang
  useEffect(() => {
    if (langkahSekarang === 0) {
      setStep('satuan');
      setSatuanAnimateCount(isPenjumlahan ? 0 : satuan1);
      setPuluhanAnimateCount(isPenjumlahan ? 0 : puluhan1);
    } else if (langkahSekarang === 1) {
      setStep('puluhan');
      setSatuanAnimateCount(targetSatuan);
      setPuluhanAnimateCount(isPenjumlahan ? 0 : puluhan1);
    } else if (langkahSekarang === 2) {
      setStep('selesai');
      setSatuanAnimateCount(targetSatuan);
      setPuluhanAnimateCount(targetPuluhan);
    }
  }, [langkahSekarang, satuan1, puluhan1, targetSatuan, targetPuluhan, isPenjumlahan]);

  // Animasi otomatis penambahan/pengurangan satuan & puluhan
  useEffect(() => {
    if (step === 'satuan') {
      setIsAnimating(true);
      if (isPlaying) {
        const interval = setInterval(() => {
          setSatuanAnimateCount((prev) => {
            if (isPenjumlahan) {
              if (prev >= targetSatuan) {
                clearInterval(interval);
                setIsAnimating(false);
                return targetSatuan;
              }
              return prev + 1;
            } else {
              if (prev <= targetSatuan) {
                clearInterval(interval);
                setIsAnimating(false);
                return targetSatuan;
              }
              return prev - 1;
            }
          });
        }, 1000);
        return () => clearInterval(interval);
      } else {
        setIsAnimating(false);
      }
    } else if (step === 'puluhan') {
      setIsAnimating(true);
      if (isPlaying) {
        const interval = setInterval(() => {
          setPuluhanAnimateCount((prev) => {
            if (isPenjumlahan) {
              if (prev >= targetPuluhan) {
                clearInterval(interval);
                setIsAnimating(false);
                return targetPuluhan;
              }
              return prev + 1;
            } else {
              if (prev <= targetPuluhan) {
                clearInterval(interval);
                setIsAnimating(false);
                return targetPuluhan;
              }
              return prev - 1;
            }
          });
        }, 1200);
        return () => clearInterval(interval);
      } else {
        setIsAnimating(false);
      }
    }
  }, [step, targetSatuan, targetPuluhan, isPenjumlahan, isPlaying]);

  // Transisi otomatis langkah jika isPlaying aktif dan animasi hitungan selesai
  useEffect(() => {
    if (isPlaying && !isAnimating) {
      if (langkahSekarang === 0 && satuanAnimateCount === targetSatuan) {
        const timer = setTimeout(() => {
          setLangkahSekarang(1);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (langkahSekarang === 1 && puluhanAnimateCount === targetPuluhan) {
        const timer = setTimeout(() => {
          setLangkahSekarang(2);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [langkahSekarang, isPlaying, isAnimating, satuanAnimateCount, puluhanAnimateCount, targetSatuan, targetPuluhan]);

  // --- SATUAN ---
  // Wadah hasil satuan di bawah
  const satuanWadahCount = isPenjumlahan
    ? satuanAnimateCount
    : (step === 'satuan'
        ? Math.floor(((satuan1 - satuanAnimateCount) / Math.max(1, satuan2)) * targetSatuan)
        : targetSatuan
      );

  // Kotak 1 Satuan (Kiri)
  const satuan1Terdisplay = isPenjumlahan
    ? (step === 'satuan'
        ? (satuanAnimateCount <= satuan2
            ? satuan1
            : Math.max(0, satuan1 - (satuanAnimateCount - satuan2))
          )
        : (step === 'puluhan' || step === 'selesai' ? 0 : satuan1)
      )
    : (step === 'satuan'
        ? satuanAnimateCount
        : (step === 'puluhan' || step === 'selesai' ? targetSatuan : satuan1)
      );

  // Kotak 2 Satuan (Kanan)
  const satuan2Terdisplay = isPenjumlahan
    ? (step === 'satuan'
        ? Math.max(0, satuan2 - satuanAnimateCount)
        : 0
      )
    : (step === 'satuan'
        ? Math.max(0, satuan1 - satuanAnimateCount)
        : 0
      );

  // --- PULUHAN ---
  // Wadah hasil puluhan di bawah
  const puluhanWadahCount = isPenjumlahan
    ? puluhanAnimateCount
    : (step === 'puluhan'
        ? Math.floor(((puluhan1 - puluhanAnimateCount) / Math.max(1, puluhan2)) * targetPuluhan)
        : (step === 'selesai' ? targetPuluhan : 0)
      );

  // Kotak 1 Puluhan (Kiri)
  const puluhan1Terdisplay = isPenjumlahan
    ? (step === 'puluhan'
        ? (puluhanAnimateCount <= puluhan2
            ? puluhan1
            : Math.max(0, puluhan1 - (puluhanAnimateCount - puluhan2))
          )
        : (step === 'selesai' ? 0 : puluhan1)
      )
    : (step === 'puluhan'
        ? puluhanAnimateCount
        : (step === 'selesai' ? targetPuluhan : puluhan1)
      );

  // Kotak 2 Puluhan (Kanan)
  const puluhan2Terdisplay = isPenjumlahan
    ? (step === 'puluhan'
        ? Math.max(0, puluhan2 - puluhanAnimateCount)
        : 0
      )
    : (step === 'puluhan'
        ? Math.max(0, puluhan1 - puluhanAnimateCount)
        : 0
      );

  const angka1Terdisplay = (puluhan1Terdisplay * 10) + satuan1Terdisplay;
  const angka2Terdisplay = (puluhan2Terdisplay * 10) + satuan2Terdisplay;

  const simbol = isPenjumlahan ? '+' : '−';

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl select-none">
      {/* Box Instruksi */}
      <div className={`text-center p-4 rounded-2xl w-full border shadow-sm transition-colors duration-500 ${step === 'selesai' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-blue-50/80 border-blue-100 text-blue-900'}`}>
        <h3 className="font-bold text-lg">
          {isPenjumlahan ? 'Penjumlahan (Gabung Balok)' : 'Pengurangan (Buang Balok)'}
        </h3>
        <p className="text-sm font-medium mt-1">
          {step === 'satuan' && `Langkah 1: Hubungkan & ${isPenjumlahan ? 'jumlahkan' : 'kurangkan'} kolom SATUAN (kanan).`}
          {step === 'puluhan' && `Langkah 2: Hubungkan & ${isPenjumlahan ? 'jumlahkan' : 'kurangkan'} kolom PULUHAN (kiri).`}
          {step === 'selesai' && 'Selesai! Gabungkan hasil puluhan dan satuan.'}
        </p>
      </div>

      {/* Area Visualisasi Balok Utama */}
      <div className="relative flex flex-col items-center gap-12 w-full p-6 bg-slate-50/50 rounded-3xl border border-slate-100 min-h-[450px]">
        
        {/* BARIS 1: Angka Awal (Kotak 1 & Kotak 2) */}
        <div className="flex items-center justify-center gap-8 w-full z-10">
            {/* Kotak Angka 1 (Dinamis berkurang jika pengurangan) */}
            <div className={`flex flex-col items-center gap-2 bg-white p-4 rounded-2xl border-2 shadow-sm transition-all duration-300 ${
              step === 'satuan' ? 'border-blue-400' : step === 'puluhan' ? 'border-emerald-400' : 'border-slate-200'
            }`}>
              <div className="flex gap-4 items-end min-h-[100px] px-2">
                {/* Puluhan Angka 1 */}
                <div 
                  ref={puluhan1Ref}
                  className={`flex gap-1 p-2 rounded-xl transition-all duration-300 ${
                    step === 'puluhan' 
                      ? 'bg-emerald-100/90 ring-4 ring-emerald-500 ring-offset-2 scale-105 border-2 border-emerald-400 shadow-md' 
                      : 'border border-transparent'
                  }`}
                >
                  {Array.from({ length: puluhan1Terdisplay }).map((_, i) => (
                    <PuluhanBlock key={`p1-${i}`} />
                  ))}
                </div>
                {/* Satuan Angka 1 */}
                <div 
                  ref={satuan1Ref}
                  className={`flex flex-wrap max-w-[70px] gap-1.5 p-2 rounded-xl transition-all duration-300 ${
                    step === 'satuan' 
                      ? 'bg-blue-100/90 ring-4 ring-blue-500 ring-offset-2 scale-105 border-2 border-blue-400 shadow-md' 
                      : 'border border-transparent'
                  }`}
                >
                  {Array.from({ length: satuan1Terdisplay }).map((_, i) => (
                    <SatuanBlock key={`s1-${i}`} />
                  ))}
                </div>
              </div>
              <span className="text-xl font-black text-slate-700 mt-2">{angka1Terdisplay}</span>
            </div>

            {/* Simbol Operasi */}
            <div className="text-3xl font-black text-slate-400">{simbol}</div>

            {/* Kotak Angka 2 */}
            <div className={`flex flex-col items-center gap-2 bg-white p-4 rounded-2xl border-2 shadow-sm transition-all duration-300 ${
              step === 'satuan' ? 'border-blue-400' : step === 'puluhan' ? 'border-emerald-400' : 'border-slate-200'
            }`}>
              <div className="flex gap-4 items-end min-h-[100px] px-2">
                {/* Puluhan Angka 2 */}
                <div 
                  ref={puluhan2Ref}
                  className={`flex gap-1 p-2 rounded-xl transition-all duration-300 ${
                    step === 'puluhan' 
                      ? 'bg-emerald-100/90 ring-4 ring-emerald-500 ring-offset-2 scale-105 border-2 border-emerald-400 shadow-md' 
                      : 'border border-transparent'
                  }`}
                >
                  {Array.from({ length: puluhan2Terdisplay }).map((_, i) => (
                    <PuluhanBlock key={`p2-${i}`} />
                  ))}
                </div>
                {/* Satuan Angka 2 */}
                <div 
                  ref={satuan2Ref}
                  className={`flex flex-wrap max-w-[70px] gap-1.5 p-2 rounded-xl transition-all duration-300 ${
                    step === 'satuan' 
                      ? 'bg-blue-100/90 ring-4 ring-blue-500 ring-offset-2 scale-105 border-2 border-blue-400 shadow-md' 
                      : 'border border-transparent'
                  }`}
                >
                  {Array.from({ length: satuan2Terdisplay }).map((_, i) => (
                    <SatuanBlock key={`s2-${i}`} />
                  ))}
                </div>
              </div>
              <span className="text-xl font-black text-slate-700 mt-2">{angka2Terdisplay}</span>
            </div>
          </div>

        {/* SVG Garis Panah Penghubung Dinamis */}
        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
              <marker id="arrow-emerald" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
            </defs>
            
            {/* Garis Panah Satuan (Langkah 1) */}
            {step === 'satuan' && (
              <AnimatePresence>
                {isPenjumlahan ? (
                  <>
                    {/* Garis dari kotak kanan (selalu muncul sejak awal di step satuan) */}
                    <motion.path
                      key="arrow-s2"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.8 }}
                      transition={{ duration: 0.8 }}
                      d={`M ${coords.s2.x},${coords.s2.y} Q ${(coords.s2.x + coords.ws.x) / 2},${Math.min(coords.s2.y, coords.ws.y) - 30} ${coords.ws.x},${coords.ws.y - 80}`}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      strokeDasharray="6,6"
                      markerEnd="url(#arrow-blue)"
                    />
                    {/* Garis dari kotak kiri (hanya muncul saat balok kanan sudah habis dipindahkan) */}
                    {satuanAnimateCount >= satuan2 && (
                      <motion.path
                        key="arrow-s1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.8 }}
                        transition={{ duration: 0.8 }}
                        d={`M ${coords.s1.x},${coords.s1.y} Q ${(coords.s1.x + coords.ws.x) / 2},${Math.min(coords.s1.y, coords.ws.y) - 20} ${coords.ws.x},${coords.ws.y - 80}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        strokeDasharray="6,6"
                        markerEnd="url(#arrow-blue)"
                      />
                    )}
                  </>
                ) : (
                  <motion.path
                    key="arrow-sub-s"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.8 }}
                    d={`M ${coords.s1.x},${coords.s1.y} Q ${(coords.s1.x + coords.s2.x) / 2},${Math.min(coords.s1.y, coords.s2.y) - 30} ${coords.s2.x},${coords.s2.y}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeDasharray="6,6"
                    markerEnd="url(#arrow-blue)"
                  />
                )}
              </AnimatePresence>
            )}

            {/* Garis Panah Puluhan (Langkah 2) */}
            {step === 'puluhan' && (
              <AnimatePresence>
                {isPenjumlahan ? (
                  <>
                    {/* Garis dari kotak kanan (selalu muncul sejak awal di step puluhan) */}
                    <motion.path
                      key="arrow-p2"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.8 }}
                      transition={{ duration: 0.8 }}
                      d={`M ${coords.p2.x},${coords.p2.y} Q ${(coords.p2.x + coords.wp.x) / 2 - 40},${Math.min(coords.p2.y, coords.wp.y) - 50} ${coords.wp.x},${coords.wp.y - 80}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeDasharray="6,6"
                      markerEnd="url(#arrow-emerald)"
                    />
                    {/* Garis dari kotak kiri (hanya muncul saat puluhan kanan sudah habis dipindahkan) */}
                    {puluhanAnimateCount >= puluhan2 && (
                      <motion.path
                        key="arrow-p1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.8 }}
                        transition={{ duration: 0.8 }}
                        d={`M ${coords.p1.x},${coords.p1.y} Q ${(coords.p1.x + coords.wp.x) / 2},${Math.min(coords.p1.y, coords.wp.y) - 35} ${coords.wp.x},${coords.wp.y - 80}`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeDasharray="6,6"
                        markerEnd="url(#arrow-emerald)"
                      />
                    )}
                  </>
                ) : (
                  <motion.path
                    key="arrow-sub-p"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.8 }}
                    d={`M ${coords.p1.x},${coords.p1.y} Q ${(coords.p1.x + coords.p2.x) / 2},${Math.min(coords.p1.y, coords.p2.y) - 30} ${coords.p2.x},${coords.p2.y}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeDasharray="6,6"
                    markerEnd="url(#arrow-emerald)"
                  />
                )}
              </AnimatePresence>
            )}
          </svg>

        {/* BARIS 2: Wadah Hasil Sementara (Hanya untuk Penjumlahan) */}
        {isPenjumlahan && (
          <div className="flex gap-16 justify-center w-full mt-6 z-10">
            {/* Wadah Target Puluhan */}
            <div 
              ref={wadahPuluhanRef}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all w-40 min-h-[160px] bg-white ${
                step === 'puluhan' ? 'border-emerald-400 bg-emerald-50/20 shadow-md scale-105' : 'border-slate-100 opacity-40'
              }`}
            >
              <span className="text-xs font-bold text-emerald-600">Hasil Puluhan</span>
              <div className="flex gap-1 items-end flex-1 justify-center min-h-[90px]">
                {Array.from({ length: puluhanWadahCount }).map((_, i) => (
                  <motion.div
                    key={`res-p-${i}`}
                    initial={{ y: -50, scale: 0, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  >
                    <PuluhanBlock />
                  </motion.div>
                ))}
              </div>
              <span className="text-lg font-black text-emerald-700 mt-1">
                {step === 'puluhan' || puluhanWadahCount > 0 ? puluhanWadahCount * 10 : '?'}
              </span>
            </div>

            {/* Wadah Target Satuan */}
            <div 
              ref={wadahSatuanRef}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all w-40 min-h-[160px] bg-white ${
                step === 'satuan' ? 'border-blue-400 bg-blue-50/20 shadow-md scale-105' : 'border-slate-100 opacity-60'
              }`}
            >
              <span className="text-xs font-bold text-blue-600">Hasil Satuan</span>
              <div className="flex flex-wrap max-w-[85px] gap-1 items-end flex-1 justify-center min-h-[90px] content-end">
                {Array.from({ length: satuanWadahCount }).map((_, i) => (
                  <motion.div
                    key={`res-s-${i}`}
                    initial={{ y: -50, scale: 0, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  >
                    <SatuanBlock />
                  </motion.div>
                ))}
              </div>
              <span className="text-lg font-black text-blue-700 mt-1">
                {satuanWadahCount}
              </span>
            </div>
          </div>
        )}

        {/* BARIS 3: Hasil Akhir (Hanya muncul ketika selesai) */}
        <AnimatePresence>
          {step === 'selesai' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15 }}
              className="flex flex-col items-center gap-4 bg-white p-6 rounded-3xl border-2 border-emerald-400 shadow-lg w-full max-w-sm mt-8 z-10"
            >
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                Hasil Akhir Gabungan
              </div>
              
              {/* Representasi Balok Gabungan */}
              <div className="flex gap-6 items-end justify-center min-h-[100px] border-b border-dashed border-slate-100 pb-4 w-full">
                {/* Puluhan Akhir */}
                <div className="flex gap-1.5 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                  {Array.from({ length: targetPuluhan }).map((_, i) => (
                    <motion.div
                      key={`final-p-${i}`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <PuluhanBlock />
                    </motion.div>
                  ))}
                </div>
                {/* Satuan Akhir */}
                <div className="flex flex-wrap max-w-[80px] gap-1 bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                  {Array.from({ length: targetSatuan }).map((_, i) => (
                    <motion.div
                      key={`final-s-${i}`}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <SatuanBlock />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Teks Penjelasan */}
              <div className="text-center flex flex-col gap-1">
                <span className="text-slate-500 text-xs font-semibold">
                  {targetPuluhan * 10} + {targetSatuan} = {isPenjumlahan ? angka1 + angka2 : angka1 - angka2}
                </span>
                <span className="text-2xl font-black text-emerald-800 tracking-tight mt-1">
                  Hasilnya: {isPenjumlahan ? angka1 + angka2 : angka1 - angka2}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel Kontrol Navigasi Langkah Manual */}
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto mt-4 border-t border-border pt-4 z-10">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground w-12 text-right">
              Langkah {langkahSekarang + 1} / 3
            </span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${((langkahSekarang + 1) / 3) * 100}%` }}
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
                setIsPlaying(true);
              }}
              disabled={langkahSekarang === 0 && !isPlaying}
              title="Ulangi dari awal"
              className="rounded-xl w-10 h-10"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            {/* Sebelumnya */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (langkahSekarang > 0) {
                  setLangkahSekarang((prev) => prev - 1);
                }
              }}
              disabled={langkahSekarang === 0}
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
              disabled={langkahSekarang === 2 && !isPlaying}
              title={isPlaying ? 'Jeda' : 'Putar otomatis'}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            {/* Berikutnya */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (langkahSekarang < 2) {
                  setLangkahSekarang((prev) => prev + 1);
                }
              }}
              disabled={langkahSekarang === 2}
              title="Langkah berikutnya"
              className="rounded-xl w-10 h-10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tombol Lanjut ke Angka */}
        {step === 'selesai' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full flex flex-col items-center gap-2 mt-4 z-10"
          >
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-5 py-2 rounded-full text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Selesai! Kamu hebat!</span>
            </div>
            {!compact && onSelesai && (
              <Button onClick={onSelesai} size="lg" className="gap-2 px-8 shadow-md rounded-2xl w-full max-w-xs mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Lanjut ke Perhitungan Angka
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </motion.div>
        )}

        {/* Render Balok Satuan Terbang */}
        {flyingUnits.map((block) => (
          <motion.div
            key={block.id}
            initial={{ left: coords.s1.x - 7, top: coords.s1.y - 7, opacity: 1, scale: 1 }}
            animate={{ left: coords.s2.x - 7, top: coords.s2.y - 7, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            onAnimationComplete={() => removeFlyingUnit(block.id)}
            className="absolute z-30 pointer-events-none"
          >
            <SatuanBlock />
          </motion.div>
        ))}

        {/* Render Batang Puluhan Terbang */}
        {flyingPuluhan.map((block) => (
          <motion.div
            key={block.id}
            initial={{ left: coords.p1.x - 7, top: coords.p1.y - 40, opacity: 1, scale: 1 }}
            animate={{ left: coords.p2.x - 7, top: coords.p2.y - 40, opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            onAnimationComplete={() => removeFlyingPuluhan(block.id)}
            className="absolute z-30 pointer-events-none"
          >
            <PuluhanBlock />
          </motion.div>
        ))}

      </div>
    </div>
  );
}
