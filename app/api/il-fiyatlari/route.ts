import { NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kategori = searchParams.get('kategori') || 'konut';
  
  const { data, error, status } = await backendJSON(`/api/v1/il-fiyatlari?kategori=${encodeURIComponent(kategori)}`);
  
  if (error) {
    return NextResponse.json({ error }, { status });
  }
  
  return NextResponse.json(data);
}
