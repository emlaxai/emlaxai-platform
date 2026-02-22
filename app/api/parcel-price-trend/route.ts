import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EMLAXAI_API_URL || 'http://34.12.117.124:8000';
const API_KEY = process.env.EMLAXAI_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const kategori = searchParams.get('kategori') || 'konut';
    const tip = searchParams.get('tip') || 'satilik';
    const ay = searchParams.get('ay') || '120';

    if (!id) {
      return NextResponse.json({ error: 'id parametresi gerekli' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `${BACKEND_URL}/api/v1/parcel-price-trend?id=${encodeURIComponent(id)}&kategori=${kategori}&tip=${tip}&ay=${ay}`,
      {
        headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
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
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch (error: any) {
    console.error('Parsel fiyat trend proxy hatası:', error?.message);
    return NextResponse.json({ error: 'İstek hatası' }, { status: 500 });
  }
}
