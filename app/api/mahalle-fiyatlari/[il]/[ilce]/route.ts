import { NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ il: string; ilce: string }> }
) {
  const { il, ilce } = await params;
  const { searchParams } = new URL(request.url);
  const kategori = searchParams.get('kategori') || 'konut';
  
  const { data, error, status } = await backendJSON(
    `/api/v1/mahalle-fiyatlari/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}?kategori=${encodeURIComponent(kategori)}`
  );
  
  if (error) {
    return NextResponse.json({ error }, { status });
  }
  
  return NextResponse.json(data);
}
