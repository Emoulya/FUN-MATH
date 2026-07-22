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
    if (!svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();

    const getCenter = (el: HTMLElement | null) => {
      if (!el) return { x: 0, y: 0 };
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

  // Melacak pergerakan sisa balok ke bawah pada pengurangan
  const [remainingUnitsMoved, setRemainingUnitsMoved] = useState(false);
  const [remainingTensMoved, setRemainingTensMoved] = useState(false);

  // Kontrol navigasi animasi manual
  const [langkahSekarang, setLangkahSekarang] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const satuanAnimateCountRef = useRef(satuanAnimateCount);
  satuanAnimateCountRef.current = satuanAnimateCount;
  const pauseTicks = useRef(0);

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
      pauseTicks.current = 0; // Reset jeda animasi
      setRemainingUnitsMoved(false);
      setRemainingTensMoved(false);
    } else if (langkahSekarang === 1) {
      setStep('puluhan');
      setSatuanAnimateCount(targetSatuan);
      setPuluhanAnimateCount(isPenjumlahan ? 0 : puluhan1);
      setRemainingUnitsMoved(true); // Pastikan satuan sudah pindah ke bawah
      setRemainingTensMoved(false);
    } else if (langkahSekarang === 2) {
      setStep('selesai');
      setSatuanAnimateCount(targetSatuan);
      setPuluhanAnimateCount(targetPuluhan);
      setRemainingUnitsMoved(true);
      setRemainingTensMoved(true);
    }
  }, [langkahSekarang, satuan1, puluhan1, targetSatuan, targetPuluhan, isPenjumlahan]);

  // Efek untuk memicu pergerakan sisa balok ke bawah setelah jeda 1 detik (pengurangan)
  useEffect(() => {
    if (!isPenjumlahan) {
      if (step === 'satuan' && satuanAnimateCount === targetSatuan) {
        const timer = setTimeout(() => {
          setRemainingUnitsMoved(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [step, satuanAnimateCount, targetSatuan, isPenjumlahan]);

  useEffect(() => {
    if (!isPenjumlahan) {
      if (step === 'puluhan' && puluhanAnimateCount === targetPuluhan) {
        const timer = setTimeout(() => {
          setRemainingTensMoved(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [step, puluhanAnimateCount, targetPuluhan, isPenjumlahan]);

  // Animasi otomatis penambahan/pengurangan satuan & puluhan
  useEffect(() => {
    if (step === 'satuan') {
      setIsAnimating(true);
      if (isPlaying) {
        const interval = setInterval(() => {
          // Berikan jeda sedikit (1 detik / 1 tick interval) setelah balok angka2 (satuan2) selesai berpindah
          // sebelum mulai memindahkan balok dari angka1.
          if (
            isPenjumlahan &&
            satuanAnimateCountRef.current === satuan2 &&
            satuan2 > 0 &&
            satuan1 > 0 &&
            pauseTicks.current < 1
          ) {
            pauseTicks.current += 1;
            return;
          }

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
  }, [step, targetSatuan, targetPuluhan, isPenjumlahan, isPlaying, satuan2, satuan1]);

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
    : (remainingUnitsMoved
        ? 0
        : (step === 'satuan'
            ? satuanAnimateCount
            : (step === 'puluhan' || step === 'selesai' ? targetSatuan : satuan1)
          )
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
    : (remainingTensMoved
        ? 0
        : (step === 'puluhan'
            ? puluhanAnimateCount
            : (step === 'selesai' ? targetPuluhan : puluhan1)
          )
      );

  // Kotak 2 Puluhan (Kanan)
  const puluhan2Terdisplay = isPenjumlahan
    ? (step === 'satuan'
        ? puluhan2
        : step === 'puluhan'
        ? Math.max(0, puluhan2 - puluhanAnimateCount)
        : 0
      )
    : (step === 'selesai'
        ? 0
        : Math.max(0, puluhan2 - (puluhan1 - puluhanAnimateCount))
      );

  const angka1Terdisplay = (puluhan1Terdisplay * 10) + satuan1Terdisplay;
  const angka2Terdisplay = (puluhan2Terdisplay * 10) + satuan2Terdisplay;

  const simbol = isPenjumlahan ? '+' : '−';

  // Pembantu koordinat dan nilai pengurangan melayang
  const subSatuanX = (coords.s1.x + coords.s2.x) / 2;
  const subSatuanY = Math.min(coords.s1.y, coords.s2.y) - 45;
  const subSatuanVal = satuanAnimateCount - targetSatuan;

  const subPuluhanX = (coords.p1.x + coords.p2.x) / 2;
  const subPuluhanY = Math.min(coords.p1.y, coords.p2.y) - 45;
  const subPuluhanVal = puluhanAnimateCount - targetPuluhan;

  const showHasilAkhirBox = step === 'selesai' || (!isPenjumlahan && (remainingUnitsMoved || remainingTensMoved));

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl select-none">
      {/* Box Instruksi */}
      <div className={`text-center p-4 rounded-2xl w-full border shadow-sm transition-colors duration-500 ${
        step === 'selesai' 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
          : isPenjumlahan 
          ? 'bg-blue-50/80 border-blue-100 text-blue-900' 
          : 'bg-rose-50/80 border-rose-100 text-rose-900'
      }`}>
        <h3 className="font-bold text-lg">
          {isPenjumlahan ? 'Penjumlahan (Gabung Balok)' : 'Pengurangan (Buang Balok)'}
        </h3>
        <p className="text-sm font-medium mt-1">
          {step === 'satuan' && (isPenjumlahan ? 'Mulai jumlahkan dari kolom satuan' : 'Mulai kurangi dari kolom satuan')}
          {step === 'puluhan' && (isPenjumlahan ? 'Mulai jumlahkan dari kolom puluhan' : 'Mulai kurangi dari kolom puluhan')}
          {step === 'selesai' && 'Selesai! Gabungkan hasil puluhan dan satuan.'}
        </p>
      </div>

      {/* Area Visualisasi Balok Utama */}
      <div className="relative flex flex-col items-center gap-6 sm:gap-12 w-full p-3 sm:p-6 bg-slate-50/50 rounded-3xl border border-slate-100 min-h-112.5">
        
        {/* BARIS 1: Angka Awal (Kotak 1 & Kotak 2) */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-8 w-full z-10">
            {/* Kotak Angka 1 (Dinamis berkurang jika pengurangan) */}
            <div className={`flex flex-col items-center gap-1 sm:gap-2 bg-white p-2.5 sm:p-1 rounded-xl sm:rounded-2xl border-2 shadow-sm transition-all duration-300 ${
              step === 'satuan' ? 'border-blue-400' : step === 'puluhan' ? 'border-emerald-400' : 'border-slate-200'
            }`}>
              <div className="flex gap-2 sm:gap-4 items-end min-h-22.5 sm:min-h-25 px-1 sm:px-2">
                {/* Puluhan Angka 1 */}
                {puluhan1 > 0 && (step === 'puluhan' || puluhan1Terdisplay > 0) && (
                  <div 
                    ref={puluhan1Ref}
                    className={`flex gap-0.5 sm:gap-1 p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${
                      step === 'puluhan' 
                        ? 'bg-emerald-100/90 ring-2 ring-emerald-400 border border-emerald-500 shadow-sm' 
                        : 'border border-transparent'
                    }`}
                  >
                    {Array.from({ length: puluhan1Terdisplay }).map((_, i) => (
                      <PuluhanBlock key={`p1-${i}`} />
                    ))}
                  </div>
                )}
                {/* Satuan Angka 1 */}
                {satuan1 > 0 && (step === 'satuan' || satuan1Terdisplay > 0) && (
                  <div 
                    ref={satuan1Ref}
                    className={`grid ${getGridColsClass(satuan1Terdisplay)} gap-1 sm:gap-1.5 p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${
                      step === 'satuan' 
                        ? 'bg-blue-100/90 ring-2 ring-blue-400 border border-blue-500 shadow-sm' 
                        : 'border border-transparent'
                    }`}
                  >
                    {Array.from({ length: satuan1Terdisplay }).map((_, i) => (
                      <SatuanBlock key={`s1-${i}`} />
                    ))}
                  </div>
                )}
              </div>
              <span className="text-lg sm:text-xl font-black text-slate-700 mt-2">{angka1Terdisplay}</span>
            </div>

            {/* Simbol Operasi */}
            <div className="text-2xl sm:text-3xl font-black text-slate-400">{simbol}</div>

            {/* Kotak Angka 2 */}
            <div className={`flex flex-col items-center gap-1 sm:gap-2 bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 shadow-sm transition-all duration-300 ${
              step === 'satuan' 
                ? (isPenjumlahan ? 'border-blue-400' : 'border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]') 
                : step === 'puluhan' 
                ? (isPenjumlahan ? 'border-emerald-400' : 'border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]') 
                : 'border-slate-200'
            }`}>
              <div className="flex gap-2 sm:gap-2 items-end min-h-22.5 sm:min-h-25 px-1 sm:px-2">
                {/* Puluhan Angka 2 */}
                {puluhan2 > 0 && (step === 'puluhan' || puluhan2Terdisplay > 0) && (
                  <div 
                    ref={puluhan2Ref}
                    className={`flex gap-0.5 sm:gap-1 p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${
                      step === 'puluhan' 
                        ? 'bg-emerald-100/90 ring-2 ring-emerald-400 border border-emerald-500 shadow-sm' 
                        : 'border border-transparent'
                    }`}
                  >
                    {Array.from({ length: puluhan2Terdisplay }).map((_, i) => (
                      <PuluhanBlock key={`p2-${i}`} />
                    ))}
                  </div>
                )}
                {/* Satuan Angka 2 */}
                {satuan2 > 0 && (step === 'satuan' || satuan2Terdisplay > 0) && (
                  <div
                    ref={satuan2Ref}
                    className={`
                      grid ${getGridColsClass(satuan2Terdisplay)}
                      gap-1 sm:gap-1.5
                      p-1 sm:p-2
                      content-center
                      place-items-center
                      min-h-5
                      rounded-lg sm:rounded-xl
                      transition-all duration-300
                      ${step === 'satuan'
                        ? 'bg-blue-100/90 ring-2 ring-blue-400 border border-blue-500 shadow-sm'
                        : 'border border-transparent'
                      }
                    `}
                  >
                    {Array.from({ length: satuan2Terdisplay }).map((_, i) => (
                      <SatuanBlock key={`s2-${i}`} />
                    ))}
                  </div>
                )}
              </div>
              <span className="text-lg sm:text-xl font-black text-slate-700 mt-2">{angka2Terdisplay}</span>
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
                    {satuan2 > 0 && (
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
                    )}
                    {/* Garis dari kotak kiri (hanya muncul saat balok kanan sudah habis dipindahkan) */}
                    {satuan1 > 0 && satuanAnimateCount >= satuan2 && (
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
                  satuan2 > 0 && (
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
                  )
                )}
              </AnimatePresence>
            )}

            {/* Garis Panah Puluhan (Langkah 2) */}
            {step === 'puluhan' && (
              <AnimatePresence>
                {isPenjumlahan ? (
                  <>
                    {/* Garis dari kotak kanan (selalu muncul sejak awal di step puluhan) */}
                    {puluhan2 > 0 && (
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
                    )}
                    {/* Garis dari kotak kiri (hanya muncul saat puluhan kanan sudah habis dipindahkan) */}
                    {puluhan1 > 0 && puluhanAnimateCount >= puluhan2 && (
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
                  puluhan2 > 0 && (
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
                  )
                )}
              </AnimatePresence>
            )}
          </svg>

        {/* Floating Subtraction Badge for Satuan */}
        {!isPenjumlahan && step === 'satuan' && satuan2 > 0 && coords.s1.x > 0 && coords.s2.x > 0 && subSatuanVal >= 0 && (
          <motion.div
            initial={{ scale: 0, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              position: 'absolute',
              left: subSatuanX,
              top: subSatuanY,
              transform: 'translate(-50%, -50%)',
            }}
            className="z-20 bg-white border-2 border-red-200 px-3 py-1 rounded-xl shadow-md flex items-center justify-center min-w-12"
          >
            <span className="text-red-500 font-black text-base sm:text-lg">
              {subSatuanVal > 0 ? `-${subSatuanVal}` : '0'}
            </span>
          </motion.div>
        )}

        {/* Floating Subtraction Badge for Puluhan */}
        {!isPenjumlahan && step === 'puluhan' && puluhan2 > 0 && coords.p1.x > 0 && coords.p2.x > 0 && subPuluhanVal >= 0 && (
          <motion.div
            initial={{ scale: 0, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              position: 'absolute',
              left: subPuluhanX,
              top: subPuluhanY,
              transform: 'translate(-50%, -50%)',
            }}
            className="z-20 bg-white border-2 border-red-200 px-3 py-1 rounded-xl shadow-md flex items-center justify-center min-w-12"
          >
            <span className="text-red-500 font-black text-base sm:text-lg">
              {subPuluhanVal > 0 ? `-${subPuluhanVal}` : '0'}
            </span>
          </motion.div>
        )}

        {/* BARIS 2: Wadah Hasil Sementara (Hanya untuk Penjumlahan) */}
        {isPenjumlahan && (
          <div className="flex gap-4 sm:gap-12 md:gap-16 justify-center w-full mt-6 z-10">
            {/* Wadah Target Puluhan */}
            <div 
              ref={wadahPuluhanRef}
              className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all w-30 sm:w-40 min-h-35 sm:min-h-40 bg-white ${
                step === 'puluhan' ? 'border-emerald-400 bg-emerald-50/20 shadow-md scale-105' : 'border-slate-100 opacity-40'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600">Hasil Puluhan</span>
              <div className="flex gap-0.5 sm:gap-1 items-end flex-1 justify-center min-h-17.5 sm:min-h-22.5">
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
              <span className="text-base sm:text-lg font-black text-emerald-700 mt-1">
                {step === 'puluhan' || puluhanWadahCount > 0 ? puluhanWadahCount * 10 : '?'}
              </span>
            </div>

            {/* Wadah Target Satuan */}
            <div 
              ref={wadahSatuanRef}
              className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all w-30 sm:w-40 min-h-35 sm:min-h-40 bg-white ${
                step === 'satuan' ? 'border-blue-400 bg-blue-50/20 shadow-md scale-105' : 'border-slate-100 opacity-60'
              }`}
            >
              <span className="text-[10px] sm:text-xs font-bold text-blue-600">Hasil Satuan</span>
              <div className={`grid ${getGridColsClass(satuanWadahCount)} gap-1 items-end flex-1 justify-center min-h-17.5 sm:min-h-22.5 content-end justify-items-center`}>
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
              <span className="text-base sm:text-lg font-black text-blue-700 mt-1">
                {satuanWadahCount}
              </span>
            </div>
          </div>
        )}

        {/* BARIS 3: Hasil Akhir */}
        <AnimatePresence>
          {showHasilAkhirBox && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15 }}
              className="flex flex-col items-center gap-4 bg-white p-6 rounded-3xl border-2 border-emerald-400 shadow-lg w-full max-w-sm mt-8 z-10"
            >
              {step === 'selesai' && (
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  Hasil Akhir Gabungan
                </div>
              )}
              
              {/* Representasi Balok Gabungan */}
              <div className="flex gap-4 sm:gap-6 items-end justify-center min-h-25 border-b border-dashed border-slate-100 pb-4 w-full">
                {/* Puluhan Akhir */}
                {targetPuluhan > 0 && remainingTensMoved && (
                  <div className="flex gap-1 bg-emerald-50/50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-emerald-100">
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
                )}
                {/* Satuan Akhir */}
                {targetSatuan > 0 && remainingUnitsMoved && (
                  <div className={`grid ${getGridColsClass(targetSatuan)} gap-1 bg-blue-50/50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-blue-100 justify-items-center`}>
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
                )}
              </div>

              {/* Teks Penjelasan */}
              {step === 'selesai' && (
                <div className="text-center flex flex-col gap-1">
                  <span className="text-slate-500 text-xs font-semibold">
                    {targetPuluhan * 10} + {targetSatuan} = {isPenjumlahan ? angka1 + angka2 : angka1 - angka2}
                  </span>
                  <span className="text-2xl font-black text-emerald-800 tracking-tight mt-1">
                    Hasilnya: {isPenjumlahan ? angka1 + angka2 : angka1 - angka2}
                  </span>
                </div>
              )}
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
