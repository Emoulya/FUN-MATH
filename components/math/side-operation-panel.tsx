'use client';

import { motion } from 'framer-motion';
import type { LangkahHitung, Operasi } from '@/types/math';
import { getDigits } from '@/lib/math-engine';

interface SideOperationPanelProps {
  langkah: LangkahHitung | null;
  operasi: Operasi;
  visible: boolean;
  mode?: 'animasi' | 'latihan';
  angka1?: number;
  angka2?: number;
}

export default function SideOperationPanel({ langkah, operasi, visible, mode = 'animasi', angka1, angka2 }: SideOperationPanelProps) {
  if (!visible || !langkah || langkah.kolom === -1) {
    return (
      <div className="w-32 aspect-square self-end flex items-center justify-center border border-dashed border-border/50 rounded-2xl bg-card/30 text-muted-foreground text-sm p-4 text-center">
        Proses detail...
      </div>
    );
  }

  const { nilaiDigit1, nilaiDigit2, hasil, carry, borrow, nilaiSetelahBorrow } = langkah;
  const simbol = operasi === 'penjumlahan' ? '+' : operasi === 'pengurangan' ? '−' : '×';

  const isDigit1Empty = angka1 !== undefined && langkah.kolom >= getDigits(angka1).length;
  const isDigit2Empty = angka2 !== undefined && langkah.kolom >= getDigits(angka2).length;

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
            {!isDigit1Empty && <span>{nilaiDigit1}</span>}
            {!isDigit1Empty && !isDigit2Empty && <span className="text-primary">{simbol}</span>}
            {!isDigit2Empty && <span>{nilaiDigit2}</span>}
            {isDigit1Empty && isDigit2Empty && <span>0</span>}
          </div>
          <div className="w-16 h-px bg-border my-1" />
          <div className="text-2xl font-bold text-primary flex gap-2">
            <span>=</span>
            {mode === 'latihan' ? (
              <span className="text-muted-foreground">?</span>
            ) : (
              <span>{hasil + (langkah.carryBaru ? langkah.carryBaru * 10 : 0)}</span>
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
                <span className="text-borrow-color relative">
                   {nilaiSetelahBorrow}
                </span>
                {!isDigit2Empty && <span className="text-primary">{simbol}</span>}
                {!isDigit2Empty && <span>{nilaiDigit2}</span>}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isDigit1Empty && <span>{nilaiDigit1}</span>}
              {!isDigit1Empty && !isDigit2Empty && <span className="text-primary">{simbol}</span>}
              {!isDigit2Empty && <span>{nilaiDigit2}</span>}
              {isDigit1Empty && isDigit2Empty && <span>0</span>}
            </div>
          )}
          
          <div className="w-16 h-px bg-border my-1" />
          <div className="text-2xl font-bold text-primary flex gap-2">
            <span>=</span>
            {mode === 'latihan' ? (
              <span className="text-muted-foreground">?</span>
            ) : (
              <span>{hasil}</span>
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
            <span>{nilaiDigit1}</span>
            <span className="text-primary">{simbol}</span>
            <span>{nilaiDigit2}</span>
          </div>
          <div className="w-16 h-px bg-border my-1" />
          <div className="text-2xl font-bold text-primary flex gap-2">
            <span>=</span>
            {mode === 'latihan' ? (
              <span className="text-muted-foreground">?</span>
            ) : (
              <span>{nilaiDigit1 * nilaiDigit2 + (carry ?? 0)}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
