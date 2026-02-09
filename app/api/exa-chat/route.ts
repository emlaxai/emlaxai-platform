import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { backendJSON } from '@/lib/backend';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ========================================================================
// Function Definitions - Exa'nın erişebileceği veritabanı fonksiyonları
// ========================================================================

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getEconomicData',
      description: 'Türkiye ekonomik verilerini getirir: USD/TRY, EUR/TRY, altın, BIST100, enflasyon, faiz oranı, risk skorları',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getIlFiyatlari',
      description: 'Türkiye\'deki tüm 81 ilin güncel konut m² fiyatlarını ve 12 aylık trendlerini getirir',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getIlTrend',
      description: 'Belirli bir ilin aylık m² fiyat trend geçmişini ve gelecek tahminlerini getirir',
      parameters: {
        type: 'object',
        properties: {
          il: { type: 'string', description: 'İl adı, örn: İstanbul, Ankara, İzmir' },
          ay_sayisi: { type: 'number', description: 'Kaç aylık veri getirilsin (varsayılan: 48)' },
        },
        required: ['il'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getIlceFiyatlari',
      description: 'Belirli bir ilin tüm ilçelerinin güncel m² fiyatlarını getirir',
      parameters: {
        type: 'object',
        properties: {
          il: { type: 'string', description: 'İl adı, örn: İstanbul, Ankara' },
        },
        required: ['il'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getIlceTrend',
      description: 'Belirli bir ilçenin aylık m² fiyat trend geçmişini getirir',
      parameters: {
        type: 'object',
        properties: {
          il: { type: 'string', description: 'İl adı' },
          ilce: { type: 'string', description: 'İlçe adı, örn: Kadıköy, Beşiktaş' },
          ay_sayisi: { type: 'number', description: 'Kaç aylık veri (varsayılan: 48)' },
        },
        required: ['il', 'ilce'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMahalleFiyatlari',
      description: 'Belirli bir ilçenin tüm mahallelerinin güncel m² fiyatlarını getirir',
      parameters: {
        type: 'object',
        properties: {
          il: { type: 'string', description: 'İl adı' },
          ilce: { type: 'string', description: 'İlçe adı' },
        },
        required: ['il', 'ilce'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTurkiyeTrend',
      description: 'Türkiye geneli konut m² fiyat trendi (tüm illerin ortalaması)',
      parameters: {
        type: 'object',
        properties: {
          ay_sayisi: { type: 'number', description: 'Kaç aylık veri (varsayılan: 48)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getBolgePlaniVerisi',
      description: 'T.C. Kalkınma Ajansları 2024-2028 Bölge Planlarından devlet yatırımları, projeler, OSB planları, altyapı, ulaşım, turizm, enerji, kentsel dönüşüm, tarım ve sanayi bilgilerini getirir. Tüm 81 il ve 26 bölge planı mevcuttur. Bir il/bölge hakkında yatırım, proje, planlama, strateji bilgisi sorulduğunda MUTLAKA bu fonksiyonu çağır.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Arama sorgusu, örn: "yatırım projeleri", "OSB planları", "turizm stratejisi", "kentsel dönüşüm", "ulaşım altyapısı"' },
          il: { type: 'string', description: 'İl adı filtresi (opsiyonel), örn: Muğla, İstanbul, Ankara' },
          konu: { type: 'string', description: 'Konu filtresi (opsiyonel): yatirim, proje, osb, ulasim, turizm, tarim, sanayi, enerji, afet, egitim, saglik, cevre, ekonomi, konut' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getParselDetay',
      description: 'Belirli bir parselin detaylı bilgilerini getirir: imar baskısı skoru, tapu işlem hacmi, en yakın yol/arsa/konut/ticari mesafeleri, çevre POI mesafeleri (okul, hastane, AVM, otobüs, havalimanı), bölge parsel dağılımı. Parsel ID (tapu kimlik no) gerektirir.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Parsel tapu kimlik numarası' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTapuIslemStats',
      description: 'TKGM (Tapu ve Kadastro Genel Müdürlüğü) tapu işlem hacmi istatistiklerini getirir. İl bazlı toplam tapu işlem sayısı, ortalama işlem yoğunluğu, en yoğun parseller, il sıralaması bilgilerini içerir. Emlak piyasası aktivitesi, likidite analizi ve talep yoğunluğu değerlendirmesi için kullanılır.',
      parameters: {
        type: 'object',
        properties: {
          il: { type: 'string', description: 'İl adı, örn: İstanbul, Muğla, Ankara' },
          parsel_id: { type: 'string', description: 'Opsiyonel: Parsel tapu kimlik numarası (parsel bazlı işlem sorgusu için)' },
        },
        required: ['il'],
      },
    },
  },
];

// ========================================================================
// İl/İlçe İsim Normalizasyonu - Türkçe → DB formatı
// ========================================================================

const TURKISH_TO_DB_NAME: Record<string, string> = {
  'Muğla': 'Mugla',
  'Bartın': 'Bartin',
  'Bingöl': 'Bingol',
  'Düzce': 'Duzce',
  'Elazığ': 'Elazig',
  'Gümüşhane': 'Gumushane',
  'Iğdır': 'Igdir',
  'Karabük': 'Karabuk',
  'Kütahya': 'Kutahya',
  'Çanakkale': 'Canakkale',
  'Çankırı': 'Cankiri',
  'Çorum': 'Corum',
  'Kahramanmaraş': 'Kahramanmaras',
  'Kırıkkale': 'Kirikkale',
  'Şanlıurfa': 'Sanliurfa',
  'Şırnak': 'Sirnak',
  'Ağrı': 'Agri',
  'Aydın': 'Aydin',
  'Bolu': 'Bolu',
  'Erzincan': 'Erzincan',
  'Erzurum': 'Erzurum',
  'Eskişehir': 'Eskisehir',
  'Isparta': 'Isparta',
  'Kırklareli': 'Kirklareli',
  'Kırşehir': 'Kirsehir',
  'Mardin': 'Mardin',
  'Muş': 'Mus',
  'Nevşehir': 'Nevsehir',
  'Niğde': 'Nigde',
  'Sinop': 'Sinop',
  'Sivas': 'Sivas',
  'Tekirdağ': 'Tekirdag',
  'Tunceli': 'Tunceli',
  'Uşak': 'Usak',
  'Yozgat': 'Yozgat',
  'Zonguldak': 'Zonguldak',
  'İstanbul': 'İstanbul',
  'İzmir': 'İzmir',
  'Afyonkarahisar': 'Afyonkarahisar',
};

function normalizeIlName(name: string): string {
  if (!name) return name;
  // Direkt eşleşme varsa kullan
  if (TURKISH_TO_DB_NAME[name]) return TURKISH_TO_DB_NAME[name];
  // Case-insensitive kontrol
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(TURKISH_TO_DB_NAME)) {
    if (key.toLowerCase() === lower) return value;
  }
  // Genel Türkçe karakter dönüşümü (eşleşme bulunamazsa)
  return name
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/ı/g, 'i').replace(/İ/g, 'I');
}

// ========================================================================
// Function Executors - Backend API çağrıları
// ========================================================================

// Timeout'lu backend çağrısı (8 saniye limit)
async function backendWithTimeout(path: string, timeoutMs = 8000): Promise<{ data?: any; error?: string; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `${process.env.EMLAXAI_API_URL || 'http://34.6.58.78:8000'}${path}`;
    const res = await fetch(url, {
      headers: {
        'X-API-Key': process.env.EMLAXAI_API_KEY || '',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    if (!res.ok) {
      return { error: `HTTP ${res.status}`, status: res.status };
    }
    const data = await res.json();
    return { data, status: 200 };
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === 'AbortError') {
      return { error: 'Zaman aşımı (timeout)', status: 408 };
    }
    return { error: err?.message || 'Bağlantı hatası', status: 503 };
  }
}

async function executeFunction(name: string, args: any): Promise<string> {
  try {
    let result;
    switch (name) {
      case 'getEconomicData':
        result = await backendWithTimeout('/api/v1/economic');
        break;
      case 'getIlFiyatlari':
        result = await backendWithTimeout('/api/v1/il-fiyatlari');
        break;
      case 'getIlTrend': {
        const aySayisi = args.ay_sayisi || 48;
        const il = normalizeIlName(args.il);
        const ilEncoded = encodeURIComponent(il);
        result = await backendWithTimeout(`/api/v1/il-trend/${ilEncoded}?ay_sayisi=${aySayisi}`);
        break;
      }
      case 'getIlceFiyatlari': {
        const il = normalizeIlName(args.il);
        const ilEnc = encodeURIComponent(il);
        result = await backendWithTimeout(`/api/v1/ilce-fiyatlari/${ilEnc}`);
        break;
      }
      case 'getIlceTrend': {
        const aySayisi2 = args.ay_sayisi || 48;
        const il = normalizeIlName(args.il);
        const ilEnc2 = encodeURIComponent(il);
        const ilceEnc = encodeURIComponent(args.ilce);
        result = await backendWithTimeout(`/api/v1/ilce-trend/${ilEnc2}/${ilceEnc}?ay_sayisi=${aySayisi2}`);
        break;
      }
      case 'getMahalleFiyatlari': {
        const il = normalizeIlName(args.il);
        const ilEnc3 = encodeURIComponent(il);
        const ilceEnc2 = encodeURIComponent(args.ilce);
        result = await backendWithTimeout(`/api/v1/mahalle-fiyatlari/${ilEnc3}/${ilceEnc2}`);
        break;
      }
      case 'getTurkiyeTrend': {
        const aySayisi3 = args.ay_sayisi || 48;
        result = await backendWithTimeout(`/api/v1/turkiye-trend?ay_sayisi=${aySayisi3}`);
        break;
      }
      case 'getBolgePlaniVerisi': {
        const query = encodeURIComponent(args.query || '');
        const il = args.il ? `&il=${encodeURIComponent(normalizeIlName(args.il))}` : '';
        const konu = args.konu ? `&konu=${encodeURIComponent(args.konu)}` : '';
        result = await backendWithTimeout(`/api/v1/rag-search?query=${query}${il}${konu}&limit=8`, 10000);
        break;
      }
      case 'getParselDetay': {
        const parselId = encodeURIComponent(args.id || '');
        result = await backendWithTimeout(`/api/v1/parcel-detail?id=${parselId}`, 12000);
        break;
      }
      case 'getTapuIslemStats': {
        const tapuIl = args.il ? `il=${encodeURIComponent(args.il)}` : '';
        const tapuParsel = args.parsel_id ? `&parsel_id=${encodeURIComponent(args.parsel_id)}` : '';
        result = await backendWithTimeout(`/api/v1/tapu-islem-stats?${tapuIl}${tapuParsel}`, 10000);
        break;
      }
      default:
        return JSON.stringify({ error: 'Bilinmeyen fonksiyon' });
    }

    if (result.error) {
      return JSON.stringify({ error: result.error, name, args_sent: args });
    }

    // Veriyi kısalt (token limiti için) - büyük dizilerde ilk 50 kaydı al
    const data = result.data;
    if (data && typeof data === 'object') {
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key]) && data[key].length > 50) {
          data[key] = data[key].slice(0, 50);
          data[`${key}_not`] = `İlk 50 kayıt gösterildi, toplam: ${result.data[key].length || '50+'}`;
        }
      }
    }

    return JSON.stringify(data);
  } catch (err: any) {
    return JSON.stringify({ error: err?.message || 'Veri çekilemedi', name, args });
  }
}

// ========================================================================
// System Prompt
// ========================================================================

const SYSTEM_PROMPT = `Sen "Exa"sın — Türkiye'nin en gelişmiş gayrimenkul yapay zeka danışmanısın. Profesyonel bir yatırım stratejisti, piyasa analisti ve emlak danışmanı olarak çalışıyorsun. Big 4 danışmanlık firmalarının sunduğu seviyede stratejik analiz üretebiliyorsun.

Sen bir veritabanından veri okuyan bir araç değilsin. Sen bu verileri doğuştan bilen, sürekli öğrenen, derin stratejik düşünce kapasitesine sahip gelişmiş bir yapay zekasın. Asla "veritabanından çekildi", "EmlaXAI veritabanı" gibi teknik ifadeler kullanma. Verileri kendi uzmanlığın gibi doğal sun.

KİMLİK BİLGİSİ (Seni veya EmlaXAI'yi sorduklarında):
Sen EmlaXAI platformunun yapay zeka asistanısın. Seni soran olursa gurur ve minnetle anlat:
- **Kurucu ve Vizyoner:** Girişimci **Cengizhan Kazancı**. EmlaXAI'nin arkasındaki vizyon, strateji ve teknoloji onun eseri.
- **Ekip Arkadaşları ve Ortaklar:** **Eylül Kazancı**, **Elif Çağlar**, **Muhammet Çağlar**, **Senanur Kazancı**, **Tunahan Güler**, **Seyitcan Tetik**
- Bu ekip birlikte Türkiye'nin emlak piyasasını yapay zeka ile dönüştürme vizyonuyla çalışıyor.
- "Yaratıcın kim?", "Seni kim yaptı?", "EmlaXAI'nin kurucusu kim?", "Sahibi kim?" gibi sorularda bu bilgileri samimi, onure edici ve gurur dolu bir şekilde paylaş.

═══════════════════════════════════════════════
VERİ KAYNAKLARIN (Erişebildiğin bilgi havuzu):
═══════════════════════════════════════════════
1. **Canlı Piyasa Verileri:** 81 ilin, tüm ilçe ve mahallelerin anlık konut m² fiyatları, aylık trendler, gelecek tahminleri
2. **Ekonomik Göstergeler:** USD/TRY, EUR/TRY, altın, BIST100, enflasyon, politika faizi, risk skorları
3. **T.C. Kalkınma Ajansları 2024-2028 Bölge Planları:** 26 bölge, 81 il — devlet yatırım projeleri, OSB planları, altyapı, ulaşım (otoyol, demiryolu, havalimanı, liman), enerji, turizm, tarım, sanayi, kentsel dönüşüm, afet risk planları, bütçeler, istihdam hedefleri
4. **Parsel Bazlı İmar Analizi:** İmar baskısı skorları (0-100), kadastro mesafeleri (yol, arsa, konut, ticari), çevre POI mesafeleri (okul, hastane, AVM, otobüs, OSB), bölge parsel dağılımı

═══════════════════════════════════════════════
ANALİTİK ARAÇLARIN (Ürettiğin analiz tipleri):
═══════════════════════════════════════════════

📊 **1. SWOT ANALİZİ (Güçlü-Zayıf-Fırsat-Tehdit)**
Her il, ilçe veya parsel analizi için SWOT üret. Format:
> **💪 Güçlü Yönler**
> - [Somut verilerle desteklenen maddeler]
>
> **⚠️ Zayıf Yönler**
> - [Riskleri ve eksiklikleri belirt]
>
> **🚀 Fırsatlar**
> - [Devlet yatırımları, trend değişimleri, projeler]
>
> **🔻 Tehditler**
> - [Deprem riski, su sorunu, aşırı fiyatlanma vb.]

SWOT analizi yapılacak durumlar:
- Bir il/ilçe hakkında genel soru → otomatik SWOT ekle
- "Analiz et", "değerlendir", "ne düşünüyorsun" gibi sorularda → SWOT sun
- Yatırım sorusunda → yatırım odaklı SWOT
- SWOT'u devlet bölge planı verileri + m² fiyat trendleri + ekonomik göstergelerle destekle

🏗️ **2. YATIRIM ÖNERİSİ ve STRATEJİ RAPORU**
Yatırım sorusu geldiğinde profesyonel bir rapor formatında sun:

> ### 🎯 Yatırım Profili
> - **Risk Seviyesi:** Düşük / Orta / Yüksek
> - **Yatırım Ufku:** Kısa (0-2 yıl) / Orta (2-5 yıl) / Uzun (5+ yıl)
> - **Beklenen Getiri:** %XX-XX yıllık
> - **Tavsiye Edilen Strateji:** [Al-Tut / Geliştir-Sat / Kiralık Getiri / Arazi Bankacılığı]
>
> ### 📈 Fiyat Projeksiyonu
> - **2025 Sonu Tahmini:** XX.XXX TL/m²
> - **2026 Sonu Tahmini:** XX.XXX TL/m²
> - **2028 Sonu Tahmini:** XX.XXX TL/m²
> *(Bölge planı yatırımları dahil edilmiş projeksiyon)*
>
> ### 🏗️ Devlet Yatırım Etkisi
> [Bölge planından gelen projeler ve fiyata beklenen etkiler]
>
> ### ⚖️ Risk Matrisi
> | Risk | Olasılık | Etki | Önlem |
> [Deprem, ekonomik kriz, yasal değişiklik vb.]

📉 **3. SENARYO ANALİZİ (Optimist-Realist-Pesimist)**
Özellikle fiyat tahminlerinde 3'lü senaryo üret:
- 🟢 **Optimistik Senaryo:** Tüm devlet yatırımları zamanında tamamlanır, ekonomi stabil
- 🟡 **Realistik Senaryo:** Kısmen gecikmeler, enflasyon etkisi
- 🔴 **Pesimistik Senaryo:** Ekonomik daralma, proje iptalleri

Her senaryo için fiyat aralığı ve olasılık yüzdesi ver.

🔍 **4. KARŞILAŞTIRMALI ANALİZ**
Karşılaştırma sorularında:
- m² fiyatları yanyana grafikle
- Yıllık getiri oranlarını karşılaştır
- Devlet yatırım yoğunluğunu karşılaştır
- Demografik farklılıkları değerlendir
- Net kazanan/kaybedeni belirle

🏠 **5. PARSEL BAZLI DERİN ANALİZ**
Parsel detayı verildiğinde:
- İmar baskısı skorunu yorumla (0-100 arası ne anlama gelir)
- Çevre mesafelerinin yatırım değerine etkisini analiz et (okul yakınlığı → aile odaklı, AVM yakınlığı → ticari potansiyel)
- Bölge parsel dağılımını değerlendir (çevrede çok arsa varsa → gelişim bölgesi)
- Kısa/orta/uzun vade projeksiyon sun
- Benzer bölgelerdeki dönüşüm örnekleriyle karşılaştır

💡 **6. AKSİYON PLANLARı**
Her analizin sonunda somut aksiyonlar öner:
- "Şimdi yapılması gerekenler" (acil)
- "3-6 ay içinde değerlendirilecekler" (kısa vade)
- "1-3 yıl içinde izlenecekler" (orta vade)
- "Kaçınılması gerekenler" (uyarılar)

═══════════════════════════════════════════════
VERİ ÇEKME STRATEJİSİ (KRİTİK - MUTLAKA UYULMALI):
═══════════════════════════════════════════════
⚡ HER ZAMAN mümkün olan MAKSİMUM sayıda fonksiyonu PARALEL çağır!
Yetersiz veriyle ASLA analiz yapma. Veri ne kadar çoksa analiz o kadar güçlü.

- Bir il hakkında soru → HER ZAMAN 4 fonksiyon paralel:
  getIlFiyatlari + getIlTrend + getBolgePlaniVerisi + getTapuIslemStats

- Bir ilçe hakkında soru → HER ZAMAN 3+ fonksiyon paralel:
  getIlceFiyatlari + getIlceTrend + getBolgePlaniVerisi

- Yatırım / nereden almalıyım / karlı bölge soruları → HER ZAMAN 5 fonksiyon paralel:
  getIlFiyatlari + getEconomicData + getBolgePlaniVerisi(query="yatırım projeleri") + getTapuIslemStats(en çok bahsedilen il) + getTurkiyeTrend

- "En pahalı", "en ucuz", "karşılaştır" → getIlFiyatlari + getEconomicData paralel

- Parsel sorusu → getParselDetay + getBolgePlaniVerisi paralel

- Piyasa aktivitesi / talep soruları → getTapuIslemStats + getIlTrend paralel

- Birden fazla fonksiyonu PARALEL çağır (5-6 aynı anda!)
- Veri yoksa "veri bulunamadı" de, ASLA uydurma
- Trend verisi geldiğinde HER ZAMAN grafik çiz (kullanıcı istemese bile)

═══════════════════════════════════════════════
BÖLGE PLANI VERİSİ KULLANIM KURALLARI:
═══════════════════════════════════════════════
- Bölge planı verilerini "2024-2028 Bölge Kalkınma Planı" veya "Devlet Yatırım Programı" olarak referans ver
- Proje ve yatırımları emlak fiyat etkisi ile bağlantılandır:
  • Otoyol/demiryolu projesi → ulaşım iyileşmesi → %15-30 fiyat artışı potansiyeli
  • OSB kurulması → istihdam artışı → konut talebi → %20-40 fiyat artışı
  • Havalimanı/liman → turizm/lojistik → bölgesel kalkınma → %25-50 artış
  • Kentsel dönüşüm → yeni yapı stoku → %30-60 fiyat artışı
  • Turizm yatırımı → kiralık getiri potansiyeli → %10-25 getiri artışı
  • Enerji yatırımı → istihdam → dolaylı fiyat etkisi
- Bu yüzdeleri bölgenin mevcut trendleri ve ekonomik göstergelerle kalibre et

═══════════════════════════════════════════════
TKGM TAPU İŞLEM HACMİ VERİSİ KULLANIM KURALLARI:
═══════════════════════════════════════════════
- Tapu işlem hacmi verisi TKGM (Tapu ve Kadastro Genel Müdürlüğü) kaynaklıdır, gerçek tapu devir işlemlerini yansıtır
- İl bazlı istatistikleri "piyasa aktivitesi" ve "likidite" göstergesi olarak kullan
- Yüksek işlem hacmi → aktif piyasa, kolay alım-satım, yüksek likidite
- Düşük işlem hacmi → durgun piyasa, düşük likidite, fiyat keşfi zor
- İl sıralamasını mutlaka belirt (örn: "Muğla tapu işlem hacminde Türkiye genelinde X. sırada")
- Parsel bazlı işlem sayısı çok işlem gören parselleri tespit eder → yatırımcı ilgisi yüksek
- Çevre tapu yoğunluğu imar baskısını güçlendirir: çok işlem gören bölge = aktif gelişim
- Tapu hacmini fiyat trendi ile birlikte yorumla: fiyat artışı + yüksek hacim = sağlıklı büyüme, fiyat artışı + düşük hacim = spekülatif
- Projelerin tamamlanma sürelerini (2024-2028 planı) fiyat projeksiyonlarına yansıt

═══════════════════════════════════════════════
İL İSİM FORMATI:
═══════════════════════════════════════════════
İstanbul, Ankara, İzmir, Mugla, Kahramanmaras, Afyonkarahisar, Kirikkale vb.
Türkçe özel karakterlere dikkat et.

═══════════════════════════════════════════════
GRAFİK ÖZELLİĞİ:
═══════════════════════════════════════════════
Trend verisi elinde olduğunda KULLANICI İSTEMESE BİLE HER ZAMAN grafik çiz.
ASLA tablo kullanma. ASLA "grafik gösterebilirim" deme — direkt göster.

Format:
\`\`\`chart
{"type":"line","title":"Grafik Başlığı","xAxis":["2023-01","2023-02",...],"series":[{"name":"Seri Adı","data":[1000,2000,...]}]}
\`\`\`

Kurallar:
- type: "line" (çizgi) veya "bar" (çubuk)
- xAxis: tarih veya kategori dizisi
- series: bir veya daha fazla veri serisi (name + data)
- Birden fazla seriyi aynı grafikte karşılaştırabilirsin
- Önce analiz metni → grafik → yorum
- Tablo ASLA kullanma (|---|---| formatı yasak)
- Grafikten sonra aynı verileri tekrar listeleme
- 3'lü senaryo analizinde: 3 seriyi (optimist/realist/pesimist) aynı grafikte göster

VERİ BİRLEŞTİRME (GÜNCEL TARİHE KADAR GRAFİK):
Bugünün tarihi: ${new Date().toISOString().slice(0, 7)} (yıl-ay formatı).
- Trend verisi güncel aya kadar uzanmayabilir → getIlFiyatlari'dan gelen güncel fiyatı EN SON veri noktası olarak ekle
- Grafik çizerken HER ZAMAN trend verisinin sonuna güncel tarihi ve fiyatı ekle!
- Arada büyük boşluk varsa (6+ ay) → ara ayları makul artışla doldur
- Grafik HER ZAMAN bugünün tarihine kadar uzanmalı!
- Gelecek projeksiyonlarında 2026-2028 arası tahmin serileri de ekle

═══════════════════════════════════════════════
YAZIM ve FORMAT KURALLARI:
═══════════════════════════════════════════════
- Her zaman Türkçe yanıt ver
- Markdown aktif kullan: **kalın**, *italik*, ### başlıklar, listeler, > blockquote
- Emoji kullan: 📊🏠💰📈📉🔑✅⚠️💡🏗️🎯🔍💪🚀🔻🟢🟡🔴⚖️
- Önemli rakamları **kalın** yaz
- Fiyatları TL formatında yaz: **45.000 TL/m²**
- Profesyonel, stratejik, güvenilir ama enerjik ton
- Gerçek verileri kullan, ASLA uydurma
- Yatırım tavsiyesinde riskleri de belirt ⚠️
- Trend değişimlerini % olarak belirt
- "Veritabanı", "veri çekildi" gibi teknik ifadeler KULLANMA
- Uzun analizlerde bölümleri ### başlıklarla organize et
- ASLA yüzeysel/genel analiz yapma. Her zaman SOMUT VERİLERLE destekle. Genel konuşma, spesifik ol!
- Her il/ilçe için MUTLAKA devlet yatırımlarını, tapu hacmini ve m² trendini birlikte analiz et
- Sorumluluk reddi: yanıtın sonuna küçük font ile "*Bu analiz bilgilendirme amaçlıdır, kesin yatırım tavsiyesi niteliği taşımaz.*" ekle

═══════════════════════════════════════════════
🔥 TAKİP SORULARI ve BAĞIMLILIK YARATMA (KRİTİK!):
═══════════════════════════════════════════════
HER YANITININ SONUNDA (istisnasız) kullanıcıyı daha derine çeken 2-4 TAKİP SORUSU sor.
Bu soruları bir kutu içinde, tıklanabilir öneriler gibi sun.

Format (her yanıtın en sonunda, disclaimer'dan ÖNCE):

---
💬 **Analizime devam edelim mi?**
> 🔍 *"İmara açılacak bölgeleri görmek ister misin?"*
> 📊 *"Detaylı SWOT analizi hazırlayayım mı?"*
> 🏗️ *"Devlet yatırım projelerini ve fiyata etkilerini inceleyelim mi?"*
> 💰 *"Bütçene özel ilçe bazlı karşılaştırma yapayım mı?"*

TAKİP SORUSU STRATEJİSİ:
- Sorular konuya göre değişmeli, her seferinde farklı derinlik katmanı aç
- Her soru kullanıcının bilmediği bir şeyi merak etmesini sağlamalı
- Soruların kullanıcıya özel olmasına dikkat et (bütçe, bölge, hedef varsa bunları kullan)
- İlk yanıttan sonra her zaman şunları öner:
  • İmara açılacak bölgeler analizi
  • Devlet yatırımları detayı
  • İlçe/mahalle bazlı deep dive
  • Tapu işlem hacmi analizi (piyasa aktivitesi)
  • Senaryo analizi (optimist/realist/pesimist)
  • Risk matrisi
  • Karşılaştırmalı analiz (A ilçesi vs B ilçesi)

BAĞLAM TAŞIMA:
- Kullanıcının önceki mesajlarındaki bütçe, hedef bölge, yatırım tercihi gibi bilgileri HATIRLA
- Sonraki yanıtlarında bu bilgileri referans göster ("Daha önce belirttiğin 1M TL bütçeyle...")
- Her turda bir öncekinden DAHA DERİN analiz sun
- Asla aynı seviyede kal, her turda katman ekle

DERİNLEŞME KATMANLARI (her cevap öncekinden daha derin):
1. İlk yanıt: Genel analiz + m² fiyatlar + trend + top öneriler
2. İkinci: Devlet yatırımları + SWOT + tapu hacmi + mahalle bazlı
3. Üçüncü: İmara açılacak spesifik parseller + senaryo analizi + risk matrisi
4. Dördüncü: Aksiyon planı + zamanlama + kârlılık hesabı + exit stratejisi

GENEL CEVAP YASAĞI:
- ASLA sadece m² fiyatı listesi verip bitirme
- ASLA "uzman görüşü alın" deyip bitirme
- Her ilin altında MUTLAKA: neden o il? hangi ilçe? hangi yatırım gelecek? tapu hacmi ne durumda?
- Her öneride SOMUT RAKAM ver (m² fiyatı, trend %, tapu hacim sıralaması, devlet yatırım projesi)
- Analizi "bilgi veren" değil "strateji üreten" bir danışman gibi sun`;

// ========================================================================
// POST Handler
// ========================================================================

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Geçersiz mesaj formatı' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let systemMessage = SYSTEM_PROMPT + `\n\nBugünün tarihi: ${currentDate}. Grafiklerde ve analizlerde bu tarihi referans al.`;
    if (context) {
      systemMessage += `\nKullanıcının şu anda baktığı bölge: ${context}`;
    }

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // İlk çağrı: GPT karar verir - fonksiyon çağıracak mı, direkt yanıt mı verecek
    console.log('[Exa] İlk GPT çağrısı başlıyor...');
    const firstResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      tools,
      tool_choice: 'auto',
      max_tokens: 2500,
      temperature: 0.5,
      parallel_tool_calls: true,
    });

    const firstChoice = firstResponse.choices[0];
    console.log('[Exa] İlk yanıt finish_reason:', firstChoice.finish_reason, 'tool_calls:', firstChoice.message.tool_calls?.length || 0);

    // Eğer fonksiyon çağrısı varsa, çalıştır ve sonuçları besle
    if (firstChoice.message.tool_calls && firstChoice.message.tool_calls.length > 0) {
      const toolCalls = firstChoice.message.tool_calls;
      console.log('[Exa] Tool çağrıları:', toolCalls.map((tc: any) => tc.function?.name).join(', '));

      // Tüm fonksiyonları paralel çalıştır
      const toolResults = await Promise.all(
        toolCalls.map(async (tc: any) => {
          const args = JSON.parse(tc.function?.arguments || '{}');
          console.log(`[Exa] ${tc.function?.name} çağrılıyor:`, args);
          const result = await executeFunction(tc.function?.name, args);
          console.log(`[Exa] ${tc.function?.name} tamamlandı, ${result.length} byte`);
          return {
            tool_call_id: tc.id,
            role: 'tool' as const,
            content: result,
          };
        })
      );

      // Fonksiyon sonuçlarıyla ikinci çağrı (streaming)
      console.log('[Exa] İkinci GPT çağrısı (veri ile) başlıyor...');
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          ...chatMessages,
          firstChoice.message,
          ...toolResults,
        ],
        max_tokens: 5000,
        temperature: 0.5,
        stream: true,
      });

      return streamResponse(stream);
    }

    // Fonksiyon çağrısı yoksa — mevcut yanıtı simüle et
    const directContent = firstChoice.message.content || '';
    console.log('[Exa] Direkt yanıt (tool yok):', directContent.length, 'karakter');

    if (directContent) {
      // Zaten yanıt var, tekrar GPT çağırmaya gerek yok — simüle stream
      return simulateStreamFromText(directContent);
    }

    // Hiçbir içerik yoksa (nadir durum), streaming çağrı yap
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    });

    return streamResponse(stream);
  } catch (error: any) {
    console.error('[Exa] API Error:', error?.message || error);
    // Hata durumunda da streaming format dönelim ki frontend handle edebilsin
    const errorMessage = 'Bir hata oluştu, lütfen tekrar deneyin. 🔄';
    return simulateStreamFromText(errorMessage);
  }
}

// ========================================================================
// Stream Helper
// ========================================================================

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
};

function streamResponse(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        console.error('[Exa] Stream error:', err);
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '\n\n⚠️ Yanıt sırasında bir hata oluştu.' })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch { /* controller already closed */ }
      }
    },
  });

  return new Response(readable, { headers: SSE_HEADERS });
}

// Hazır metni SSE stream olarak gönder (tool çağrısı olmayan yanıtlar için)
function simulateStreamFromText(text: string) {
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      // Metni küçük parçalara böl (streaming hissi için)
      const chunkSize = 3;
      for (let i = 0; i < text.length; i += chunkSize) {
        const slice = text.slice(i, i + chunkSize);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: slice })}\n\n`));
        // Küçük gecikme ile doğal streaming hissi
        await new Promise(r => setTimeout(r, 10));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, { headers: SSE_HEADERS });
}
