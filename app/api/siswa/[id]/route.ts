// ============================================
// API Route — Detail Siswa & Progress
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/siswa/[id] — Ambil data detail siswa (termasuk progress tutorial & modul) */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID Siswa wajib disertakan' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from('siswa')
    .select('id, nama, kelas, avatar_url, tutorial_step, tutorial_done, modul_progress')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/** PATCH /api/siswa/[id] — Update data progress/tutorial siswa */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID Siswa wajib disertakan' }, { status: 400 });
  }

  const body = await request.json();
  
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from('siswa')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
