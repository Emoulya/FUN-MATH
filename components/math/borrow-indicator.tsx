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
      className="absolute flex justify-center items-end pointer-events-none"
      style={{
        bottom: 0,
        left: 0,
        width: '100%',
        zIndex: 10
      }}
      aria-label={`Menjadi ${nilaiBaru}`}
    >
      {/* Angka baru */}
      <motion.span
        initial={{ 
          y: isNew ? "2rem" : 0, 
          scale: isNew ? 1.5 : 1, 
          opacity: 0 
        }}
        animate={{ 
          y: 0, 
          scale: 1, 
          opacity: 1 
        }}
        transition={{ 
          duration: isNew ? 0.8 : 0.3,
          ease: isNew ? [0.17, 0.89, 0.32, 1.1] : 'easeOut'
        }}
        className="font-bold flex items-center justify-center"
        style={{ 
          color: 'var(--borrow-color)',
          fontSize: '1.75rem',
          lineHeight: 1
        }}
      >
        {nilaiBaru}
      </motion.span>
    </motion.div>
  );
}
