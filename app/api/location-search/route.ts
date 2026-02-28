import { NextRequest, NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = searchParams.get('limit') || '10';

  if (q.length < 2) {
    return NextResponse.json({ query: q, results: [], total: 0 });
  }

  const { data, error, status } = await backendJSON(
    `/api/v1/locations/search?q=${encodeURIComponent(q)}&limit=${limit}`
  );

  if (error) return NextResponse.json({ query: q, results: [], total: 0 });
  return NextResponse.json(data);
}
