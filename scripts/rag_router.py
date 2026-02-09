"""
EmlaXAI API v2 - RAG Search Router
=====================================
Bolge Planlari uzerinde full-text search + il filtreleme.
"""

import logging
from fastapi import APIRouter, Query
from typing import Optional, List
from services.db import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/api/v1', tags=['rag'])

# Il -> bolge kodu mapping
IL_BOLGE = {
    'ISTANBUL': 'TR10',
    'EDIRNE': 'TR21', 'KIRKLARELI': 'TR21', 'TEKIRDAG': 'TR21',
    'BALIKESIR': 'TR22', 'CANAKKALE': 'TR22',
    'IZMIR': 'TR31',
    'AYDIN': 'TR32', 'DENIZLI': 'TR32', 'MUGLA': 'TR32',
    'AFYONKARAHISAR': 'TR33', 'KUTAHYA': 'TR33', 'USAK': 'TR33', 'MANISA': 'TR33',
    'BILECIK': 'TR41', 'BURSA': 'TR41', 'ESKISEHIR': 'TR41',
    'BOLU': 'TR42', 'DUZCE': 'TR42', 'SAKARYA': 'TR42', 'KOCAELI': 'TR42', 'YALOVA': 'TR42',
    'ANKARA': 'TR51',
    'KARAMAN': 'TR52', 'KONYA': 'TR52',
    'ANTALYA': 'TR61', 'BURDUR': 'TR61', 'ISPARTA': 'TR61',
    'ADANA': 'TR62', 'MERSIN': 'TR62',
    'HATAY': 'TR63', 'KAHRAMANMARAS': 'TR63', 'OSMANIYE': 'TR63',
    'AKSARAY': 'TR71', 'KIRIKKALE': 'TR71', 'KIRSEHIR': 'TR71', 'NEVSEHIR': 'TR71', 'NIGDE': 'TR71',
    'KAYSERI': 'TR72', 'SIVAS': 'TR72', 'YOZGAT': 'TR72',
    'BARTIN': 'TR81', 'KARABUK': 'TR81', 'ZONGULDAK': 'TR81',
    'CANKIRI': 'TR82', 'KASTAMONU': 'TR82', 'SINOP': 'TR82',
    'AMASYA': 'TR83', 'CORUM': 'TR83', 'SAMSUN': 'TR83', 'TOKAT': 'TR83',
    'ARTVIN': 'TR90', 'GIRESUN': 'TR90', 'TRABZON': 'TR90', 'RIZE': 'TR90', 'GUMUSHANE': 'TR90', 'ORDU': 'TR90',
    'BAYBURT': 'TRA1', 'ERZINCAN': 'TRA1', 'ERZURUM': 'TRA1',
    'AGRI': 'TRA2', 'ARDAHAN': 'TRA2', 'KARS': 'TRA2', 'IGDIR': 'TRA2',
    'BINGOL': 'TRB1', 'MALATYA': 'TRB1', 'ELAZIG': 'TRB1', 'TUNCELI': 'TRB1',
    'MUS': 'TRB2', 'BITLIS': 'TRB2', 'VAN': 'TRB2', 'HAKKARI': 'TRB2',
    'KILIS': 'TRC1', 'GAZIANTEP': 'TRC1', 'ADIYAMAN': 'TRC1',
    'SANLIURFA': 'TRC2', 'DIYARBAKIR': 'TRC2',
    'MARDIN': 'TRC3', 'BATMAN': 'TRC3', 'SIIRT': 'TRC3', 'SIRNAK': 'TRC3',
}

def normalize_il(il: str) -> str:
    """Turkce il adini normalize et"""
    tr_map = str.maketrans(
        '\u0130\u0131\u00dc\u00fc\u00d6\u00f6\u00c7\u00e7\u015e\u015f\u011e\u011f\u00e2\u00c2',
        'IiUuOoCcSsGgaA')
    return il.upper().translate(tr_map)


@router.get('/rag-search')
def rag_search(
    query: str = Query(..., description='Arama sorgusu'),
    il: Optional[str] = Query(None, description='Il filtresi'),
    konu: Optional[str] = Query(None, description='Konu filtresi (yatirim, proje, osb, ulasim, turizm, tarim, sanayi, enerji, afet, egitim, saglik, cevre, ekonomi, konut)'),
    limit: int = Query(10, ge=1, le=30),
):
    """
    Bolge Planlari uzerinde full-text search.
    - query: serbest metin arama
    - il: il bazli filtreleme (opsiyonel)
    - konu: konu bazli filtreleme (opsiyonel)
    - limit: max sonuc sayisi
    """
    try:
        with get_db() as (conn, cur):
            # Sorgu kelimelerini hazirla (tsquery formatinda)
            words = query.strip().split()
            if not words:
                return {'results': [], 'total': 0}

            # tsquery: kelimeler arasinda OR
            ts_terms = ' | '.join(w for w in words if len(w) > 1)

            # Temel sorgu
            conditions = []
            params = []

            # Full-text search
            conditions.append(
                "to_tsvector('simple', icerik) @@ to_tsquery('simple', %s)"
            )
            params.append(ts_terms)

            # Il filtresi
            bolge_kodu = None
            if il:
                il_norm = normalize_il(il)
                bolge_kodu = IL_BOLGE.get(il_norm)
                if bolge_kodu:
                    conditions.append("bolge_kodu = %s")
                    params.append(bolge_kodu)

            # Konu filtresi
            if konu:
                conditions.append("%s = ANY(konu_tipleri)")
                params.append(konu)

            where_clause = " AND ".join(conditions)

            # Rank'li sorgu
            sql = f"""
                SELECT
                    id, bolge_kodu, iller, sayfa, baslik,
                    icerik, konu_tipleri,
                    ts_rank(to_tsvector('simple', icerik), to_tsquery('simple', %s)) as rank
                FROM rag_chunks
                WHERE {where_clause}
                ORDER BY rank DESC
                LIMIT %s
            """
            params_full = [ts_terms] + params + [limit]
            cur.execute(sql, params_full)
            rows = cur.fetchall()

            results = []
            for row in rows:
                results.append({
                    'id': row['id'],
                    'bolge_kodu': row['bolge_kodu'],
                    'iller': row['iller'],
                    'sayfa': row['sayfa'],
                    'baslik': row['baslik'],
                    'icerik': row['icerik'][:2000],  # Max 2000 karakter
                    'konular': row['konu_tipleri'],
                    'rank': float(row['rank']),
                })

            # Ek: konu bazli istatistik
            stats_sql = """
                SELECT unnest(konu_tipleri) as konu, COUNT(*) as sayi
                FROM rag_chunks
                WHERE bolge_kodu = %s
                GROUP BY konu ORDER BY sayi DESC
            """ if bolge_kodu else """
                SELECT unnest(konu_tipleri) as konu, COUNT(*) as sayi
                FROM rag_chunks
                GROUP BY konu ORDER BY sayi DESC LIMIT 10
            """
            stats_params = [bolge_kodu] if bolge_kodu else []
            cur.execute(stats_sql, stats_params)
            konu_stats = {r['konu']: r['sayi'] for r in cur.fetchall()}

        return {
            'results': results,
            'total': len(results),
            'query': query,
            'il': il,
            'bolge_kodu': bolge_kodu,
            'konu_stats': konu_stats,
        }

    except Exception as e:
        logger.error(f'RAG search error: {e}')
        return {'results': [], 'total': 0, 'error': str(e)}
