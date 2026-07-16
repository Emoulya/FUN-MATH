import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DragDropGameProps {
  angka: number;
  onBenar: () => void;
}

/**
 * Generate jumlah balok sumber yang lebih banyak dari jawaban benar.
 * Puluhan: jawaban + 2 (min 3), Satuan: jawaban + 3 (min 4)
 */
function generateSumber(puluhanBenar: number, satuanBenar: number) {
  return {
    totalPuluhan: Math.max(puluhanBenar + 2, 3),
    totalSatuan: Math.max(satuanBenar + 3, 4),
  };
}

type FeedbackState = 'idle' | 'benar' | 'salah';

export function PlaceValueDragDrop({ angka, onBenar }: DragDropGameProps) {
  const puluhanBenar = Math.floor(angka / 10);
  const satuanBenar = angka % 10;

  const { totalPuluhan, totalSatuan } = generateSumber(puluhanBenar, satuanBenar);

  const [puluhanDiWadah, setPuluhanDiWadah] = useState(0);
  const [satuanDiWadah, setSatuanDiWadah] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');

  const sisaPuluhan = totalPuluhan - puluhanDiWadah;
  const sisaSatuan = totalSatuan - satuanDiWadah;

  const handleDragEndPuluhan = (_e: unknown, info: { offset: { y: number } }) => {
    if (info.offset.y > 40) {
      setPuluhanDiWadah(prev => Math.min(prev + 1, totalPuluhan));
    }
  };

  const handleDragEndSatuan = (_e: unknown, info: { offset: { y: number } }) => {
    if (info.offset.y > 40) {
      setSatuanDiWadah(prev => Math.min(prev + 1, totalSatuan));
    }
  };

  const handleDragEndPuluhanBalik = (_e: unknown, info: { offset: { y: number } }) => {
    if (info.offset.y < -40) {
      setPuluhanDiWadah(prev => Math.max(prev - 1, 0));
    }
  };

  const handleDragEndSatuanBalik = (_e: unknown, info: { offset: { y: number } }) => {
    if (info.offset.y < -40) {
      setSatuanDiWadah(prev => Math.max(prev - 1, 0));
    }
  };

  const sudahAdaIsi = puluhanDiWadah > 0 || satuanDiWadah > 0;

  const periksa = () => {
    if (puluhanDiWadah === puluhanBenar && satuanDiWadah === satuanBenar) {
      setFeedback('benar');
    } else {
      setFeedback('salah');
      // Kembali ke idle setelah 1.5 detik
      setTimeout(() => {
        setFeedback('idle');
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Soal Tertulis */}
      <div className="text-center w-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
        <p className="text-base font-bold text-slate-700 mb-1">
          Susun balok untuk angka <span className="text-2xl font-black text-amber-600">{angka}</span>
        </p>
        <p className="text-sm text-slate-500">
          Taruh <span className="font-bold" style={{ color: 'var(--block-puluhan)' }}>{puluhanBenar} puluhan</span> dan{' '}
          <span className="font-bold" style={{ color: 'var(--block-satuan)' }}>{satuanBenar} satuan</span> ke wadah!
        </p>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">Geser balok ke wadah · Bisa digeser balik ke atas</p>
      </div>

      {/* Sumber Balok (lebih banyak dari jawaban) */}
      <div className="flex justify-center gap-8 min-h-[100px] p-4 bg-muted/30 rounded-xl border-2 border-dashed border-border w-full">
        {/* Puluhan Source */}
        <div className="flex gap-2">
          {Array.from({ length: sisaPuluhan }).map((_, i) => (
            <motion.div
              key={`src-p-${i}`}
              drag
              dragSnapToOrigin
              onDragEnd={handleDragEndPuluhan}
              className="cursor-grab active:cursor-grabbing z-10"
              whileHover={{ scale: 1.05 }}
              whileDrag={{ scale: 1.1, zIndex: 50 }}
            >
              <div
                style={{
                  width: 20,
                  height: 180,
                  backgroundColor: 'var(--block-puluhan)',
                  border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
                  borderRadius: 4
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Satuan Source */}
        <div className="flex flex-wrap gap-2 content-start max-w-[120px]">
          {Array.from({ length: sisaSatuan }).map((_, i) => (
            <motion.div
              key={`src-s-${i}`}
              drag
              dragSnapToOrigin
              onDragEnd={handleDragEndSatuan}
              className="cursor-grab active:cursor-grabbing z-10"
              whileHover={{ scale: 1.1 }}
              whileDrag={{ scale: 1.2, zIndex: 50 }}
            >
              <div
                style={{
                  width: 20,
                  height: 18,
                  backgroundColor: 'var(--block-satuan)',
                  border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                  borderRadius: 3
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Wadah Target */}
      <div className="flex justify-center gap-8 w-full">
        {/* Wadah Puluhan */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-bold text-sm" style={{ color: 'var(--block-puluhan)' }}>Wadah Puluhan</h3>
          <div
            className={`w-32 h-48 border-4 border-dashed rounded-xl flex items-end justify-center p-2 bg-green-50/50 transition-colors ${
              feedback === 'salah' && puluhanDiWadah !== puluhanBenar
                ? 'border-red-400 bg-red-50/50'
                : feedback === 'benar'
                ? 'border-emerald-400 bg-emerald-50/50'
                : ''
            }`}
            style={{ borderColor: feedback === 'idle' ? 'var(--block-puluhan)' : undefined }}
          >
            <div className="flex gap-1">
              {Array.from({ length: puluhanDiWadah }).map((_, i) => (
                <motion.div
                  key={`tgt-p-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  drag
                  dragSnapToOrigin
                  onDragEnd={handleDragEndPuluhanBalik}
                  className="cursor-grab active:cursor-grabbing"
                  whileHover={{ scale: 1.05 }}
                  whileDrag={{ scale: 1.1, zIndex: 50 }}
                  style={{
                    width: 20,
                    height: 180,
                    backgroundColor: 'var(--block-puluhan)',
                    border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
                    borderRadius: 4
                  }}
                />
              ))}
            </div>
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--block-puluhan)' }}>
            {puluhanDiWadah} / {puluhanBenar}
          </span>
        </div>

        {/* Wadah Satuan */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-bold text-sm" style={{ color: 'var(--block-satuan)' }}>Wadah Satuan</h3>
          <div
            className={`w-32 h-48 border-4 border-dashed rounded-xl flex flex-wrap content-end justify-center gap-1 p-2 bg-blue-50/50 transition-colors ${
              feedback === 'salah' && satuanDiWadah !== satuanBenar
                ? 'border-red-400 bg-red-50/50'
                : feedback === 'benar'
                ? 'border-emerald-400 bg-emerald-50/50'
                : ''
            }`}
            style={{ borderColor: feedback === 'idle' ? 'var(--block-satuan)' : undefined }}
          >
            {Array.from({ length: satuanDiWadah }).map((_, i) => (
              <motion.div
                key={`tgt-s-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                drag
                dragSnapToOrigin
                onDragEnd={handleDragEndSatuanBalik}
                className="cursor-grab active:cursor-grabbing"
                whileHover={{ scale: 1.1 }}
                whileDrag={{ scale: 1.2, zIndex: 50 }}
                style={{
                  width: 20,
                  height: 18,
                  backgroundColor: 'var(--block-satuan)',
                  border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
                  borderRadius: 3
                }}
              />
            ))}
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--block-satuan)' }}>
            {satuanDiWadah} / {satuanBenar}
          </span>
        </div>
      </div>

      {/* Feedback & Aksi */}
      <div className="h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {feedback === 'idle' && (
            <motion.div key="periksa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button
                onClick={periksa}
                disabled={!sudahAdaIsi}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Periksa
              </Button>
            </motion.div>
          )}

          {feedback === 'benar' && (
            <motion.div
              key="benar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span className="font-bold text-lg text-emerald-600">Benar!</span>
              </div>
              <Button onClick={onBenar} className="gap-2">
                Lanjut <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {feedback === 'salah' && (
            <motion.div
              key="salah"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 px-5 py-3 rounded-2xl"
            >
              <X className="w-5 h-5 text-red-500" />
              <span className="text-sm font-bold text-red-600">
                Belum tepat! Cek kembali jumlah baloknya.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
