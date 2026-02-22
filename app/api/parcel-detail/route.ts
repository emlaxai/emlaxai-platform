import { NextRequest, NextResponse } from 'next/server';

/**
 * Parsel Detay API Proxy v4
 * 1. Backend PostGIS: parsel bilgileri + kadastro mesafeleri + DB POI (okul/hastane/cami/sanayi/havalimanı)
 * 2. Google Places Nearby Search: AVM, market, otobüs durağı, eczane (gerçek dünya verileri)
 */

const BACKEND_URL = process.env.EMLAXAI_API_URL || 'http://34.12.117.124:8000';
const API_KEY = process.env.EMLAXAI_API_KEY || '';
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

interface PlaceResult {
  name: string;
  distance_m: number;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function googleNearby(lat: number, lng: number, type: string, radius: number = 5000): Promise<PlaceResult | null> {
  if (!GOOGLE_KEY) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_KEY}`;
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK' || !data.results?.length) return null;
    const place = data.results[0];
    const plat = place.geometry?.location?.lat;
    const plng = place.geometry?.location?.lng;
    if (!plat || !plng) return null;
    return {
      name: place.name || '',
      distance_m: Math.round(haversine(lat, lng, plat, plng)),
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parametresi gerekli' }, { status: 400 });
    }

    // 1. Backend'den parsel detayı + DB POI'ları
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const backendRes = await fetch(
      `${BACKEND_URL}/api/v1/parcel-detail?id=${encodeURIComponent(id)}`,
      {
        headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
      }
    );
    clearTimeout(timeout);

    if (!backendRes.ok) {
      return NextResponse.json({ error: 'Backend hatası' }, { status: 502 });
    }

    const backendData = await backendRes.json();
    if (backendData.error) {
      return NextResponse.json(backendData, { status: 404 });
    }

    // 2. Google Places ile ek POI'ları paralel al
    const lat = backendData.parsel?.lat;
    const lng = backendData.parsel?.lng;

    if (lat && lng && GOOGLE_KEY) {
      try {
        const [supermarket, busStop, pharmacy, school, hospital] = await Promise.all([
          googleNearby(lat, lng, 'supermarket', 5000),
          googleNearby(lat, lng, 'transit_station', 5000),
          googleNearby(lat, lng, 'pharmacy', 5000),
          googleNearby(lat, lng, 'school', 5000),
          googleNearby(lat, lng, 'hospital', 10000),
        ]);

        const poi = backendData.poi_mesafeler || {};

        // Google sonuçlarıyla zenginleştir / ekle
        poi.market = supermarket;
        poi.otobus = busStop;
        poi.eczane = pharmacy;

        // Okul/hastane: DB sonucu yoksa veya Google daha yakınsa, Google'ı kullan
        if (school && (!poi.okul || school.distance_m < poi.okul.distance_m)) {
          poi.okul = school;
        }
        if (hospital && (!poi.hastane || hospital.distance_m < poi.hastane.distance_m)) {
          poi.hastane = hospital;
        }

        backendData.poi_mesafeler = poi;
      } catch {
        // Google hata verirse mevcut DB verileriyle devam et
      }
    }

    return NextResponse.json(backendData, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });

  } catch (error: any) {
    console.error('Parsel detay proxy hatası:', error?.message);
    return NextResponse.json({ error: 'İstek hatası' }, { status: 500 });
  }
}
