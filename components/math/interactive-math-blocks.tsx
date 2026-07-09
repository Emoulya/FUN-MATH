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
import { Check, ArrowRight, Wand2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveMathBlocksProps {
  angka1: number;
  angka2: number;
  operasi: 'penjumlahan' | 'pengurangan';
  onSelesai: () => void;
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
}: InteractiveMathBlocksProps) {
  const isPenjumlahan = operasi === 'penjumlahan';

  const puluhan1 = Math.floor(angka1 / 10);
  const satuan1 = angka1 % 10;
  const puluhan2 = Math.floor(angka2 / 10);
  const satuan2 = angka2 % 10;

  // Nilai tujuan / hasil per kolom
  const targetSatuan = isPenjumlahan ? satuan1 + satuan2 : satuan1 - satuan2;
  const targetPuluhan = isPenjumlahan ? puluhan1 + puluhan2 : puluhan1 - puluhan2;

  // Refs untuk deteksi koordinat dinamis & responsif (100% tepat menunjuk ke balok)
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
  const [satuanAnimateCount, setSatuanAnimateCount] = useState(0);
  const [puluhanAnimateCount, setPuluhanAnimateCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Update koordinat secara real-time saat mount, window resize, atau step berubah
  useEffect(() => {
    // Berikan jeda sedikit agar layout rendering stabil sebelum koordinat diukur
    const timer = setTimeout(updateCoords, 100);
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoords);
    };
  }, [step, updateCoords]);

  // Animasi otomatis saat berpindah step
  useEffect(() => {
    if (step === 'satuan') {
      setIsAnimating(true);
      setSatuanAnimateCount(satuan1); // Mulai dari jumlah satuan angka1
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
      }, 500);
      return () => clearInterval(interval);
    } else if (step === 'puluhan') {
      setIsAnimating(true);
      setPuluhanAnimateCount(puluhan1); // Mulai dari jumlah puluhan angka1
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
      }, 600);
      return () => clearInterval(interval);
    }
  }, [step, satuan1, puluhan1, targetSatuan, targetPuluhan, isPenjumlahan]);

  const handleNextStep = () => {
    if (isAnimating) return;
    if (step === 'satuan') {
      setStep('puluhan');
    } else if (step === 'puluhan') {
      setStep('selesai');
    }
  };

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
        {step !== 'selesai' && (
          <div className="flex items-center justify-center gap-8 w-full z-10">
            {/* Kotak Angka 1 */}
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
                  {Array.from({ length: puluhan1 }).map((_, i) => (
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
                  {Array.from({ length: satuan1 }).map((_, i) => (
                    <SatuanBlock key={`s1-${i}`} />
                  ))}
                </div>
              </div>
              <span className="text-xl font-black text-slate-700 mt-2">{angka1}</span>
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
                  {isPenjumlahan ? (
                    Array.from({ length: puluhan2 }).map((_, i) => (
                      <PuluhanBlock key={`p2-${i}`} />
                    ))
                  ) : (
                    // Tanda silang merah halus jika dikurangi
                    <div className="text-xs text-red-500 font-bold px-2">-{puluhan2} puluhan</div>
                  )}
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
                  {isPenjumlahan ? (
                    Array.from({ length: satuan2 }).map((_, i) => (
                      <SatuanBlock key={`s2-${i}`} />
                    ))
                  ) : (
                    <div className="text-xs text-red-500 font-bold px-2">-{satuan2} satuan</div>
                  )}
                </div>
              </div>
              <span className="text-xl font-black text-slate-700 mt-2">{angka2}</span>
            </div>
          </div>
        )}

        {/* SVG Garis Panah Penghubung Dinamis (100% Presisi Mengikuti Letak Balok) */}
        {step !== 'selesai' && (
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
                {/* Panah dari Satuan 1 (Kiri) ke Wadah Satuan Hasil (Kanan Bawah) */}
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
                {/* Panah dari Satuan 2 (Kanan) ke Wadah Satuan Hasil (Kanan Bawah) */}
                <motion.path
                  key="arrow-s2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  d={`M ${coords.s2.x},${coords.s2.y} Q ${(coords.s2.x + coords.ws.x) / 2},${Math.min(coords.s2.y, coords.ws.y) - 30} ${coords.ws.x},${coords.ws.y - 80}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray="6,6"
                  markerEnd="url(#arrow-blue)"
                />
              </AnimatePresence>
            )}

            {/* Garis Panah Puluhan (Langkah 2) */}
            {step === 'puluhan' && (
              <AnimatePresence>
                {/* Panah dari Puluhan 1 (Kiri) ke Wadah Puluhan Hasil (Kiri Bawah) */}
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
                {/* Panah dari Puluhan 2 (Kanan) ke Wadah Puluhan Hasil (Kiri Bawah) - Melengkung Rapi Menghindari Simbol + */}
                <motion.path
                  key="arrow-p2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  d={`M ${coords.p2.x},${coords.p2.y} Q ${(coords.p2.x + coords.wp.x) / 2 - 40},${Math.min(coords.p2.y, coords.wp.y) - 50} ${coords.wp.x},${coords.wp.y - 80}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray="6,6"
                  markerEnd="url(#arrow-emerald)"
                />
              </AnimatePresence>
            )}
          </svg>
        )}

        {/* BARIS 2: Wadah Hasil Sementara */}
        {step !== 'selesai' && (
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
                {Array.from({ length: puluhanAnimateCount }).map((_, i) => (
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
                {step === 'puluhan' || puluhanAnimateCount > 0 ? puluhanAnimateCount * 10 : '?'}
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
                {Array.from({ length: satuanAnimateCount }).map((_, i) => (
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
                {satuanAnimateCount}
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

              {/* Teks Penjelasan Sesuai Gambar Prof */}
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

        {/* Kontrol Langkah */}
        {step !== 'selesai' && (
          <div className="mt-4 w-full flex justify-end z-10">
            <Button
              onClick={handleNextStep}
              disabled={isAnimating}
              className="gap-2 px-6 shadow-md rounded-2xl transition-all animate-bounce"
            >
              Lanjut Langkah
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Tombol Lanjut ke Angka (Hanya saat Selesai) */}
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
            <Button onClick={onSelesai} size="lg" className="gap-2 px-8 shadow-md rounded-2xl w-full max-w-xs mt-2">
              Lanjut ke Perhitungan Angka
            </Button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
