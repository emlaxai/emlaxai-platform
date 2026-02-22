import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import Database from 'better-sqlite3';

// DB'yi lazy initialize et
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'mahalle_sinirlari.db');
    db = new Database(dbPath, { readonly: true });
    db.pragma('journal_mode = WAL');
  }
  return db;
}

// GeoJSON il/ilçe isimleri → SQLite DB isimleri eşleştirme
// GeoJSON ASCII-ish isimler kullanır, DB Türkçe karakterli isimler
const GEO_IL_TO_DB: Record<string, string> = {
  'Adiyaman': 'Adıyaman',
  'Afyon': 'Afyonkarahisar',
  'Agri': 'Ağrı',
  'Aydin': 'Aydın',
  'Balikesir': 'Balıkesir',
  'Diyarbakir': 'Diyarbakır',
  'Eskisehir': 'Eskişehir',
  'Gümüshane': 'Gümüşhane',
  'Istanbul': 'İstanbul',
  'Izmir': 'İzmir',
  'K.Maras': 'Kahramanmaraş',
  'Kinkkale': 'Kırıkkale',
  'Kirklareli': 'Kırklareli',
  'Kirsehir': 'Kırşehir',
  'Mugla': 'Muğla',
  'Mus': 'Muş',
  'Nevsehir': 'Nevşehir',
  'Nigde': 'Niğde',
  'Sanliurfa': 'Şanlıurfa',
  'Sirnak': 'Şırnak',
  'Tekirdag': 'Tekirdağ',
  'Usak': 'Uşak',
  'Zinguldak': 'Zonguldak',
  'Çankiri': 'Çankırı',
};

// Türkçe karakter normalizasyonu (küçük harfe)
function normalizeTR(s: string): string {
  return s
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/İ/g, 'i');
}

// İlçe adını DB'deki karşılığına çevir (fuzzy match)
function findIlceInDb(database: Database.Database, ilAd: string, ilceGeoName: string): string | null {
  // Önce direkt eşleşme dene
  const direct = database.prepare(
    'SELECT DISTINCT ilce_ad FROM mahalleler WHERE il_ad = ? AND ilce_ad = ? LIMIT 1'
  ).get(ilAd, ilceGeoName) as { ilce_ad: string } | undefined;
  
  if (direct) return direct.ilce_ad;
  
  // Fuzzy: DB'deki tüm ilçeleri al, normalize ederek karşılaştır
  const ilceler = database.prepare(
    'SELECT DISTINCT ilce_ad FROM mahalleler WHERE il_ad = ?'
  ).all(ilAd) as Array<{ ilce_ad: string }>;
  
  const normalizedSearch = normalizeTR(ilceGeoName);
  
  for (const row of ilceler) {
    if (normalizeTR(row.ilce_ad) === normalizedSearch) {
      return row.ilce_ad;
    }
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const il = searchParams.get('il');
  const ilce = searchParams.get('ilce');

  if (!il || !ilce) {
    return NextResponse.json(
      { error: 'il ve ilce parametreleri zorunludur' },
      { status: 400 }
    );
  }

  try {
    const database = getDb();

    // İl adını DB formatına çevir
    const dbIl = GEO_IL_TO_DB[il] || il;
    
    // İlçe adını fuzzy match ile bul
    const dbIlce = findIlceInDb(database, dbIl, ilce);
    
    if (!dbIlce) {
      // İlçe bulunamazsa boş dön
      return NextResponse.json(
        { type: 'FeatureCollection', features: [] },
        { headers: { 'Cache-Control': 'public, max-age=86400' } }
      );
    }

    const rows = database.prepare(`
      SELECT ad, geometry_type, geometry_json, alan_m2, bbox
      FROM mahalleler
      WHERE il_ad = ? AND ilce_ad = ?
      AND geometry_json IS NOT NULL
    `).all(dbIl, dbIlce) as Array<{
      ad: string;
      geometry_type: string;
      geometry_json: string;
      alan_m2: number | null;
      bbox: string | null;
    }>;

    const features = rows.map((row) => ({
      type: 'Feature' as const,
      properties: {
        ad: row.ad,
        ilce: dbIlce,
        il: dbIl,
        alan_m2: row.alan_m2,
      },
      geometry: JSON.parse(row.geometry_json),
    }));

    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    return NextResponse.json(geojson, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Mahalle sınırları hatası:', error);
    return NextResponse.json(
      { error: 'Mahalle sınırları yüklenemedi' },
      { status: 500 }
    );
  }
}
