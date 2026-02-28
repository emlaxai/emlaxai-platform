import { NextRequest, NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ il: string }> }
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = rateLimit(`${ip}:ilce-fiyatlari`, { windowMs: 60_000, maxRequests: 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  }

  const { il } = await params;
  const kat = new URL(request.url).searchParams.get('kategori') || 'konut';

  const { data, error, status } = await backendJSON(
    `/api/v1/ilce-fiyatlari/${encodeURIComponent(il)}?kategori=${encodeURIComponent(kat)}`
  );

  if (error) return NextResponse.json({ error }, { status });
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
  });
}
