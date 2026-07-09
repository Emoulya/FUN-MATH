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
        x: isNew ? "3.125rem" : 0, 
        y: isNew ? "11rem" : 8, 
        scale: isNew ? 1.5 : 1, 
        opacity: 0 
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
      className={`carry-indicator animate-slide-in-up transition-colors duration-300 rounded px-1 ${highlight ? 'font-bold' : ''}`}
      style={{
        color: isNew || highlight ? 'var(--carry-color)' : 'var(--muted-foreground)',
      }}
      aria-label={`Simpanan ${nilai}`}
    >
      {nilai}
    </motion.span>
  );
}

