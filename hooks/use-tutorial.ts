'use client';

// ============================================
// useTutorial — Hook Sinkronisasi Progress Tutorial
// ============================================
// Menghubungkan state tutorial dengan database Supabase secara real-time.
// Menyimpan backup di local storage untuk load instan.

import { useState, useEffect, useCallback } from 'react';

interface UseTutorialReturn {
  isTutorial: boolean;
  tutorialStep: string;
  tutorialDone: boolean;
  isLoading: boolean;
  /** Update langkah tutorial aktif */
  setStep: (step: string) => Promise<void>;
  /** Selesaikan tutorial sepenuhnya */
  completeTutorial: () => Promise<void>;
  /** Ulangi tutorial dari awal */
  resetTutorial: () => Promise<void>;
  /** Force refresh progress dari database */
  refresh: () => Promise<void>;
}

export function useTutorial(): UseTutorialReturn {
  const [tutorialStep, setTutorialStepState] = useState('PETA_BELAJAR');
  const [tutorialDone, setTutorialDoneState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [siswaId, setSiswaId] = useState<string | null>(null);

  // Sync siswaId dari sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem('siswaId');
      setSiswaId(id);
    }
  }, []);

  const loadLocalBackup = useCallback((id: string) => {
    const localStep = localStorage.getItem(`tutorial_step_${id}`) || 'PETA_BELAJAR';
    const localDone = localStorage.getItem(`tutorial_done_${id}`) === 'true';
    setTutorialStepState(localStep);
    setTutorialDoneState(localDone);
  }, []);

  const saveLocalBackup = useCallback((id: string, step: string, done: boolean) => {
    localStorage.setItem(`tutorial_step_${id}`, step);
    localStorage.setItem(`tutorial_done_${id}`, done ? 'true' : 'false');
  }, []);

  // Fetch dari database
  const refresh = useCallback(async () => {
    if (!siswaId) return;

    try {
      const res = await fetch(`/api/siswa/${siswaId}`);
      if (!res.ok) throw new Error('Failed to fetch progress');
      const data = await res.json();

      const step = data.tutorial_step ?? 'PETA_BELAJAR';
      const done = data.tutorial_done ?? false;

      setTutorialStepState(step);
      setTutorialDoneState(done);
      saveLocalBackup(siswaId, step, done);
    } catch (err) {
      console.error('Error loading tutorial progress from DB:', err);
      // Fallback ke local backup
      loadLocalBackup(siswaId);
    } finally {
      setIsLoading(false);
    }
  }, [siswaId, loadLocalBackup, saveLocalBackup]);

  // Load awal
  useEffect(() => {
    if (siswaId) {
      // Load local dulu agar instan
      loadLocalBackup(siswaId);
      // Sinkronkan dari DB di background
      refresh();
    } else {
      setIsLoading(false);
    }
  }, [siswaId, loadLocalBackup, refresh]);

  // Update step
  const setStep = useCallback(async (step: string) => {
    if (!siswaId) return;

    // Optimistic UI update
    setTutorialStepState(step);
    localStorage.setItem(`tutorial_step_${siswaId}`, step);

    try {
      await fetch(`/api/siswa/${siswaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorial_step: step }),
      });
    } catch (err) {
      console.error('Failed to save tutorial step to DB:', err);
    }
  }, [siswaId]);

  // Selesaikan tutorial
  const completeTutorial = useCallback(async () => {
    if (!siswaId) return;

    setTutorialDoneState(true);
    localStorage.setItem(`tutorial_done_${siswaId}`, 'true');
    localStorage.removeItem(`tutorial_step_${siswaId}`);

    try {
      await fetch(`/api/siswa/${siswaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorial_done: true }),
      });
    } catch (err) {
      console.error('Failed to complete tutorial on DB:', err);
    }
  }, [siswaId]);

  // Reset tutorial
  const resetTutorial = useCallback(async () => {
    if (!siswaId) return;

    setTutorialStepState('PETA_BELAJAR');
    setTutorialDoneState(false);
    localStorage.setItem(`tutorial_step_${siswaId}`, 'PETA_BELAJAR');
    localStorage.setItem(`tutorial_done_${siswaId}`, 'false');

    try {
      await fetch(`/api/siswa/${siswaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tutorial_step: 'PETA_BELAJAR', 
          tutorial_done: false,
          modul_progress: {
            modul1a: 'unlocked',
            modul1b: 'locked',
            modul2: 'locked',
            modul3: 'locked',
            modul4: 'locked'
          }
        }),
      });
    } catch (err) {
      console.error('Failed to reset tutorial on DB:', err);
    }
  }, [siswaId]);

  return {
    isTutorial: !tutorialDone,
    tutorialStep,
    tutorialDone,
    isLoading,
    setStep,
    completeTutorial,
    resetTutorial,
    refresh,
  };
}
