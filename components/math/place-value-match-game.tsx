'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, X } from 'lucide-react';

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

interface MatchItem {
  id: number;
  angka: number;
  puluhan: number;
  satuan: number;
}

interface PlaceValueMatchGameProps {
  onBenar: () => void;
}

/**
 * Generate 6 angka acak unik (10 - 56) untuk 2 ronde mencocokkan.
 * Menjamin tidak ada angka yang terduplikasi di antara kedua ronde.
 */
function generateMatchSoal(): { ronde1: MatchItem[]; ronde2: MatchItem[] } {
  const setAngka = new Set<number>();
  while (setAngka.size < 6) {
    const randomVal = Math.floor(Math.random() * 47) + 10; // rentang 10 s.d. 56
    setAngka.add(randomVal);
  }
  const allNumbers = Array.from(setAngka);

  const ronde1 = allNumbers.slice(0, 3).map((angka, idx) => ({
    id: idx + 1,
    angka,
    puluhan: Math.floor(angka / 10),
    satuan: angka % 10,
  }));

  const ronde2 = allNumbers.slice(3, 6).map((angka, idx) => ({
    id: idx + 4,
    angka,
    puluhan: Math.floor(angka / 10),
    satuan: angka % 10,
  }));

  return { ronde1, ronde2 };
}

type FeedbackState = {
  type: 'benar' | 'salah';
  leftId: number;
  rightId: number;
} | null;

export default function PlaceValueMatchGame({ onBenar }: PlaceValueMatchGameProps) {
  const [ronde, setRonde] = useState<1 | 2>(1);
  const [soalData] = useState(() => generateMatchSoal());

  const [itemsLeft, setItemsLeft] = useState<MatchItem[]>([]);
  const [itemsRight, setItemsRight] = useState<MatchItem[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<number[]>([]); // Menyimpan id yang sudah cocok
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  // Inisialisasi & Reset Data saat pergantian ronde
  useEffect(() => {
    const currentList = ronde === 1 ? soalData.ronde1 : soalData.ronde2;
    setItemsLeft(currentList);
    // Shuffle items di sisi kanan
    const shuffled = [...currentList].sort(() => Math.random() - 0.5);
    setItemsRight(shuffled);
    // Reset state pilihan dan matches
    setMatches([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setFeedback(null);
  }, [ronde, soalData]);

  const handleSelectLeft = (id: number) => {
    if (matches.includes(id) || feedback !== null) return;
    setSelectedLeft(id);
    if (selectedRight !== null) {
      checkMatch(id, selectedRight);
    }
  };

  const handleSelectRight = (id: number) => {
    if (matches.includes(id) || feedback !== null) return;
    setSelectedRight(id);
    if (selectedLeft !== null) {
      checkMatch(selectedLeft, id);
    }
  };

  const checkMatch = (leftId: number, rightId: number) => {
    if (leftId === rightId) {
      // Cocok! — tampilkan feedback benar
      setFeedback({ type: 'benar', leftId, rightId });
      setTimeout(() => {
        setMatches((prev) => [...prev, leftId]);
        setSelectedLeft(null);
        setSelectedRight(null);
        setFeedback(null);
      }, 600);
    } else {
      // Salah — tampilkan feedback salah
      setFeedback({ type: 'salah', leftId, rightId });
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setFeedback(null);
      }, 700);
    }
  };

  // Cek apakah kartu mendapat feedback (untuk styling)
  const getCardFeedback = (id: number, side: 'left' | 'right') => {
    if (!feedback) return null;
    if (side === 'left' && feedback.leftId === id) return feedback.type;
    if (side === 'right' && feedback.rightId === id) return feedback.type;
    return null;
  };

  const isSelesai = matches.length === itemsLeft.length && itemsLeft.length > 0;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md p-6 bg-card rounded-3xl border border-border shadow-xl">
      <div className="text-center w-full">
        <div className="px-3 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-950/20 text-[10px] font-bold rounded-full inline-block mb-1">
          Ronde {ronde} dari 2
        </div>
        <h3 className="text-lg font-bold text-blue-600">Game Mencocokkan Nilai Tempat</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Hubungkan angka dengan balok yang sesuai!
        </p>
        
        {/* Banner Feedback Dinamis (Hebat / Coba Lagi) */}
        <div className="h-10 w-full flex items-center justify-center relative overflow-hidden mt-3">
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                key={feedback.type}
                initial={{ y: -20, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className={`px-6 py-1 rounded-full text-xs font-bold shadow-sm border flex items-center gap-1.5 ${
                  feedback.type === 'benar'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20'
                    : 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 animate-shake'
                }`}
              >
                {feedback.type === 'benar' ? 'Hebat! 🎉' : 'Coba lagi! 😊'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full mt-2">
        {/* Kolom Kiri: Angka */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-slate-500 text-center">Angka</h4>
          {itemsLeft.map((item) => {
            const isMatched = matches.includes(item.id);
            const isSelected = selectedLeft === item.id;
            const cardFeedback = getCardFeedback(item.id, 'left');
            return (
              <motion.button
                key={`left-${item.id}`}
                onClick={() => handleSelectLeft(item.id)}
                disabled={isMatched || feedback !== null}
                whileHover={!isMatched && !feedback ? { scale: 1.05 } : {}}
                whileTap={!isMatched && !feedback ? { scale: 0.95 } : {}}
                animate={
                  cardFeedback === 'salah'
                    ? { x: [0, -8, 8, -6, 6, 0] }
                    : cardFeedback === 'benar'
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={
                  cardFeedback === 'salah'
                    ? { duration: 0.4 }
                    : cardFeedback === 'benar'
                    ? { duration: 0.3 }
                    : {}
                }
                className={`relative flex items-center justify-center p-5 rounded-2xl border-2 text-2xl font-black transition-colors h-20 ${
                  isMatched
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-500 opacity-60'
                    : cardFeedback === 'benar'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500/30'
                    : cardFeedback === 'salah'
                    ? 'border-red-500 bg-red-50 text-red-600 ring-2 ring-red-500/30'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'border-border bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {isMatched ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <>
                    {item.angka}
                    {/* Ikon feedback overlay */}
                    {cardFeedback === 'benar' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-md"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    {cardFeedback === 'salah' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                      >
                        <X className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </>
                )}
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
            const cardFeedback = getCardFeedback(item.id, 'right');
            return (
              <motion.button
                key={`right-${item.id}`}
                onClick={() => handleSelectRight(item.id)}
                disabled={isMatched || feedback !== null}
                whileHover={!isMatched && !feedback ? { scale: 1.05 } : {}}
                whileTap={!isMatched && !feedback ? { scale: 0.95 } : {}}
                animate={
                  cardFeedback === 'salah'
                    ? { x: [0, -8, 8, -6, 6, 0] }
                    : cardFeedback === 'benar'
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={
                  cardFeedback === 'salah'
                    ? { duration: 0.4 }
                    : cardFeedback === 'benar'
                    ? { duration: 0.3 }
                    : {}
                }
                className={`relative flex items-center justify-center p-3 rounded-2xl border-2 transition-colors h-20 ${
                  isMatched
                    ? 'border-emerald-200 bg-emerald-50 opacity-60'
                    : cardFeedback === 'benar'
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30'
                    : cardFeedback === 'salah'
                    ? 'border-red-500 bg-red-50 ring-2 ring-red-500/30'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-border bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {isMatched ? (
                  <Check className="w-6 h-6 text-emerald-500" />
                ) : (
                  <>
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
                      <div className={`grid ${getGridColsClass(item.satuan)} gap-0.5 justify-items-center`}>
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
                    {/* Ikon feedback overlay */}
                    {cardFeedback === 'benar' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-md"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    {cardFeedback === 'salah' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                      >
                        <X className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </>
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
              {ronde === 1 ? (
                <Button
                  onClick={() => setRonde(2)}
                  className="w-full gap-2 rounded-2xl shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  size="lg"
                >
                  Lanjut
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={onBenar}
                  className="w-full gap-2 rounded-2xl shadow-md"
                  size="lg"
                >
                  Lanjut ke Game Isian
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
