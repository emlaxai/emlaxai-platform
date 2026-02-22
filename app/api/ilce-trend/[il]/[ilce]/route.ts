import { NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ il: string; ilce: string }> }
) {
  const { il, ilce } = await params;
  const { searchParams } = new URL(request.url);
  const ay_sayisi = searchParams.get('ay_sayisi') || '48';
  const kategori = searchParams.get('kategori') || 'konut';
  
  const { data, error, status } = await backendJSON(
    `/api/v1/ilce-trend/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}?ay_sayisi=${ay_sayisi}&kategori=${encodeURIComponent(kategori)}`
  );
  
  if (error) {
    return NextResponse.json({ error }, { status });
  }
  
  return NextResponse.json(data);
}
