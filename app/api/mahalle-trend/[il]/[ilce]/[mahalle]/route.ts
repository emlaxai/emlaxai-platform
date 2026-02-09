import { NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ il: string; ilce: string; mahalle: string }> }
) {
  const { il, ilce, mahalle } = await params;
  const { searchParams } = new URL(request.url);
  const ay_sayisi = searchParams.get('ay_sayisi') || '48';
  
  const { data, error, status } = await backendJSON(
    `/api/v1/mahalle-trend/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}/${encodeURIComponent(mahalle)}?ay_sayisi=${ay_sayisi}`
  );
  
  if (error) {
    return NextResponse.json({ error }, { status });
  }
  
  return NextResponse.json(data);
}
