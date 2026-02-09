#!/usr/bin/env python3
"""
EmlaXAI RAG - PDF Ingest Pipeline
26 Bolge Plani PDF -> PostgreSQL rag_chunks tablosu
"""
import PyPDF2, psycopg2, glob, os, re
from psycopg2.extras import execute_values

DB = dict(host='localhost', database='emlaxai', user='emlaxai_user',
          password='EmlaXAI2025!Secure', port=5432)

BOLGE_ILLER = {
    'TR10': ['ISTANBUL'], 'TR21': ['EDIRNE','KIRKLARELI','TEKIRDAG'],
    'TR22': ['BALIKESIR','CANAKKALE'], 'TR31': ['IZMIR'],
    'TR32': ['AYDIN','DENIZLI','MUGLA'],
    'TR33': ['AFYONKARAHISAR','KUTAHYA','USAK','MANISA'],
    'TR41': ['BILECIK','BURSA','ESKISEHIR'],
    'TR42': ['BOLU','DUZCE','SAKARYA','KOCAELI','YALOVA'],
    'TR51': ['ANKARA'], 'TR52': ['KARAMAN','KONYA'],
    'TR61': ['ANTALYA','BURDUR','ISPARTA'], 'TR62': ['ADANA','MERSIN'],
    'TR63': ['HATAY','KAHRAMANMARAS','OSMANIYE'],
    'TR71': ['AKSARAY','KIRIKKALE','KIRSEHIR','NEVSEHIR','NIGDE'],
    'TR72': ['KAYSERI','SIVAS','YOZGAT'],
    'TR81': ['BARTIN','KARABUK','ZONGULDAK'],
    'TR82': ['CANKIRI','KASTAMONU','SINOP'],
    'TR83': ['AMASYA','CORUM','SAMSUN','TOKAT'],
    'TR90': ['ARTVIN','GIRESUN','TRABZON','RIZE','GUMUSHANE','ORDU'],
    'TRA1': ['BAYBURT','ERZINCAN','ERZURUM'],
    'TRA2': ['AGRI','ARDAHAN','KARS','IGDIR'],
    'TRB1': ['BINGOL','MALATYA','ELAZIG','TUNCELI'],
    'TRB2': ['MUS','BITLIS','VAN','HAKKARI'],
    'TRC1': ['KILIS','GAZIANTEP','ADIYAMAN'],
    'TRC2': ['SANLIURFA','DIYARBAKIR'],
    'TRC3': ['MARDIN','BATMAN','SIIRT','SIRNAK'],
}

KONU_KW = {
    'yatirim': ['yatirim','butce','milyon','milyar'],
    'proje': ['proje','projesi'],
    'osb': ['osb','organize sanayi'],
    'ulasim': ['ulasim','otoban','otoyol','havalimani','demiryolu','liman','kopru','tunel'],
    'turizm': ['turizm','otel','konaklama','marina','yat limani','tatil'],
    'tarim': ['tarim','sulama','hayvancilik','organik','sera'],
    'sanayi': ['sanayi','imalat','fabrika','uretim','ihracat'],
    'enerji': ['enerji','jeotermal','ruzgar','gunes','biyogaz','elektrik'],
    'afet': ['deprem','sel','taskin','afet','kentsel donusum'],
    'egitim': ['universite','okul','egitim','ar-ge','arastirma'],
    'saglik': ['hastane','saglik','tedavi'],
    'cevre': ['cevre','iklim','yesil donusum','atik','aritma','kuraklik'],
    'ekonomi': ['ihracat','ithalat','gsyh','istihdam','isgucu','issizlik'],
    'konut': ['konut','toki','imar','kentsel','yapi stok'],
}

def norm(t):
    m = str.maketrans(
        '\u0130\u0131\u00dc\u00fc\u00d6\u00f6\u00c7\u00e7\u015e\u015f\u011e\u011f\u00e2\u00c2',
        'IiUuOoCcSsGgaA')
    return t.translate(m).lower()

def topics(tn):
    r = []
    for k, ws in KONU_KW.items():
        for w in ws:
            if w in tn:
                r.append(k)
                break
    return r

def chunk_text(text, mx=1500):
    if not text or len(text.strip()) < 50:
        return []
    ps = re.split(r'\n\s*\n', text)
    cs, cur = [], ''
    for p in ps:
        p = p.strip()
        if not p or len(p) < 20:
            continue
        if len(cur) + len(p) < mx:
            cur += '\n' + p if cur else p
        else:
            if cur and len(cur) > 50:
                cs.append(cur.strip())
            cur = p
    if cur and len(cur) > 50:
        cs.append(cur.strip())
    return cs

def get_bolge(fn):
    m = re.match(r'(TR[A-Z]?\d+)', fn)
    return m.group(1) if m else 'XX'

def main():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()
    cur.execute('DELETE FROM rag_chunks')
    conn.commit()
    cur.close()
    print('Eski veriler temizlendi')

    pdfs = sorted(glob.glob('/data/pdfs/*.pdf'))
    print(f'{len(pdfs)} PDF bulundu\n')
    total = 0

    for pp in pdfs:
        fn = os.path.basename(pp)
        bk = get_bolge(fn)
        iller = BOLGE_ILLER.get(bk, [])
        iller_str = ', '.join(iller)
        print(f'  {bk} ({iller_str})...', end=' ', flush=True)

        try:
            with open(pp, 'rb') as f:
                rdr = PyPDF2.PdfReader(f)
                rows = []
                for pi in range(len(rdr.pages)):
                    txt = rdr.pages[pi].extract_text()
                    if not txt:
                        continue
                    txt = txt.replace('TASLAK', '').strip()
                    for c in chunk_text(txt):
                        tn = norm(c)
                        tp = topics(tn)
                        fl = c.split('\n')[0].strip()[:200]
                        rows.append((bk, iller_str, pi+1, fl, c, '', iller or [], tp or []))

                if rows:
                    cr = conn.cursor()
                    execute_values(
                        cr,
                        """INSERT INTO rag_chunks
                        (bolge_kodu,iller,sayfa,baslik,icerik,anahtar_kelimeler,il_listesi,konu_tipleri)
                        VALUES %s""",
                        rows,
                        template='(%s,%s,%s,%s,%s,%s,%s,%s)')
                    conn.commit()
                    cr.close()

                print(f'{len(rows)} chunk')
                total += len(rows)
        except Exception as e:
            print(f'HATA: {e}')

    print(f'\nTOPLAM: {total} chunk yuklendi!')

    cr = conn.cursor()
    cr.execute("""SELECT bolge_kodu, COUNT(*)
                  FROM rag_chunks GROUP BY bolge_kodu ORDER BY bolge_kodu""")
    print('\nBolge dagilimi:')
    for r in cr.fetchall():
        print(f'  {r[0]}: {r[1]}')

    cr.execute("""SELECT unnest(konu_tipleri) as k, COUNT(*)
                  FROM rag_chunks GROUP BY k ORDER BY count DESC LIMIT 15""")
    print('\nKonu dagilimi:')
    for r in cr.fetchall():
        print(f'  {r[0]}: {r[1]}')

    cr.close()
    conn.close()
    print('\nBitti!')

if __name__ == '__main__':
    main()
