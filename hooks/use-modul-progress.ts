'use client';

// ============================================
// useModulProgress — Manajemen Progress Modul
// ============================================
// Mengelola state progress modul pembelajaran (lock/unlock/completed).
// Saat ini menggunakan sessionStorage (MVP).
// Migrasi ke Supabase hanya perlu mengubah loadProgress/saveProgress.

import { useState, useCallback, useEffect } from 'react';
import type { ModulId, ModulStatus, ModulProgress } from '@/types/math';
import {
  DEFAULT_MODUL_PROGRESS,
  STORAGE_KEY_MODUL_PROGRESS,
  MODUL_UNLOCK_ORDER,
} from '@/lib/constants';

interface UseModulProgressReturn {
  /** Progress semua modul */
  progress: ModulProgress;
  /** Ambil status satu modul */
  getStatus: (modulId: ModulId) => ModulStatus;
  /** Tandai modul sebagai selesai dan unlock modul berikutnya */
  selesaikanModul: (modulId: ModulId) => void;
  /** Reset semua progress ke default */
  resetProgress: () => void;
  /** Apakah sedang loading dari storage */
  isLoading: boolean;
}

// ============================================
// Storage Abstraction Layer
// ============================================

/** Baca progress dari localStorage per siswa */
function loadProgress(): ModulProgress {
  if (typeof window === 'undefined') return DEFAULT_MODUL_PROGRESS;

  try {
    const siswaId = sessionStorage.getItem('siswaId');
    if (!siswaId) return DEFAULT_MODUL_PROGRESS;
    const stored = localStorage.getItem(`modul_progress_${siswaId}`);
    if (!stored) return DEFAULT_MODUL_PROGRESS;
    return JSON.parse(stored) as ModulProgress;
  } catch {
    return DEFAULT_MODUL_PROGRESS;
  }
}

/** Simpan progress ke localStorage per siswa */
function saveProgress(progress: ModulProgress): void {
  if (typeof window === 'undefined') return;
  const siswaId = sessionStorage.getItem('siswaId');
  if (!siswaId) return;
  localStorage.setItem(`modul_progress_${siswaId}`, JSON.stringify(progress));
}

// ============================================
// Hook
// ============================================

export function useModulProgress(): UseModulProgressReturn {
  const [progress, setProgress] = useState<ModulProgress>(() => loadProgress());
  const [isLoading, setIsLoading] = useState(true);

  // Tandai loading selesai setelah hydration dan sinkronkan progress
  useEffect(() => {
    setProgress(loadProgress());
    const id = requestAnimationFrame(() => setIsLoading(false));
    return () => cancelAnimationFrame(id);
  }, []);

  const getStatus = useCallback(
    (modulId: ModulId): ModulStatus => progress[modulId],
    [progress],
  );

  const selesaikanModul = useCallback((modulId: ModulId) => {
    setProgress((prev) => {
      const updated = { ...prev };

      // Tandai modul ini sebagai completed
      updated[modulId] = 'completed';

      // Cari index modul ini di urutan unlock
      const currentIndex = MODUL_UNLOCK_ORDER.indexOf(modulId);

      // Unlock modul berikutnya jika ada dan masih locked
      if (currentIndex >= 0 && currentIndex < MODUL_UNLOCK_ORDER.length - 1) {
        const nextModulId = MODUL_UNLOCK_ORDER[currentIndex + 1];
        if (updated[nextModulId] === 'locked') {
          updated[nextModulId] = 'unlocked';
        }
      }

      saveProgress(updated);
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_MODUL_PROGRESS);
    saveProgress(DEFAULT_MODUL_PROGRESS);
  }, []);

  return {
    progress,
    getStatus,
    selesaikanModul,
    resetProgress,
    isLoading,
  };
}
