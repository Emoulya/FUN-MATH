'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';
import { toast } from "sonner";
import { OPERASI_LABEL } from '@/lib/constants';
import type { Operasi } from '@/types/math';
import type { TugasDB, SoalDB } from '@/lib/supabase/types';

export default function KelolaTugasPage() {
  const router = useRouter();
  const [tugasList, setTugasList] = useState<TugasDB[]>([]);
  const [siswaList, setSiswaList] = useState<{ id: string; nama: string }[]>([]);
  const [soalList, setSoalList] = useState<SoalDB[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tugasToDelete, setTugasToDelete] = useState<string | null>(null);

  // Form State
  const [namaTugas, setNamaTugas] = useState('');
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<string[]>([]);
  const [selectedOperasi, setSelectedOperasi] = useState<string>('penjumlahan');
  const [selectedSoalIds, setSelectedSoalIds] = useState<string[]>([]);
  const [mulaiPada, setMulaiPada] = useState('');
  const [tenggatPada, setTenggatPada] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // State Soal Langsung
  const [angka1Input, setAngka1Input] = useState('');
  const [angka2Input, setAngka2Input] = useState('');
  const [kesulitanInput, setKesulitanInput] = useState<'mudah' | 'sedang' | 'sulit'>('mudah');
  const [isCreatingSoal, setIsCreatingSoal] = useState(false);

  const supabase = createClient();

  const handleBuatSoalLangsung = async () => {
    const a1 = parseInt(angka1Input);
    const a2 = parseInt(angka2Input);
    if (isNaN(a1) || isNaN(a2)) {
      toast.error('Harap isi Angka 1 dan Angka 2 dengan benar!');
      return;
    }
    
    setIsCreatingSoal(true);
    try {
      const { data, error } = await (supabase as any)
        .from('soal')
        .insert({
          operasi: selectedOperasi,
          angka1: a1,
          angka2: a2,
          kesulitan: kesulitanInput,
          aktif: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSoalList(prev => [...prev, data as SoalDB]);
        setSelectedSoalIds(prev => [...prev, (data as any).id]);
        
        toast.success(`Soal ${a1} ${selectedOperasi === 'penjumlahan' ? '+' : selectedOperasi === 'pengurangan' ? '-' : 'x'} ${a2} berhasil dibuat!`);
        
        setAngka1Input('');
        setAngka2Input('');
      }
    } catch (err: any) {
      toast.error('Gagal membuat soal: ' + (err.message || 'Error tidak dikenal'));
    } finally {
      setIsCreatingSoal(false);
    }
  };

  const fetchTugas = useCallback(async () => {
    setLoading(true);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const client = supabase as any;
    const { data, error } = await client
      .from('tugas')
      .select('*')
      .order('dibuat_pada', { ascending: false });
    
    if (!error && data) {
      setTugasList(data);
    }
    setLoading(false);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [supabase]);

  const fetchSiswaDanSoal = useCallback(async () => {
    const { data: siswaData } = await supabase.from('siswa').select('id, nama').order('nama');
    if (siswaData) setSiswaList(siswaData);

    const { data: soalData } = await supabase.from('soal').select('*').eq('aktif', true);
    if (soalData) setSoalList(soalData as SoalDB[]);
  }, [supabase]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      fetchTugas();
      fetchSiswaDanSoal();
    });
    return () => cancelAnimationFrame(id);
  }, [fetchTugas, fetchSiswaDanSoal]);

  // Filter bank soal yang cocok dengan operasi aktif
  const filteredSoal = soalList.filter(s => s.operasi === selectedOperasi);

  const openDialog = () => {
    setNamaTugas('');
    setSelectedSiswaIds([]);
    setSelectedOperasi('penjumlahan');
    setSelectedSoalIds([]);
    
    // Set default dates: start now, end in 7 days
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 7);

    // Format to yyyy-MM-ddThh:mm
    const formatDate = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    setMulaiPada(formatDate(now));
    setTenggatPada(formatDate(future));
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSave = async () => {
    if (!namaTugas.trim()) {
      toast.error('Harap isi Nama Tugas!');
      return;
    }
    if (selectedSiswaIds.length === 0) {
      toast.error('Harap pilih minimal 1 siswa!');
      return;
    }
    if (selectedSoalIds.length === 0) {
      toast.error('Harap pilih minimal 1 soal untuk ditugaskan!');
      return;
    }
    if (!mulaiPada || !tenggatPada) {
      toast.error('Harap isi periode aktif tugas!');
      return;
    }

    setIsSaving(true);
    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const client = supabase as any;
      const { error } = await client.from('tugas').insert([{
        nama_tugas: namaTugas,
        siswa_ids: selectedSiswaIds,
        soal_ids: selectedSoalIds,
        operasi: selectedOperasi,
        mulai_pada: new Date(mulaiPada).toISOString(),
        tenggat_pada: new Date(tenggatPada).toISOString(),
      } as any] as never);
      /* eslint-enable @typescript-eslint/no-explicit-any */

      if (error) throw error;

      await fetchTugas();
      closeDialog();
      toast.success('Tugas berhasil dibuat!');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || (err instanceof Error ? err.message : 'Error tidak dikenal');
      toast.error('Gagal menyimpan tugas: ' + msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tugasToDelete) return;
    try {
      const { error } = await supabase.from('tugas').delete().eq('id', tugasToDelete);
      if (error) throw error;
      await fetchTugas();
      toast.success('Tugas berhasil dihapus!');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || (err instanceof Error ? err.message : 'Error tidak dikenal');
      toast.error('Gagal menghapus tugas: ' + msg);
    } finally {
      setTugasToDelete(null);
    }
  };

  const handleToggleSoal = (id: string) => {
    setSelectedSoalIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSoalIds(filteredSoal.map(s => s.id));
    } else {
      setSelectedSoalIds([]);
    }
  };

  const formatDateLabel = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Kelola Tugas</h1>
          <p className="text-muted-foreground mt-1">Daftarkan dan awasi penugasan matematika per profil siswa.</p>
        </div>
        <Button onClick={openDialog} className="gap-2 font-bold">
          <Plus className="w-4 h-4" /> Tambah Tugas
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Daftar Penugasan Aktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tugasList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Belum ada tugas yang dibuat. Klik &quot;Tambah Tugas&quot; untuk memberikan latihan kustom.
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-bold">Nama Tugas</TableHead>
                    <TableHead className="font-bold">Operasi</TableHead>
                    <TableHead className="font-bold">Jumlah Soal</TableHead>
                    <TableHead className="font-bold">Siswa Ditugaskan</TableHead>
                    <TableHead className="font-bold">Periode Aktif</TableHead>
                    <TableHead className="w-20 text-center font-bold">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tugasList.map((tugas) => {
                    return (
                      <TableRow 
                        key={tugas.id} 
                        className="hover:bg-muted/10 transition-colors cursor-pointer"
                        onClick={() => router.push(`/kelola-tugas/${tugas.id}`)}
                      >
                        <TableCell className="font-bold text-primary hover:underline">{tugas.nama_tugas}</TableCell>
                        <TableCell className="capitalize">{OPERASI_LABEL[tugas.operasi as Operasi] || tugas.operasi}</TableCell>
                        <TableCell className="font-medium">{tugas.soal_ids.length} Soal</TableCell>
                        <TableCell className="font-medium">{tugas.siswa_ids.length} Siswa</TableCell>
                        <TableCell className="text-sm">
                          <span className="font-medium">{formatDateLabel(tugas.mulai_pada)}</span> s.d. <span className="font-medium text-amber-600">{formatDateLabel(tugas.tenggat_pada)}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTugasToDelete(tugas.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Tambah Tugas */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Buat Penugasan Baru</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="nama_tugas">Nama Tugas</Label>
              <Input 
                id="nama_tugas"
                value={namaTugas}
                onChange={(e) => setNamaTugas(e.target.value)}
                placeholder="Contoh: Tugas Penjumlahan 06/07/26"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pilih Siswa</Label>
                {siswaList.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Checkbox 
                      id="select-all-siswa" 
                      checked={selectedSiswaIds.length === siswaList.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSiswaIds(siswaList.map(s => s.id));
                        } else {
                          setSelectedSiswaIds([]);
                        }
                      }}
                    />
                    <label htmlFor="select-all-siswa" className="cursor-pointer font-medium text-xs">Pilih Semua</label>
                  </div>
                )}
              </div>

              <div className="border border-border rounded-xl max-h-36 overflow-y-auto p-3 space-y-2">
                {siswaList.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-2">
                    Belum ada data siswa.
                  </p>
                ) : (
                  siswaList.map(s => (
                    <div key={s.id} className="flex items-center gap-2 p-1 text-sm">
                      <Checkbox 
                        id={`siswa-${s.id}`} 
                        checked={selectedSiswaIds.includes(s.id)}
                        onCheckedChange={() => {
                          setSelectedSiswaIds(prev =>
                            prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                          );
                        }}
                      />
                      <label htmlFor={`siswa-${s.id}`} className="cursor-pointer font-medium text-sm">
                        {s.nama}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Terpilih: {selectedSiswaIds.length} siswa
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operasi">Operasi Matematika</Label>
              <Select value={selectedOperasi} onValueChange={(val) => {
                setSelectedOperasi(val);
                setSelectedSoalIds([]); // Reset pilihan soal jika operasi berubah
              }}>
                <SelectTrigger id="operasi">
                  <SelectValue placeholder="Pilih Operasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="penjumlahan">Penjumlahan</SelectItem>
                  <SelectItem value="pengurangan">Pengurangan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mulai_pada">Mulai Pada</Label>
                <Input 
                  id="mulai_pada"
                  type="datetime-local"
                  value={mulaiPada}
                  onChange={(e) => setMulaiPada(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenggat_pada">Tenggat Pada</Label>
                <Input 
                  id="tenggat_pada"
                  type="datetime-local"
                  value={tenggatPada}
                  onChange={(e) => setTenggatPada(e.target.value)}
                />
              </div>
            </div>

            {/* Form Buat Soal Langsung */}
            <div className="border border-dashed border-primary/40 rounded-xl p-3 bg-muted/20 space-y-3">
              <span className="text-xs font-bold text-primary block">Atau Buat & Masukkan Soal Baru Langsung</span>
              <div className="flex gap-2 items-end">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="angka1" className="text-xs">Angka 1</Label>
                  <Input 
                    id="angka1" 
                    type="number" 
                    value={angka1Input}
                    onChange={(e) => setAngka1Input(e.target.value)}
                    placeholder="Digit 1"
                    className="h-8 text-sm"
                  />
                </div>
                <span className="font-bold text-lg mb-1 shrink-0">
                  {selectedOperasi === 'penjumlahan' ? '+' : selectedOperasi === 'pengurangan' ? '-' : 'x'}
                </span>
                <div className="space-y-1 flex-1">
                  <Label htmlFor="angka2" className="text-xs">Angka 2</Label>
                  <Input 
                    id="angka2" 
                    type="number" 
                    value={angka2Input}
                    onChange={(e) => setAngka2Input(e.target.value)}
                    placeholder="Digit 2"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Label htmlFor="kesulitan_soal" className="text-xs">Tingkat Kesulitan</Label>
                  <Select value={kesulitanInput} onValueChange={(val: any) => setKesulitanInput(val)}>
                    <SelectTrigger id="kesulitan_soal" className="h-8 text-sm">
                      <SelectValue placeholder="Kesulitan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mudah">Mudah</SelectItem>
                      <SelectItem value="sedang">Sedang</SelectItem>
                      <SelectItem value="sulit">Sulit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="button" 
                  onClick={handleBuatSoalLangsung} 
                  disabled={isCreatingSoal}
                  className="h-8 px-3 font-bold text-xs"
                >
                  {isCreatingSoal ? '...' : '+ Tambah'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pilih Soal dari Bank Soal</Label>
                {filteredSoal.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Checkbox 
                      id="select-all" 
                      checked={selectedSoalIds.length === filteredSoal.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                    <label htmlFor="select-all" className="cursor-pointer font-medium">Pilih Semua</label>
                  </div>
                )}
              </div>

              <div className="border border-border rounded-xl max-h-48 overflow-y-auto p-3 space-y-2">
                {filteredSoal.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Belum ada soal aktif untuk operasi ini di Bank Soal. Harap buat soal terlebih dahulu di tab &quot;Soal&quot;.
                  </p>
                ) : (
                  filteredSoal.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-2 hover:bg-muted/10 rounded-lg text-sm border border-transparent hover:border-border">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id={`soal-${s.id}`} 
                          checked={selectedSoalIds.includes(s.id)}
                          onCheckedChange={() => handleToggleSoal(s.id)}
                        />
                        <label htmlFor={`soal-${s.id}`} className="cursor-pointer font-bold text-base">
                          {s.angka1} {s.operasi === 'penjumlahan' ? '+' : s.operasi === 'pengurangan' ? '-' : 'x'} {s.angka2}
                        </label>
                      </div>
                      <span className="text-xs font-semibold uppercase bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {s.kesulitan}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Terpilih: {selectedSoalIds.length} soal
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={closeDialog}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving} className="font-bold">
              {isSaving ? 'Menyimpan...' : 'Tugaskan Soal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Hapus Tugas */}
      <AlertDialog open={!!tugasToDelete} onOpenChange={(open) => !open && setTugasToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Penugasan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus tugas ini beserta seluruh data riwayat pengerjaan tugas tersebut dari siswa terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold">
              Hapus Tugas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
