import { createClient } from '@/lib/supabase/server';
import PilihSiswaClient from './client';

export const dynamic = 'force-dynamic';

export default async function PilihSiswaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('siswa')
    .select('id, nama, kelas, avatar_url')
    .order('nama');

  return <PilihSiswaClient initialSiswaList={data ?? []} />;
}
