// @ts-nocheck
/**
 * Mahalle Fiyat Motoru - Faz 1: İsim Standardizasyonu
 *
 * GeoJSON (SQLite) ve DB (PostgreSQL mahalle_m2_trend) arasındaki
 * isim farklarını çözer:
 *   GeoJSON: "Çiftlik Koy.", "Ada Mah.", "İncedayı Mah."
 *   DB:      "Ciftlik-koyu", "Ada Mahallesi", "Incedayi Mahallesi", "Ada-mah."
 */

const TR_CHAR_MAP: Record<string, string> = {
  'ç': 'c', 'Ç': 'c',
  'ğ': 'g', 'Ğ': 'g',
  'ı': 'i', 'İ': 'i',
  'ö': 'o', 'Ö': 'o',
  'ş': 's', 'Ş': 's',
  'ü': 'u', 'Ü': 'u',
};

function stripTurkish(s: string): string {
  return s.replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => TR_CHAR_MAP[ch] || ch);
}

const SUFFIX_PATTERNS = [
  /\s*mahallesi$/i,
  /\s*-mah\.?$/i,
  /\s*mah\.?$/i,
  /\s*koyu$/i,
  /\s*-koyu$/i,
  /\s*köyü$/i,
  /\s*koy\.?$/i,
  /\s*köy\.?$/i,
  /\s*osb$/i,
  /\s*beldesi$/i,
  /\s*bucagi$/i,
  /\s*bucağı$/i,
];

/**
 * Mahalle ismini normalize eder. Hem GeoJSON hem DB isimlerinde
 * aynı sonucu üretir → eşleştirme (matching) için kullanılır.
 *
 * "Çiftlik Koy."      → "ciftlik"
 * "Ciftlik-koyu"      → "ciftlik"
 * "Ada Mah."          → "ada"
 * "Ada Mahallesi"     → "ada"
 * "Ada-mah."          → "ada"
 * "İncedayı Mah."     → "incedayi"
 * "Incedayi Mahallesi" → "incedayi"
 */
/**
 * Genel isim normalizasyonu (il/ilçe eşleştirmesi).
 * Türkçe karakterleri çıkarır, lowercase yapar, alfanumerik olmayan temizler.
 */
export function normalizeForMatch(name: string): string {
  if (!name) return '';
  return stripTurkish(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Mahalle ismini Türkçe doğru formata çevirir (görüntüleme için).
 * "Abdülkadirköy Koy." → "Abdülkadirköy Köy"
 * "Ada Mah."           → "Ada Mahallesi"
 * "Ciftlik-koyu"       → "Çiftlik Köyü"
 */
export function displayMahalleName(name: string): string {
  if (!name) return '';
  let n = name.trim();

  n = n.replace(/-/g, ' ');

  n = n.replace(/\s+/g, ' ').trim();

  // Suffix'leri önce kaldır, sonra doğru Türkçe halini ekle
  const suffixMap: Array<[RegExp, string]> = [
    [/\s+koyu$/i, ' Köyü'],
    [/\s+koy\.?$/i, ' Köy'],
    [/\s+köy\.?$/i, ' Köy'],
    [/\s+köyü$/i, ' Köyü'],
    [/\s+mahallesi$/i, ' Mahallesi'],
    [/\s+mah\.?$/i, ' Mahallesi'],
  ];

  for (const [pattern, replacement] of suffixMap) {
    if (pattern.test(n)) {
      n = n.replace(pattern, replacement);
      break;
    }
  }

  // Sadece her kelimenin ilk harfini büyüt, suffix'lere dokunma
  const parts = n.split(' ');
  n = parts.map((word, i) => {
    const reserved = ['Köy', 'Köyü', 'Mahallesi', 'Mahallesi'];
    if (reserved.includes(word)) return word;
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');

  return n;
}

export function normalizeMahalle(name: string): string {
  if (!name) return '';

  let n = name.trim();

  n = stripTurkish(n);

  n = n.toLowerCase();

  n = n.replace(/-/g, ' ');

  for (const pat of SUFFIX_PATTERNS) {
    n = n.replace(pat, '');
  }

  n = n.replace(/\s+/g, ' ').trim();

  n = n.replace(/[^a-z0-9 ]/g, '');

  return n.trim();
}

/**
 * DB'den gelen aynı mahallenin birden fazla kaydını (duplikasyon) birleştirir.
 * En yüksek güvenilirlik skoruna sahip olanı alır, diğerlerini atar.
 *
 * Input:  [{mahalle: "Gelincik Mah.", m2: 96447, guven: 31},
 *          {mahalle: "Gelincik Mahallesi", m2: 55830, guven: 75.6},
 *          {mahalle: "Gelincik-mah.", m2: 45269, guven: 45}]
 *
 * Output: [{mahalle: "Gelincik Mahallesi", m2: 55830, guven: 75.6}]
 *         (en yüksek güvenilirlik → en doğru veri)
 */
export function mergeDuplicateMahalleler<T extends { mahalle: string; guvenilirlik?: number; m2_fiyat: number }>(
  mahalleler: T[]
): T[] {
  const groups = new Map<string, T[]>();

  for (const m of mahalleler) {
    const key = normalizeMahalle(m.mahalle);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }

  const result: T[] = [];
  for (const [, entries] of groups) {
    if (entries.length === 1) {
      result.push(entries[0]);
    } else {
      const best = entries.reduce((a, b) => {
        const aScore = a.guvenilirlik ?? 0;
        const bScore = b.guvenilirlik ?? 0;
        return bScore > aScore ? b : a;
      });
      result.push(best);
    }
  }

  return result;
}

/**
 * Mahalle isim eşleştirme map'i oluşturur.
 * GeoJSON ismi → DB kaydı eşleştirmesi yapar.
 */
export function buildMahalleFiyatMap(
  mahalleler: Array<{ mahalle: string; m2_fiyat: number; guvenilirlik?: number }>
): Record<string, { mahalle: string; m2_fiyat: number }> {
  const merged = mergeDuplicateMahalleler(mahalleler);
  const map: Record<string, { mahalle: string; m2_fiyat: number }> = {};

  for (const m of merged) {
    const key = normalizeMahalle(m.mahalle);
    if (key && !map[key]) {
      map[key] = { mahalle: m.mahalle, m2_fiyat: m.m2_fiyat };
    }
  }

  return map;
}
