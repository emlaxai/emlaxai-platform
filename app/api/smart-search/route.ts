import { NextRequest, NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = rateLimit(`${ip}:smart-search`, { windowMs: 60_000, maxRequests: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = searchParams.get('limit') || '12';

  if (q.length < 2) {
    return NextResponse.json({ query: q, results: [], total: 0 });
  }

  const { data, error, status } = await backendJSON(
    `/api/v1/smart-search?q=${encodeURIComponent(q)}&limit=${limit}`
  );

  if (error) return NextResponse.json({ error }, { status });
  return NextResponse.json(data);
}
