'use client';

// ============================================
// ModulCard — Kartu Modul di Peta Pembelajaran
// ============================================
// Visual berbeda per status: locked (abu-abu), unlocked (warna cerah),
// completed (hijau + centang). Animasi dan feedback visual untuk AHD.

import { motion } from 'framer-motion';
import {
  Lock,
  CheckCircle2,
  Blocks,
  Calculator,
  Plus,
  Minus,
  Shuffle,
} from 'lucide-react';
import type { ModulInfo, ModulStatus } from '@/types/math';

interface ModulCardProps {
  /** Metadata modul */
  modul: ModulInfo;
  /** Status akses modul */
  status: ModulStatus;
  /** Nomor urut untuk animasi delay */
  index: number;
  /** Handler klik */
  onClick: () => void;
}

/** Map nama ikon string ke komponen Lucide */
const IKON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Blocks,
  Calculator,
  Plus,
  Minus,
  Shuffle,
};

/** Warna per modul berdasarkan field `warna` */
const WARNA_MAP: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  blue: {
    border: 'border-blue-300 dark:border-blue-700',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
  },
  teal: {
    border: 'border-teal-300 dark:border-teal-700',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-300',
    iconBg: 'bg-teal-100 dark:bg-teal-900/50',
  },
  indigo: {
    border: 'border-indigo-300 dark:border-indigo-700',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
  },
  emerald: {
    border: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  violet: {
    border: 'border-violet-300 dark:border-violet-700',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-700 dark:text-violet-300',
    iconBg: 'bg-violet-100 dark:bg-violet-900/50',
  },
};

export default function ModulCard({ modul, status, index, onClick }: ModulCardProps) {
  const Icon = IKON_MAP[modul.ikon] ?? Blocks;
  const warna = WARNA_MAP[modul.warna] ?? WARNA_MAP.blue;
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={!isLocked ? { scale: 1.02, y: -2 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      onClick={() => !isLocked && onClick()}
      disabled={isLocked}
      className={`
        relative w-full flex items-center gap-4 p-5 rounded-2xl border-2
        transition-all cursor-pointer text-left
        ${isLocked
          ? 'opacity-50 cursor-not-allowed border-border bg-muted/50'
          : isCompleted
            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 hover:shadow-md'
            : `${warna.border} ${warna.bg} hover:shadow-lg`
        }
      `}
      id={`modul-card-${modul.id}`}
    >
      {/* Ikon */}
      <div
        className={`
          w-14 h-14 rounded-xl flex items-center justify-center shrink-0
          ${isLocked
            ? 'bg-muted'
            : isCompleted
              ? 'bg-emerald-100 dark:bg-emerald-900/50'
              : warna.iconBg
          }
        `}
      >
        {isLocked ? (
          <Lock className="w-6 h-6 text-muted-foreground" />
        ) : isCompleted ? (
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        ) : (
          <Icon className={`w-7 h-7 ${warna.text}`} />
        )}
      </div>

      {/* Teks */}
      <div className="flex-1 min-w-0">
        <h3
          className={`font-bold text-base truncate ${
            isLocked
              ? 'text-muted-foreground'
              : isCompleted
                ? 'text-emerald-700 dark:text-emerald-300'
                : warna.text
          }`}
        >
          {modul.judul}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {modul.deskripsi}
        </p>
      </div>

      {/* Status badge */}
      <div className="shrink-0">
        {isLocked && (
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            Terkunci
          </span>
        )}
        {isCompleted && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-full"
          >
            Selesai ✓
          </motion.span>
        )}
        {status === 'unlocked' && (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`text-xs font-bold ${warna.text} px-2.5 py-1 rounded-full ${warna.iconBg}`}
          >
            Mulai →
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
