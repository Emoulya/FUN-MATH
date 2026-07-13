'use client';

// ============================================
// BorrowIndicator — Visualisasi Pinjaman
// ============================================
// Menampilkan coretan pada digit asli + digit baru setelah dipinjam.
// Angka asli dicoret, angka baru muncul di atas.

import { motion } from 'framer-motion';

interface BorrowIndicatorProps {
  /** Angka asli sebelum dipinjam */
  nilaiAsli: number;
  /** Angka setelah dipinjam (biasanya nilaiAsli - 1) */
  nilaiBaru: number;
  /** Apakah hanya menampilkan nilai baru (karena nilai asli sudah dicoret di kotak utama) */
  onlyNewValue?: boolean;
  /** Apakah indicator visible */
  visible?: boolean;
  /** Apakah borrow ini baru aktif/baru pada langkah saat ini */
  isNew?: boolean;
}

export default function BorrowIndicator({
  nilaiAsli,
  nilaiBaru,
  onlyNewValue = false,
  visible = true,
  isNew = false,
}: BorrowIndicatorProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="borrow-indicator flex flex-col items-center leading-none"
      aria-label={`Dipinjam: ${nilaiAsli} menjadi ${nilaiBaru}`}
    >
      {/* Angka asli dicoret */}
      {!onlyNewValue && (
        <span className="borrow-strikethrough text-xs">{nilaiAsli}</span>
      )}
      {/* Angka baru */}
      <motion.span
        initial={{ 
          x: isNew ? "-3.125rem" : 0, 
          scale: isNew ? 1.5 : 1, 
          opacity: 0 
        }}
        animate={{ 
          x: 0, 
          scale: 1, 
          opacity: 1 
        }}
        transition={{ 
          duration: isNew ? 0.8 : 0.3,
          ease: isNew ? [0.17, 0.89, 0.32, 1.1] : 'easeOut'
        }}
        className="text-xs font-bold flex items-center gap-0.5"
        style={{ color: 'var(--borrow-color)' }}
      >
        <span className="text-[0.6rem] opacity-70">→</span>
        {nilaiBaru}
      </motion.span>
    </motion.div>
  );
}
