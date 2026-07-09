'use client';

// ============================================
// useModulProgress — Manajemen Progress Modul
// ============================================
// Mengelola state progress modul pembelajaran (lock/unlock/completed).
// Sinkronisasi data ke database Supabase secara real-time.

import { useState, useCallback, useEffect } from 'react';
import type { ModulId, ModulStatus, ModulProgress } from '@/types/math';
import {
  DEFAULT_MODUL_PROGRESS,
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

export function useModulProgress(): UseModulProgressReturn {
  const [progress, setProgress] = useState<ModulProgress>(DEFAULT_MODUL_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress dari DB / localStorage
  const loadProgress = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const siswaId = sessionStorage.getItem('siswaId');
    if (!siswaId) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/siswa/${siswaId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.modul_progress) {
          setProgress(data.modul_progress);
          localStorage.setItem(`modul_progress_${siswaId}`, JSON.stringify(data.modul_progress));
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error loading modul progress from DB:', err);
    }

    // Fallback ke localStorage jika fetch gagal
    try {
      const stored = localStorage.getItem(`modul_progress_${siswaId}`);
      if (stored) {
        setProgress(JSON.parse(stored) as ModulProgress);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Simpan progress ke DB & localStorage
  const saveProgress = useCallback(async (updated: ModulProgress) => {
    if (typeof window === 'undefined') return;
    const siswaId = sessionStorage.getItem('siswaId');
    if (!siswaId) return;

    localStorage.setItem(`modul_progress_${siswaId}`, JSON.stringify(updated));

    try {
      await fetch(`/api/siswa/${siswaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modul_progress: updated }),
      });
    } catch (err) {
      console.error('Error saving modul progress to DB:', err);
    }
  }, []);

  const getStatus = useCallback(
    (modulId: ModulId): ModulStatus => progress[modulId] ?? 'locked',
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
  }, [saveProgress]);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_MODUL_PROGRESS);
    saveProgress(DEFAULT_MODUL_PROGRESS);
  }, [saveProgress]);

  return {
    progress,
    getStatus,
    selesaikanModul,
    resetProgress,
    isLoading,
  };
}
