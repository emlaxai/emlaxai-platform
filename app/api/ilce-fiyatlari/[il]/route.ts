import { NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ il: string }> }
) {
  const { il } = await params;
  
  const { data, error, status } = await backendJSON(
    `/api/v1/ilce-fiyatlari/${encodeURIComponent(il)}`
  );
  
  if (error) {
    return NextResponse.json({ error }, { status });
  }
  
  return NextResponse.json(data);
}
