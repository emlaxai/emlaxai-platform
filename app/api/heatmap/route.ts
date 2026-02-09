import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EMLAXAI_API_URL || 'http://34.12.117.124:8000';
const API_KEY = process.env.EMLAXAI_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const il = searchParams.get('il') || '';
    const bbox = searchParams.get('bbox') || '';
    const zoom = searchParams.get('zoom') || '10';
    const limit = searchParams.get('limit') || '8000';

    const params = new URLSearchParams();
    if (il) params.set('il', il);
    if (bbox) params.set('bbox', bbox);
    params.set('zoom', zoom);
    params.set('limit', limit);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `${BACKEND_URL}/api/v1/heatmap?${params.toString()}`,
      {
        headers: { 'X-API-Key': API_KEY },
        signal: controller.signal,
        cache: 'no-store',
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: 'Backend hatası' }, { status: 502 });
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=120' },
    });
  } catch (error: any) {
    console.error('Heatmap proxy hatası:', error?.message);
    return NextResponse.json({ error: 'İstek hatası' }, { status: 500 });
  }
}
