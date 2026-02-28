import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EMLAXAI_API_URL || 'http://34.7.72.39:8000';
const API_KEY = process.env.EMLAXAI_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const il = searchParams.get('il');
    const ilce = searchParams.get('ilce');
    const ada = searchParams.get('ada');
    const parsel = searchParams.get('parsel');
    const mahalle = searchParams.get('mahalle') || '';

    if (!il || !ilce || !ada || !parsel) {
      return NextResponse.json(
        { found: false, error: 'il, ilce, ada ve parsel parametreleri gerekli' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      il, ilce, ada, parsel,
      ...(mahalle ? { mahalle } : {}),
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `${BACKEND_URL}/api/v1/parcel-by-location?${params.toString()}`,
      {
        headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { found: false, error: 'Backend hatası' },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (error: any) {
    console.error('parcel-by-location proxy hatası:', error?.message);
    return NextResponse.json(
      { found: false, error: 'İstek hatası' },
      { status: 500 }
    );
  }
}
