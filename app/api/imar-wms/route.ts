import { NextRequest, NextResponse } from 'next/server';

/**
 * İmar Parsel API Proxy
 * VM'deki PostgreSQL parcels tablosundan bbox ile parsel çeker.
 */

const BACKEND_URL = process.env.EMLAXAI_API_URL || 'http://34.12.117.124:8000';
const API_KEY = process.env.EMLAXAI_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bbox = searchParams.get('bbox');
    const isZones = searchParams.get('zones') === 'true';

    if (isZones) {
      if (!bbox) {
        return NextResponse.json({ type: 'FeatureCollection', features: [] }, { status: 200 });
      }
      const url = `${BACKEND_URL}/api/v1/zones?bbox=${encodeURIComponent(bbox)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, {
        headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      if (!response.ok) {
        return NextResponse.json({ type: 'FeatureCollection', features: [] }, { status: 200 });
      }
      const data = await response.json();
      return NextResponse.json(data, {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=600, s-maxage=600' },
      });
    }

    const il = searchParams.get('il');
    const zoom = searchParams.get('zoom') || '14';
    const limit = searchParams.get('limit') || '5000';
    const imarMode = searchParams.get('imar_mode') || 'false';
    
    if (!il || !bbox) {
      return NextResponse.json(
        { error: 'il ve bbox parametreleri gerekli' },
        { status: 400 }
      );
    }
    
    const url = `${BACKEND_URL}/api/v1/parcels?il=${encodeURIComponent(il)}&bbox=${encodeURIComponent(bbox)}&zoom=${zoom}&limit=${limit}&imar_mode=${imarMode}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      console.error(`Parsel API hatası: ${response.status}`);
      return NextResponse.json(
        { type: 'FeatureCollection', features: [] },
        { status: 200 }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  } catch (error: any) {
    console.error('Parsel proxy hatası:', error?.message);
    return NextResponse.json(
      { type: 'FeatureCollection', features: [] },
      { status: 200 }
    );
  }
}
