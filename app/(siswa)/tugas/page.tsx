'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle2, ArrowLeft, Calendar, Play } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { TugasDB } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { OPERASI_LABEL } from '@/lib/constants';
import type { Operasi } from '@/types/math';

export default function TugasPage() {
  const router = useRouter();
  const [tugasList, setTugasList] = useState<TugasDB[]>([]);
  const [sesiList, setSesiList] = useState<{ tugas_id: string | null; skor: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOperasi, setSelectedOperasi] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchData = async () => {
    const siswaId = sessionStorage.getItem('siswaId');
    if (!siswaId) {
      router.replace('/');
      return;
    }

    try {
      const nowStr = new Date().toISOString();

      // 1. Ambil seluruh tugas aktif untuk siswa ini
      const { data: tugasData } = await supabase
        .from('tugas')
        .select('*')
        .contains('siswa_ids', [siswaId])
        .lte('mulai_pada', nowStr)
        .order('dibuat_pada', { ascending: false });

      if (tugasData) {
        setTugasList(tugasData);
      }

      // 2. Ambil sesi latihan tipe 'tugas' milik siswa ini
      const { data: sesiData } = await supabase
        .from('sesi_latihan')
        .select('tugas_id, skor')
        .eq('siswa_id', siswaId)
        .eq('tipe', 'tugas');

      if (sesiData) {
        setSesiList(sesiData);
      }
    } catch (err) {
      console.error('Error fetching tugas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const completedTugasMap = new Map<string, number>(
    sesiList.filter(s => s.tugas_id !== null).map(s => [s.tugas_id as string, s.skor])
  );

  // Hitung jumlah tugas yang belum diselesaikan per operasi
  const getPendingCount = (operasiId: string) => {
    const now = new Date();
    return tugasList.filter(t => 
      t.operasi === operasiId && 
      !completedTugasMap.has(t.id) &&
      now <= new Date(t.tenggat_pada)
    ).length;
  };

  const operasiList = [
    { id: 'penjumlahan', title: 'Penjumlahan', icon: '➕', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200 hover:border-blue-400' },
    { id: 'pengurangan', title: 'Pengurangan', icon: '➖', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200 hover:border-emerald-400' },
  ];

  // Filter tugas untuk operasi terpilih
  const filteredTugas = tugasList.filter(t => t.operasi === selectedOperasi);

  const formatDateLabel = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        
        <AnimatePresence mode="wait">
          {!selectedOperasi ? (
            // Tampilan Utama: Pilih Operasi
            <motion.div
              key="pilih-operasi"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl w-9 h-9 shrink-0"
                  onClick={() => router.push('/pilih-operasi')}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Daftar Tugas</h1>
                  <p className="text-muted-foreground text-sm">Pilih kategori matematika untuk melihat tugas dari guru.</p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {operasiList.map((op, i) => {
                    const count = getPendingCount(op.id);
                    const totalTugasOp = tugasList.filter(t => t.operasi === op.id).length;
                    const isKosong = totalTugasOp === 0;

                    return (
                      <motion.button
                        key={op.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={!isKosong ? { scale: 1.02 } : {}}
                        whileTap={!isKosong ? { scale: 0.98 } : {}}
                        onClick={() => !isKosong && setSelectedOperasi(op.id)}
                        disabled={isKosong}
                        className={`relative flex items-center p-4 bg-card border-2 rounded-2xl shadow-sm transition-all text-left ${
                          isKosong 
                            ? 'border-border opacity-50 cursor-not-allowed' 
                            : op.border + ' cursor-pointer'
                        }`}
                      >
                        <div className={`w-12 h-12 ${op.bg} rounded-xl flex items-center justify-center text-xl mr-4 shrink-0`}>
                          {op.icon}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{op.title}</h3>
                          {isKosong ? (
                            <p className="text-sm text-muted-foreground font-medium">
                              Belum ada tugas
                            </p>
                          ) : count === 0 ? (
                            <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Semua tugas selesai
                            </p>
                          ) : (
                            <p className="text-sm text-amber-600 font-medium">
                              Ada {count} tugas baru
                            </p>
                          )}
                        </div>

                        {!isKosong && (
                          <div className="ml-4 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg shrink-0">
                            Lihat ({totalTugasOp})
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            // Tampilan Sub-list: Daftar Tugas
            <motion.div
              key="daftar-tugas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl w-9 h-9"
                  onClick={() => setSelectedOperasi(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-extrabold capitalize">Tugas {selectedOperasi}</h1>
                  <p className="text-muted-foreground text-xs">Kerjakan tugas tepat waktu ya!</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {filteredTugas.length === 0 ? (
                  <p className="text-center py-8 text-sm text-muted-foreground">
                    Belum ada tugas untuk operasi ini.
                  </p>
                ) : (
                  filteredTugas.map((tugas, i) => {
                    const isSelesai = completedTugasMap.has(tugas.id);
                    const skor = completedTugasMap.get(tugas.id);
                    const now = new Date();
                    const isExpired = now > new Date(tugas.tenggat_pada);

                    return (
                      <motion.div
                        key={tugas.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex flex-col p-4 bg-card border border-border rounded-2xl shadow-xs gap-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-base text-foreground leading-tight">
                              {tugas.nama_tugas}
                            </h3>
                            <span className="text-xs font-semibold text-muted-foreground">
                              {tugas.soal_ids.length} Soal • {OPERASI_LABEL[tugas.operasi as Operasi] || tugas.operasi}
                            </span>
                          </div>
                          
                          {isSelesai ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20">
                              Selesai ({skor}%)
                            </span>
                          ) : isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/20">
                              Kedaluwarsa
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/20 animate-pulse">
                              Baru
                            </span>
                          )}
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground gap-1.5 border-t border-muted/60 pt-2.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Tenggat: {formatDateLabel(tugas.tenggat_pada)}</span>
                        </div>

                        {!isSelesai && !isExpired && (
                          <Button 
                            className="w-full gap-2 font-bold mt-1 text-sm h-10 rounded-xl"
                            onClick={() => router.push(`/tugas/kerjakan?tugasId=${tugas.id}&op=${tugas.operasi}`)}
                          >
                            <Play className="w-4 h-4 fill-current" /> Mulai Kerjakan
                          </Button>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
