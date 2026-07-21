'use client';

import { motion } from 'framer-motion';
import type { LangkahHitung, Operasi } from '@/types/math';

interface SideOperationPanelProps {
  boardId?: string;
  langkah: LangkahHitung | null;
  operasi: Operasi;
  visible: boolean;
  mode?: 'animasi' | 'latihan';
}

export default function SideOperationPanel({ boardId = '', langkah, operasi, visible, mode = 'animasi' }: SideOperationPanelProps) {
  if (!visible || !langkah || langkah.kolom === -1) {
    return (
      <div className="w-32 aspect-square self-end flex items-center justify-center border border-dashed border-border/50 rounded-2xl bg-card/30 text-muted-foreground text-sm p-4 text-center">
        Proses detail...
      </div>
    );
  }

  const { nilaiDigit1, nilaiDigit2, hasil, carry, borrow, nilaiSetelahBorrow } = langkah;
  const simbol = operasi === 'penjumlahan' ? '+' : operasi === 'pengurangan' ? '−' : '×';

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      key={`side-op-${langkah.kolom}-${langkah.penjelasan}`}
      className="w-32 aspect-square self-end p-4 bg-card rounded-2xl shadow-sm border border-border flex flex-col justify-center gap-2 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-full -z-10" />


      {/* Operasi Penjumlahan */}
      {operasi === 'penjumlahan' && (
        <div className="flex flex-col items-center gap-1 text-lg font-semibold">
          {carry !== undefined && carry > 0 && (
            <div className="text-sm text-carry-color flex items-center gap-2">
              <span>Simpanan:</span>
              <span className="bg-carry-color/10 px-2 rounded">{carry}</span>
              <span className="text-muted-foreground">+</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span id={`side-d1-${boardId}-${langkah.kolom}`}>{nilaiDigit1}</span>
            <span className="text-primary">{simbol}</span>
            <span id={`side-d2-${boardId}-${langkah.kolom}`}>{nilaiDigit2}</span>
          </div>
          <div className="w-16 h-px bg-border my-1" />
          <div className="text-2xl font-bold text-primary flex gap-2">
            <span>=</span>
            {mode === 'latihan' ? (
              <span id={`side-hasil-${boardId}-${langkah.kolom}`} className="text-muted-foreground">?</span>
            ) : (
              <span className="flex">
                {hasil >= 10 || langkah.carryBaru ? (
                  <>
                    <span id={`side-hasil-carry-${boardId}-${langkah.kolom}`}>{langkah.carryBaru || Math.floor(hasil / 10)}</span>
                    <span id={`side-hasil-${boardId}-${langkah.kolom}`}>{langkah.carryBaru ? hasil : hasil % 10}</span>
                  </>
                ) : (
                  <span id={`side-hasil-${boardId}-${langkah.kolom}`}>{hasil}</span>
                )}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Operasi Pengurangan */}
      {operasi === 'pengurangan' && (
        <div className="flex flex-col items-center gap-1 text-lg font-semibold">
          {borrow ? (
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs text-borrow-color bg-borrow-color/10 px-2 py-0.5 rounded flex items-center gap-1">
                <span>Pinjam +10</span>
              </div>
              <div className="flex items-center gap-2">
                <span id={`side-d1-${boardId}-${langkah.kolom}`} className="text-borrow-color relative">
                   {nilaiSetelahBorrow}
                </span>
                <span className="text-primary">{simbol}</span>
                <span id={`side-d2-${boardId}-${langkah.kolom}`}>{nilaiDigit2}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span id={`side-d1-${boardId}-${langkah.kolom}`}>{nilaiDigit1}</span>
              <span className="text-primary">{simbol}</span>
              <span id={`side-d2-${boardId}-${langkah.kolom}`}>{nilaiDigit2}</span>
            </div>
          )}
          
          <div className="w-16 h-px bg-border my-1" />
          <div className="text-2xl font-bold text-primary flex gap-2">
            <span>=</span>
            {mode === 'latihan' ? (
              <span id={`side-hasil-${boardId}-${langkah.kolom}`} className="text-muted-foreground">?</span>
            ) : (
              <span id={`side-hasil-${boardId}-${langkah.kolom}`}>{hasil}</span>
            )}
          </div>
        </div>
      )}

      {/* Operasi Perkalian */}
      {operasi === 'perkalian' && (
        <div className="flex flex-col items-center gap-1 text-lg font-semibold">
          {carry !== undefined && carry > 0 && (
            <div className="text-sm text-carry-color flex items-center gap-2">
               <span>Simpanan:</span>
               <span className="bg-carry-color/10 px-2 rounded">+{carry}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span id={`side-d1-${boardId}-${langkah.kolom}`}>{nilaiDigit1}</span>
            <span className="text-primary">{simbol}</span>
            <span id={`side-d2-${boardId}-${langkah.kolom}`}>{nilaiDigit2}</span>
          </div>
          <div className="w-16 h-px bg-border my-1" />
          <div className="text-2xl font-bold text-primary flex gap-2">
            <span>=</span>
            {mode === 'latihan' ? (
              <span id={`side-hasil-${boardId}-${langkah.kolom}`} className="text-muted-foreground">?</span>
            ) : (
              <span className="flex">
                {langkah.carryBaru ? (
                  <>
                    <span id={`side-hasil-carry-${boardId}-${langkah.kolom}`}>{langkah.carryBaru}</span>
                    <span id={`side-hasil-${boardId}-${langkah.kolom}`}>{hasil}</span>
                  </>
                ) : (
                  <span id={`side-hasil-${boardId}-${langkah.kolom}`}>{nilaiDigit1 * nilaiDigit2 + (carry ?? 0)}</span>
                )}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
