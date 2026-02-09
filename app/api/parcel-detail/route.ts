import { NextRequest, NextResponse } from 'next/server';

/**
 * Parsel Detay API Proxy
 * 1. VM'den parsel detayı + mesafeler + imar baskısı al
 * 2. OpenStreetMap Overpass API'den POI mesafeleri hesapla
 */

const BACKEND_URL = process.env.EMLAXAI_API_URL || 'http://34.12.117.124:8000';
const API_KEY = process.env.EMLAXAI_API_KEY || '';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

interface POIResult {
  type: string;
  name: string;
  distance_m: number;
}

// Haversine mesafe hesaplama
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Overpass API ile parsel çevresindeki standart POI'ları bul (5km)
 */
async function fetchStandardPOIs(lat: number, lng: number, radiusM: number = 5000): Promise<Record<string, POIResult | null>> {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="school"](around:${radiusM},${lat},${lng});
      node["amenity"="hospital"](around:${radiusM},${lat},${lng});
      node["amenity"="clinic"](around:${radiusM},${lat},${lng});
      node["shop"="mall"](around:${radiusM},${lat},${lng});
      node["shop"="supermarket"](around:${radiusM},${lat},${lng});
      node["highway"="bus_stop"](around:${radiusM},${lat},${lng});
      node["amenity"="bus_station"](around:${radiusM},${lat},${lng});
      node["landuse"="industrial"](around:${radiusM},${lat},${lng});
      node["amenity"="marketplace"](around:${radiusM},${lat},${lng});
      way["amenity"="school"](around:${radiusM},${lat},${lng});
      way["amenity"="hospital"](around:${radiusM},${lat},${lng});
      way["shop"="mall"](around:${radiusM},${lat},${lng});
      way["landuse"="industrial"](around:${radiusM},${lat},${lng});
    );
    out center;
  `;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) return { okul: null, hastane: null, avm: null, otobus: null, sanayi: null };

    const data = await res.json();
    const elements = data.elements || [];

    const categories: Record<string, { tags: string[], result: POIResult | null }> = {
      okul: { tags: ['school'], result: null },
      hastane: { tags: ['hospital', 'clinic'], result: null },
      avm: { tags: ['mall', 'supermarket', 'marketplace'], result: null },
      otobus: { tags: ['bus_stop', 'bus_station'], result: null },
      sanayi: { tags: ['industrial'], result: null },
    };

    for (const el of elements) {
      const elLat = el.lat || el.center?.lat;
      const elLng = el.lon || el.center?.lon;
      if (!elLat || !elLng) continue;

      const dist = haversine(lat, lng, elLat, elLng);
      const tags = el.tags || {};
      const name = tags.name || tags['name:tr'] || '';

      for (const [, cat] of Object.entries(categories)) {
        const amenity = tags.amenity || '';
        const shop = tags.shop || '';
        const highway = tags.highway || '';
        const landuse = tags.landuse || '';

        const matchesTag = cat.tags.some(t =>
          amenity === t || shop === t || highway === t || landuse === t
        );

        if (matchesTag && (!cat.result || dist < cat.result.distance_m)) {
          cat.result = { type: 'poi', name, distance_m: Math.round(dist) };
        }
      }
    }

    return Object.fromEntries(
      Object.entries(categories).map(([key, val]) => [key, val.result])
    );
  } catch (err) {
    console.error('Overpass POI hatası:', err);
    return { okul: null, hastane: null, avm: null, otobus: null, sanayi: null };
  }
}

/**
 * Overpass API ile en yakın havalimanını bul (80km yarıçap)
 */
async function fetchNearestAirport(lat: number, lng: number): Promise<POIResult | null> {
  const query = `
    [out:json][timeout:12];
    (
      way["aeroway"="aerodrome"](around:80000,${lat},${lng});
      relation["aeroway"="aerodrome"](around:80000,${lat},${lng});
      node["aeroway"="aerodrome"](around:80000,${lat},${lng});
    );
    out center;
  `;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 11000);

    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    const elements = data.elements || [];

    let nearest: POIResult | null = null;

    for (const el of elements) {
      const elLat = el.lat || el.center?.lat;
      const elLng = el.lon || el.center?.lon;
      if (!elLat || !elLng) continue;

      const dist = haversine(lat, lng, elLat, elLng);
      const tags = el.tags || {};
      if (tags.aeroway !== 'aerodrome') continue;

      const name = tags['name:tr'] || tags.name || tags.iata || 'Havalimanı';

      if (!nearest || dist < nearest.distance_m) {
        nearest = { type: 'havalimani', name, distance_m: Math.round(dist) };
      }
    }

    return nearest;
  } catch (err) {
    console.error('Overpass havalimanı hatası:', err);
    return null;
  }
}

/**
 * Tüm POI verilerini paralel olarak al
 */
async function fetchNearbyPOIs(lat: number, lng: number): Promise<Record<string, POIResult | null>> {
  const [standardPOIs, airport] = await Promise.all([
    fetchStandardPOIs(lat, lng),
    fetchNearestAirport(lat, lng),
  ]);

  return {
    ...standardPOIs,
    havalimani: airport,
  };
}

function getDefaultPOIs(): Record<string, POIResult | null> {
  return { okul: null, hastane: null, avm: null, otobus: null, sanayi: null, havalimani: null };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parametresi gerekli' }, { status: 400 });
    }

    // 1. VM'den parsel detayı al
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

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

    // 2. Overpass API'den POI mesafeleri (arka planda, timeout varsa atla)
    let poiData: Record<string, POIResult | null> = getDefaultPOIs();

    const lat = backendData.parsel?.lat;
    const lng = backendData.parsel?.lng;

    if (lat && lng) {
      try {
        poiData = await fetchNearbyPOIs(lat, lng);
      } catch {
        // Overpass hatası kritik değil, devam et
      }
    }

    // 3. Birleştir
    return NextResponse.json({
      ...backendData,
      poi_mesafeler: poiData,
    }, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });

  } catch (error: any) {
    console.error('Parsel detay proxy hatası:', error?.message);
    return NextResponse.json({ error: 'İstek hatası' }, { status: 500 });
  }
}
