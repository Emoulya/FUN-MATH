'use client';

// ============================================
// Base10Blocks — Visualisasi Balok Nilai Tempat
// ============================================
// Representasi visual Base-10 (Dienes Blocks):
// - Satuan = kotak solid biru
// - Puluhan = batang vertikal hijau dengan 10 segmen bergaris
// - Ratusan = grid 10×10 ungu dengan garis pembatas
// Dirancang untuk AHD — visual-first, tanpa teks panjang.

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Base10BlocksProps {
  /** Angka yang divisualisasikan (1-999) */
  angka: number;
  /** Tampilkan label "Ratusan", "Puluhan", "Satuan" */
  tampilkanLabel?: boolean;
  /** Animasikan kemunculan balok */
  animasi?: boolean;
  /** Sembunyikan angka besar di atas blok */
  sembunyikanAngka?: boolean;
  /** Ukuran blok */
  ukuran?: 'sm' | 'md' | 'lg';
}

// ============================================
// Dimensi per ukuran
// ============================================

/** Lebar satu unit cell */
const CELL_W: Record<string, number> = { sm: 14, md: 20, lg: 26 };
/** Tinggi satu unit cell */
const CELL_H: Record<string, number> = { sm: 12, md: 18, lg: 22 };
/** Gap antar blok */
const GAP: Record<string, number> = { sm: 3, md: 4, lg: 6 };

// ============================================
// Sub-komponen
// ============================================

/** Satu kotak satuan — kotak solid berwarna */
function SatuanBlock({
  w,
  h,
  delay,
  animasi,
}: {
  w: number;
  h: number;
  delay: number;
  animasi: boolean;
}) {
  const Wrapper = animasi ? motion.div : 'div';
  const animProps = animasi
    ? {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { delay, type: 'spring' as const, stiffness: 320, damping: 22 },
      }
    : {};

  return (
    <Wrapper
      {...animProps}
      className="shrink-0 rounded-[3px]"
      style={{
        width: w,
        height: h,
        /* Background solid + border tipis lebih gelap */
        backgroundColor: 'var(--block-satuan)',
        border: '1.5px solid color-mix(in oklch, var(--block-satuan) 70%, black)',
        opacity: 0.9,
      }}
    />
  );
}

/** Satu batang puluhan — 10 segmen bergaris horizontal jelas */
function PuluhanBlock({
  w,
  h,
  delay,
  animasi,
}: {
  w: number;
  h: number;
  delay: number;
  animasi: boolean;
}) {
  const Wrapper = animasi ? motion.div : 'div';
  const animProps = animasi
    ? {
        initial: { scaleY: 0, opacity: 0 },
        animate: { scaleY: 1, opacity: 1 },
        transition: { delay, type: 'spring' as const, stiffness: 220, damping: 20 },
      }
    : {};

  return (
    <Wrapper
      {...animProps}
      className="shrink-0 flex flex-col overflow-hidden rounded-[4px]"
      style={{
        width: w,
        transformOrigin: 'bottom',
        border: '2px solid color-mix(in oklch, var(--block-puluhan) 60%, black)',
        backgroundColor: 'var(--block-puluhan)',
        gap: 0,
      }}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '100%',
            height: h,
            // Segmen genap sedikit lebih gelap → garis pemisah jelas
            backgroundColor:
              i % 2 === 0
                ? 'color-mix(in oklch, var(--block-puluhan) 100%, transparent)'
                : 'color-mix(in oklch, var(--block-puluhan) 70%, black 30%)',
            borderBottom: i < 9 ? '1px solid color-mix(in oklch, var(--block-puluhan) 40%, black 60%)' : 'none',
          }}
        />
      ))}
    </Wrapper>
  );
}

/** Grid ratusan 10×10 — setiap sel solid dengan garis pembatas */
function RatusanBlock({
  w,
  h,
  delay,
  animasi,
}: {
  w: number;
  h: number;
  delay: number;
  animasi: boolean;
}) {
  const Wrapper = animasi ? motion.div : 'div';
  const animProps = animasi
    ? {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { delay, type: 'spring' as const, stiffness: 160, damping: 16 },
      }
    : {};

  return (
    <Wrapper
      {...animProps}
      className="shrink-0 rounded-[4px] overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(10, ${w}px)`,
        gridTemplateRows: `repeat(10, ${h}px)`,
        border: '2px solid color-mix(in oklch, var(--block-ratusan) 60%, black)',
        gap: 0,
      }}
    >
      {Array.from({ length: 100 }).map((_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        return (
          <div
            key={i}
            style={{
              width: w,
              height: h,
              backgroundColor: 'var(--block-ratusan)',
              opacity: (row + col) % 2 === 0 ? 0.8 : 0.55,
              borderRight: col < 9 ? '0.5px solid color-mix(in oklch, var(--block-ratusan) 40%, black)' : 'none',
              borderBottom: row < 9 ? '0.5px solid color-mix(in oklch, var(--block-ratusan) 40%, black)' : 'none',
            }}
          />
        );
      })}
    </Wrapper>
  );
}

// ============================================
// Komponen Utama
// ============================================

export default function Base10Blocks({
  angka,
  tampilkanLabel = false,
  animasi = true,
  sembunyikanAngka = false,
  ukuran = 'md',
}: Base10BlocksProps) {
  const w = CELL_W[ukuran];
  const h = CELL_H[ukuran];
  const gap = GAP[ukuran];

  const { ratusan, puluhan, satuan } = useMemo(() => {
    const clamped = Math.max(0, Math.min(999, Math.floor(angka)));
    return {
      ratusan: Math.floor(clamped / 100),
      puluhan: Math.floor((clamped % 100) / 10),
      satuan: clamped % 10,
    };
  }, [angka]);

  const baseDelay = animasi ? 0.1 : 0;

  return (
    <div className="flex flex-col items-center" style={{ gap: gap * 3 }}>
      {/* Angka display */}
      {!sembunyikanAngka && (
        <div className="text-center">
          <span className="text-3xl font-black tabular-nums">{angka}</span>
        </div>
      )}

      {/* Blok visual — Layout 2 Kolom: Puluhan (kiri) | Satuan (kanan) */}
      <div className="flex items-start justify-center" style={{ gap: gap * 6 }}>

        {/* ── Ratusan (jika ada) ── */}
        {ratusan > 0 && (
          <div className="flex flex-col items-center" style={{ gap }}>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--block-ratusan)' }}
            >
              Ratusan
            </span>
            <div className="flex flex-wrap justify-center" style={{ gap }}>
              {Array.from({ length: ratusan }).map((_, i) => (
                <RatusanBlock
                  key={`r-${i}`}
                  w={w}
                  h={h}
                  delay={baseDelay + i * 0.15}
                  animasi={animasi}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Kolom Puluhan (kiri) ── */}
        <div className="flex flex-col items-center" style={{ gap }}>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--block-puluhan)' }}
          >
            Puluhan
          </span>
          <div className="flex items-end justify-center" style={{ gap }}>
            {puluhan > 0 ? (
              Array.from({ length: puluhan }).map((_, i) => (
                <PuluhanBlock
                  key={`p-${i}`}
                  w={w}
                  h={h}
                  delay={baseDelay + ratusan * 0.15 + i * 0.1}
                  animasi={animasi}
                />
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">—</span>
            )}
          </div>
        </div>

        {/* ── Kolom Satuan (kanan) ── */}
        <div className="flex flex-col items-center" style={{ gap }}>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--block-satuan)' }}
          >
            Satuan
          </span>
          <div
            className="grid justify-items-center"
            style={{
              gridTemplateColumns: `repeat(${satuan <= 1 ? 1 : satuan === 2 ? 2 : Math.ceil(satuan / 2)}, ${w}px)`,
              gap,
            }}
          >
            {satuan > 0 ? (
              Array.from({ length: satuan }).map((_, i) => (
                <SatuanBlock
                  key={`s-${i}`}
                  w={w}
                  h={h}
                  delay={baseDelay + ratusan * 0.15 + puluhan * 0.1 + i * 0.08}
                  animasi={animasi}
                />
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">—</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
