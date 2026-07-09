import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DragDropGameProps {
  angka: number;
  onBenar: () => void;
}

export function PlaceValueDragDrop({ angka, onBenar }: DragDropGameProps) {
  const puluhanBenar = Math.floor(angka / 10);
  const satuanBenar = angka % 10;

  const [puluhanDiWadah, setPuluhanDiWadah] = useState(0);
  const [satuanDiWadah, setSatuanDiWadah] = useState(0);
  const [showSukses, setShowSukses] = useState(false);

  const sisaPuluhan = puluhanBenar - puluhanDiWadah;
  const sisaSatuan = satuanBenar - satuanDiWadah;

  const handleDragEndPuluhan = (e: any, info: any) => {
    if (info.offset.y > 40) {
      setPuluhanDiWadah(prev => Math.min(prev + 1, puluhanBenar));
    }
  };

  const handleDragEndSatuan = (e: any, info: any) => {
    if (info.offset.y > 40) {
      setSatuanDiWadah(prev => Math.min(prev + 1, satuanBenar));
    }
  };

  const handleDragEndPuluhanBalik = (e: any, info: any) => {
    if (info.offset.y < -40) {
      setPuluhanDiWadah(prev => Math.max(prev - 1, 0));
    }
  };

  const handleDragEndSatuanBalik = (e: any, info: any) => {
    if (info.offset.y < -40) {
      setSatuanDiWadah(prev => Math.max(prev - 1, 0));
    }
  };

  const isLengkap = puluhanDiWadah === puluhanBenar && satuanDiWadah === satuanBenar;

  const periksa = () => {
    setShowSukses(true);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      <div className="text-center mb-4">
        <p className="text-lg font-bold text-blue-600 mb-2">Geser (Drag) balok ke wadah di bawah!</p>
        <p className="text-xs text-slate-500">Bisa digeser balik ke atas untuk mengurangi</p>
      </div>

      {/* Sumber Balok */}
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
          <div className="w-32 h-48 border-4 border-dashed rounded-xl flex items-end justify-center p-2 bg-green-50/50" style={{ borderColor: 'var(--block-puluhan)' }}>
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
          <span className="font-bold">{puluhanDiWadah}</span>
        </div>

        {/* Wadah Satuan */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-bold text-sm" style={{ color: 'var(--block-satuan)' }}>Wadah Satuan</h3>
          <div className="w-32 h-48 border-4 border-dashed rounded-xl flex flex-wrap content-end justify-center gap-1 p-2 bg-blue-50/50" style={{ borderColor: 'var(--block-satuan)' }}>
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
          <span className="font-bold">{satuanDiWadah}</span>
        </div>
      </div>

      {/* Feedback & Aksi */}
      <div className="h-16 flex items-center justify-center">
        {!showSukses ? (
          <Button
            onClick={periksa}
            disabled={!isLengkap}
            className={`gap-2 ${isLengkap ? 'animate-bounce' : ''}`}
          >
            <Check className="w-4 h-4" />
            Periksa
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
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
      </div>
    </div>
  );
}
