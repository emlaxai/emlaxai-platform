import { NextRequest, NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ il: string }> }
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = rateLimit(`${ip}:il-trend`, { windowMs: 60_000, maxRequests: 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  }

  const { il } = await params;
  const { searchParams } = new URL(request.url);
  const ay = searchParams.get('ay_sayisi') || '48';
  const kat = searchParams.get('kategori') || 'konut';

  const { data, error, status } = await backendJSON(
    `/api/v1/il-trend/${encodeURIComponent(il)}?ay_sayisi=${ay}&kategori=${encodeURIComponent(kat)}`
  );

  if (error) return NextResponse.json({ error }, { status });
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' },
  });
}
