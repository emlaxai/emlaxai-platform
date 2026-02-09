import { NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ il: string; ilce: string }> }
) {
  const { il, ilce } = await params;
  
  const { data, error, status } = await backendJSON(
    `/api/v1/mahalle-fiyatlari/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}`
  );
  
  if (error) {
    return NextResponse.json({ error }, { status });
  }
  
  return NextResponse.json(data);
}
