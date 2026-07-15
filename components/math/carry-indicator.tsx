'use client';

// ============================================
// CarryIndicator — Visualisasi Angka Simpanan
// ============================================
// Tampil sebagai angka kecil (superscript) di sudut kiri atas kolom berikutnya.
// Warna amber/oranye agar kontras. Animasi slide-in dari bawah.

import { motion } from 'framer-motion';

interface CarryIndicatorProps {
  /** Nilai carry (biasanya 1) */
  nilai: number;
  /** Apakah indicator visible */
  visible?: boolean;
  /** Apakah carry ini aktif/baru pada langkah saat ini */
  isNew?: boolean;
  /** Apakah carry ini sedang di-highlight (fokus langkah aktif) */
  highlight?: boolean;
}

export default function CarryIndicator({ nilai, visible = true, isNew = true, highlight = false }: CarryIndicatorProps) {
  if (!visible || nilai === 0) return null;

  return (
    <motion.span
      initial={{ 
        x: isNew ? "3.7rem" : 0, 
        y: isNew ? "7.5rem" : 8, 
        scale: isNew ? 2.3 : 1, 
        opacity: isNew ? 1 : 0 
      }}
      animate={{ 
        x: 0,
        y: 0, 
        scale: 1,
        opacity: 1,
        backgroundColor: highlight ? 'hsla(249, 47%, 90%, 1)' : 'transparent',
      }}
      exit={{ y: -8, opacity: 0 }}
      transition={{ 
        duration: isNew ? 0.8 : 0.3, 
        ease: isNew ? [0.17, 0.89, 0.32, 1.1] : 'easeOut' // Bouncy effect when flying up diagonal
      }}
      className={`relative flex items-center justify-center animate-slide-in-up transition-colors duration-300 rounded px-1 ${highlight ? 'font-bold' : ''}`}
      style={{
        color: 'var(--carry-color)',
        fontSize: '1.75rem', // Same size as math-digit
        lineHeight: 1,
        zIndex: 10
      }}
      aria-label={`Simpanan ${nilai}`}
    >
      {nilai}
    </motion.span>
  );
}

