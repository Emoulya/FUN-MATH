'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, CheckCircle2, XCircle, Eye, Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { OPERASI_LABEL, OPERASI_SIMBOL } from '@/lib/constants';
import type { Operasi } from '@/types/math';
import type { TugasDB, Siswa, SesiLatihan, DetailJawaban } from '@/lib/supabase/types';

interface StudentStatus {
  siswa: Siswa;
  sesi: SesiLatihan | null;
  status: 'selesai' | 'belum' | 'kedaluwarsa';
}

export default function DetailTugasPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: tugasId } = use(params);

  const [tugas, setTugas] = useState<TugasDB | null>(null);
  const [studentStatuses, setStudentStatuses] = useState<StudentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State untuk rekap detail siswa
  const [selectedStudentSesi, setSelectedStudentSesi] = useState<{ studentName: string; sesiId: string | null; status: 'selesai' | 'belum' | 'kedaluwarsa' } | null>(null);
  const [detailJawabanList, setDetailJawabanList] = useState<DetailJawaban[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const supabase = createClient();

  const fetchDetailTugas = useCallback(async () => {
    setLoading(true);
    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const client = supabase as any;

      // 1. Fetch tugas
      const { data: tugasData, error: tugasError } = await client
        .from('tugas')
        .select('*')
        .eq('id', tugasId)
        .single();

      if (tugasError || !tugasData) {
        throw new Error('Tugas tidak ditemukan');
      }

      setTugas(tugasData);

      // 2. Fetch all siswa
      const { data: siswaData, error: siswaError } = await client
        .from('siswa')
        .select('*')
        .in('id', tugasData.siswa_ids);

      if (siswaError) throw siswaError;

      // 3. Fetch all completed sesi_latihan for this tugas
      const { data: sesiData, error: sesiError } = await client
        .from('sesi_latihan')
        .select('*')
        .eq('tugas_id', tugasId);

      if (sesiError) throw sesiError;

      // 4. Combine status
      const now = new Date();
      const deadline = new Date(tugasData.tenggat_pada);
      const isPastDeadline = now > deadline;

      const combined: StudentStatus[] = (siswaData as Siswa[]).map((s) => {
        const sesiSiswa = (sesiData as SesiLatihan[] || []).find((se) => se.siswa_id === s.id);
        
        let status: 'selesai' | 'belum' | 'kedaluwarsa' = 'belum';
        if (sesiSiswa) {
          status = 'selesai';
        } else if (isPastDeadline) {
          status = 'kedaluwarsa';
        }

        return {
          siswa: s,
          sesi: sesiSiswa || null,
          status,
        };
      });

      setStudentStatuses(combined);
      /* eslint-enable @typescript-eslint/no-explicit-any */
    } catch (err) {
      console.error('Error fetching detail tugas:', err);
    } finally {
      setLoading(false);
    }
  }, [tugasId, supabase]);

  const fetchDetailJawaban = useCallback(async (sesiId: string) => {
    setLoadingDetail(true);
    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const client = supabase as any;
      const { data, error } = await client
        .from('detail_jawaban')
        .select('*')
        .eq('sesi_id', sesiId);
      
      if (!error && data) {
        setDetailJawabanList(data);
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
    } catch (err) {
      console.error('Error fetching detail jawaban:', err);
    } finally {
      setLoadingDetail(false);
    }
  }, [supabase]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      fetchDetailTugas();
    });
    return () => cancelAnimationFrame(id);
  }, [fetchDetailTugas]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (selectedStudentSesi && selectedStudentSesi.sesiId) {
        fetchDetailJawaban(selectedStudentSesi.sesiId);
      } else {
        setDetailJawabanList([]);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [selectedStudentSesi, fetchDetailJawaban]);

  const formatDateLabel = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusIcon = (status: 'benar' | 'salah' | 'diungkap') => {
    switch (status) {
      case 'benar':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'salah':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'diungkap':
        return <Eye className="w-5 h-5 text-violet-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tugas) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-red-500">Tugas tidak ditemukan</h2>
        <Button onClick={() => router.push('/kelola-tugas')} className="mt-4">
          Kembali ke Daftar Tugas
        </Button>
      </div>
    );
  }

  // Ringkasan pengerjaan
  const totalSiswa = studentStatuses.length;
  const sudahSelesai = studentStatuses.filter((s) => s.status === 'selesai').length;
  const belumMengerjakan = studentStatuses.filter((s) => s.status === 'belum').length;
  const kedaluwarsa = studentStatuses.filter((s) => s.status === 'kedaluwarsa').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.push('/kelola-tugas')} className="rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{tugas.nama_tugas}</h1>
          <p className="text-muted-foreground text-sm capitalize">
            Operasi: {OPERASI_LABEL[tugas.operasi as Operasi] || tugas.operasi} • {tugas.soal_ids.length} Soal
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Sudah Selesai</p>
              <h3 className="text-3xl font-black mt-1 text-emerald-600">{sudahSelesai} <span className="text-sm text-muted-foreground font-normal">/ {totalSiswa}</span></h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-950/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Belum Selesai</p>
              <h3 className="text-3xl font-black mt-1 text-amber-600">{belumMengerjakan} <span className="text-sm text-muted-foreground font-normal">/ {totalSiswa}</span></h3>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-950/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-400">Kedaluwarsa</p>
              <h3 className="text-3xl font-black mt-1 text-red-600">{kedaluwarsa} <span className="text-sm text-muted-foreground font-normal">/ {totalSiswa}</span></h3>
            </div>
            <Clock className="w-8 h-8 text-red-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Periode Tugas</p>
              <p className="text-xs font-semibold mt-2">{formatDateLabel(tugas.mulai_pada)}</p>
              <p className="text-xs text-muted-foreground">s.d.</p>
              <p className="text-xs font-semibold text-amber-600">{formatDateLabel(tugas.tenggat_pada)}</p>
            </div>
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Status Pengerjaan Siswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-bold">Nama Siswa</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                  <TableHead className="font-bold text-center">Skor</TableHead>
                  <TableHead className="font-bold text-center">Benar / Total</TableHead>
                  <TableHead className="font-bold text-center">Durasi</TableHead>
                  <TableHead className="font-bold text-center">Tanggal Selesai</TableHead>
                  <TableHead className="w-24 text-center font-bold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentStatuses.map(({ siswa, sesi, status }) => {
                  return (
                    <TableRow 
                      key={siswa.id} 
                      className="hover:bg-muted/10 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedStudentSesi({
                          studentName: siswa.nama,
                          sesiId: sesi ? sesi.id : null,
                          status
                        });
                      }}
                    >
                      <TableCell className="font-bold">{siswa.nama}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          status === 'selesai' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' 
                            : status === 'kedaluwarsa'
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/20'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {status === 'selesai' ? 'Selesai' : status === 'kedaluwarsa' ? 'Kedaluwarsa' : 'Belum'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {sesi ? `${sesi.skor}%` : '-'}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {sesi ? `${sesi.benar} / ${sesi.total_soal}` : '-'}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {sesi ? `${sesi.durasi_detik} detik` : '-'}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {sesi ? formatDateLabel(sesi.selesai_pada) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="link" className="font-bold text-xs p-0 gap-1 text-primary">
                          <FileText className="w-3.5 h-3.5" /> Lihat
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Detail Rekap Pengerjaan Siswa */}
      <Dialog open={!!selectedStudentSesi} onOpenChange={(open) => !open && setSelectedStudentSesi(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Rekap Tugas</DialogTitle>
            <DialogDescription>
              Riwayat pengerjaan tugas oleh **{selectedStudentSesi?.studentName}**
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 max-h-[60vh] overflow-y-auto px-1">
            {selectedStudentSesi?.status === 'belum' ? (
              <div className="text-center py-8 space-y-2">
                <span className="text-4xl">⏳</span>
                <p className="text-sm font-semibold text-muted-foreground">
                  Siswa **{selectedStudentSesi.studentName}** belum mengerjakan tugas ini.
                </p>
              </div>
            ) : selectedStudentSesi?.status === 'kedaluwarsa' ? (
              <div className="text-center py-8 space-y-2">
                <span className="text-4xl">⚠️</span>
                <p className="text-sm font-semibold text-red-500">
                  Tugas untuk siswa **{selectedStudentSesi.studentName}** telah kedaluwarsa dan belum dikerjakan.
                </p>
              </div>
            ) : loadingDetail ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : detailJawabanList.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Detail rekap tidak ditemukan.
              </p>
            ) : (
              detailJawabanList.map((detail) => {
                const soal = detail.soal as { angka1: number; angka2: number; operasi: string };
                const simbol = OPERASI_SIMBOL[soal.operasi as Operasi] || soal.operasi;
                const hasil = 
                  soal.operasi === 'penjumlahan' 
                    ? soal.angka1 + soal.angka2 
                    : soal.operasi === 'pengurangan'
                      ? soal.angka1 - soal.angka2
                      : soal.angka1 * soal.angka2;

                return (
                  <div 
                    key={detail.id}
                    className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon(detail.status as 'benar' | 'salah' | 'diungkap')}
                      <span className="font-mono font-bold text-sm">
                        {soal.angka1} {simbol} {soal.angka2} = {hasil}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="bg-background px-2 py-1 rounded border font-semibold">{detail.jumlah_percobaan}× coba</span>
                      {detail.waktu_detik && detail.waktu_detik > 0 && (
                        <span className="bg-background px-2 py-1 rounded border font-semibold">{detail.waktu_detik}s</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={() => setSelectedStudentSesi(null)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
