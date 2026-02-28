import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const limit = searchParams.get('limit') || '3';

  try {
    const params = new URLSearchParams({
      format: 'json',
      q,
      countrycodes: 'tr',
      'accept-language': 'tr',
      limit,
      addressdetails: '1',
    });

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        'User-Agent': 'EmlaXAI/1.0',
        'Accept-Language': 'tr',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(
      { results: data },
      { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } }
    );
  } catch {
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
