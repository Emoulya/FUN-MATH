'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface MatchItem {
  id: number;
  angka: number;
  puluhan: number;
  satuan: number;
}

interface PlaceValueMatchGameProps {
  onBenar: () => void;
}

export default function PlaceValueMatchGame({ onBenar }: PlaceValueMatchGameProps) {
  // Soal mencocokkan statis atau dinamis
  const [itemsLeft, setItemsLeft] = useState<MatchItem[]>([
    { id: 1, angka: 25, puluhan: 2, satuan: 5 },
    { id: 2, angka: 14, puluhan: 1, satuan: 4 },
    { id: 3, angka: 32, puluhan: 3, satuan: 2 },
  ]);

  const [itemsRight, setItemsRight] = useState<MatchItem[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<number[]>([]); // Menyimpan id yang sudah cocok

  // Shuffle items di sisi kanan saat inisialisasi
  useEffect(() => {
    const shuffled = [...itemsLeft].sort(() => Math.random() - 0.5);
    setItemsRight(shuffled);
  }, []);

  const handleSelectLeft = (id: number) => {
    if (matches.includes(id)) return;
    setSelectedLeft(id);
    // Jika di kanan sudah dipilih, periksa kecocokan
    if (selectedRight !== null) {
      checkMatch(id, selectedRight);
    }
  };

  const handleSelectRight = (id: number) => {
    if (matches.includes(id)) return;
    setSelectedRight(id);
    // Jika di kiri sudah dipilih, periksa kecocokan
    if (selectedLeft !== null) {
      checkMatch(selectedLeft, id);
    }
  };

  const checkMatch = (leftId: number, rightId: number) => {
    if (leftId === rightId) {
      // Cocok!
      setMatches((prev) => [...prev, leftId]);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Salah
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const isSelesai = matches.length === itemsLeft.length;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md p-6 bg-card rounded-3xl border border-border shadow-xl">
      <div className="text-center">
        <h3 className="text-lg font-bold text-blue-600">Game Mencocokkan Nilai Tempat</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Hubungkan angka dengan balok yang sesuai!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full mt-4">
        {/* Kolom Kiri: Angka */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-slate-500 text-center">Angka</h4>
          {itemsLeft.map((item) => {
            const isMatched = matches.includes(item.id);
            const isSelected = selectedLeft === item.id;
            return (
              <motion.button
                key={`left-${item.id}`}
                onClick={() => handleSelectLeft(item.id)}
                disabled={isMatched}
                whileHover={!isMatched ? { scale: 1.05 } : {}}
                whileTap={!isMatched ? { scale: 0.95 } : {}}
                className={`flex items-center justify-center p-5 rounded-2xl border-2 text-2xl font-black transition-all h-20 ${
                  isMatched
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-500 opacity-60'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'border-border bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {isMatched ? <Check className="w-6 h-6" /> : item.angka}
              </motion.button>
            );
          })}
        </div>

        {/* Kolom Kanan: Balok */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-slate-500 text-center">Balok</h4>
          {itemsRight.map((item) => {
            const isMatched = matches.includes(item.id);
            const isSelected = selectedRight === item.id;
            return (
              <motion.button
                key={`right-${item.id}`}
                onClick={() => handleSelectRight(item.id)}
                disabled={isMatched}
                whileHover={!isMatched ? { scale: 1.05 } : {}}
                whileTap={!isMatched ? { scale: 0.95 } : {}}
                className={`flex items-center justify-center p-3 rounded-2xl border-2 transition-all h-20 overflow-hidden ${
                  isMatched
                    ? 'border-emerald-200 bg-emerald-50 opacity-60'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-border bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {isMatched ? (
                  <Check className="w-6 h-6 text-emerald-500" />
                ) : (
                  <div className="flex items-end justify-center gap-2 h-full py-1">
                    {/* Batang puluhan */}
                    <div className="flex items-end gap-0.5">
                      {Array.from({ length: item.puluhan }).map((_, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: 6,
                            height: 40,
                            backgroundColor: 'var(--block-puluhan)',
                            border: '0.5px solid black',
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </div>
                    {/* Kotak satuan */}
                    <div className="flex flex-wrap max-w-[30px] gap-0.5 content-end justify-center">
                      {Array.from({ length: item.satuan }).map((_, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: 6,
                            height: 6,
                            backgroundColor: 'var(--block-satuan)',
                            border: '0.5px solid black',
                            borderRadius: 0.5,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="h-14 mt-4 flex items-center justify-center w-full">
        <AnimatePresence>
          {isSelesai && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-2 w-full"
            >
              <Button
                onClick={onBenar}
                className="w-full gap-2 rounded-2xl shadow-md"
                size="lg"
              >
                Lanjut ke Game Drag-Drop
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
