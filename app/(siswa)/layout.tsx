"use client";

// ============================================
// Layout Siswa — Shared layout untuk alur siswa
// ============================================
// Header sederhana (nama siswa + avatar kecil)
// Session guard: redirect ke / jika session kosong
// Tombol kembali (navigasi mundur)

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, User, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [nama, setNama] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [tugasCount, setTugasCount] = useState(0);

  const supabase = createClient();

  // Session guard — redirect jika session kosong (misal setelah refresh)
  useEffect(() => {
    const siswaId = sessionStorage.getItem("siswaId");
    if (!siswaId) {
      router.replace("/");
      return;
    }
    setNama(sessionStorage.getItem("siswaNama") ?? "Siswa");
    setAvatar(sessionStorage.getItem("siswaAvatar") ?? "");
    setIsReady(true);

    // Cek jumlah tugas yang belum dikerjakan
    const fetchTugas = async () => {
      try {
        const nowStr = new Date().toISOString();
        // 1. Ambil tugas aktif untuk siswa ini
        const { data: tugasList } = await supabase
          .from('tugas')
          .select('id')
          .contains('siswa_ids', [siswaId])
          .lte('mulai_pada', nowStr)
          .gte('tenggat_pada', nowStr);

        if (!tugasList || tugasList.length === 0) {
          setTugasCount(0);
          return;
        }

        // 2. Ambil sesi latihan tipe 'tugas' milik siswa ini
        const { data: sesiList } = await supabase
          .from('sesi_latihan')
          .select('tugas_id')
          .eq('siswa_id', siswaId)
          .eq('tipe', 'tugas');

        const completedTugasIds = new Set(
          (sesiList as any[] || [])
            .map((s) => s.tugas_id)
            .filter(Boolean)
        );

        // 3. Hitung tugas yang belum selesai
        const pendingTugas = (tugasList as any[] || []).filter((t) => !completedTugasIds.has(t.id));
        setTugasCount(pendingTugas.length);
      } catch (err) {
        console.error("Gagal mengambil data tugas:", err);
      }
    };

    fetchTugas();
  }, [router, pathname]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/");
  };

  // Jangan render content sebelum session di-cek
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 flex items-center px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border">

        {/* Kiri: kosong */}
        <div className="flex-1" />

        {/* Tengah: logo kecil */}
        <div className="flex-1 flex justify-center">
          <span className="text-lg font-extrabold bg-linear-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            FUN-MATH
          </span>
        </div>

        {/* Kanan: profil & notif */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {/* Lonceng Notifikasi */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/tugas')}
            className="relative rounded-full w-9 h-9 mr-2"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {tugasCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card"
              />
            )}
          </Button>
          {avatar ? (
            <Image
              src={avatar}
              alt={nama}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          )}
          <span className="text-sm font-bold hidden sm:block">{nama}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Keluar"
            className="rounded-full w-8 h-8">
            <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </motion.header>

      {/* Content */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
