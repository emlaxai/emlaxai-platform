import { NextRequest, NextResponse } from 'next/server';
import { backendJSON } from './backend';
import { rateLimit, type RateLimitConfig } from './rate-limit';

interface ApiHandlerOptions {
  /** Backend path'i oluşturan fonksiyon (searchParams → path) */
  backendPath: (params: URLSearchParams) => string;
  /** Rate limit konfigürasyonu */
  rateLimitConfig?: RateLimitConfig;
  /** Cache-Control header değeri */
  cacheControl?: string;
  /** Feature adı (usage tracking için) */
  feature?: string;
  /** Pro plan gerekli mi */
  requirePro?: boolean;
}

/**
 * Standart API route handler oluşturur.
 * Backend proxy + rate limiting + hata yönetimi + cache header.
 */
export function createApiHandler(options: ApiHandlerOptions) {
  return async function handler(request: NextRequest) {
    try {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

      const url = new URL(request.url);
      const rateLimitKey = `${ip}:${url.pathname}`;

      const rl = rateLimit(rateLimitKey, options.rateLimitConfig);
      if (!rl.allowed) {
        return NextResponse.json(
          { error: 'Çok fazla istek. Lütfen biraz bekleyin.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }

      const backendPath = options.backendPath(url.searchParams);
      const { data, error, status } = await backendJSON(backendPath);

      if (error) {
        return NextResponse.json({ error }, { status });
      }

      const headers: Record<string, string> = {
        'X-RateLimit-Remaining': String(rl.remaining),
      };

      if (options.cacheControl) {
        headers['Cache-Control'] = options.cacheControl;
      }

      return NextResponse.json(data, { headers });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bilinmeyen sunucu hatası';
      console.error(`API Error [${request.url}]:`, message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}

/**
 * Kısa yoldan backend proxy route oluştur.
 * Sadece path ve parametre mapping yeterli.
 */
export function proxyRoute(
  basePath: string,
  paramMap?: Record<string, string>,
  cacheSeconds?: number
) {
  return createApiHandler({
    backendPath: (params) => {
      const mapped = new URLSearchParams();
      if (paramMap) {
        for (const [from, to] of Object.entries(paramMap)) {
          const val = params.get(from);
          if (val) mapped.set(to || from, val);
        }
      } else {
        params.forEach((v, k) => mapped.set(k, v));
      }
      const qs = mapped.toString();
      return qs ? `${basePath}?${qs}` : basePath;
    },
    cacheControl: cacheSeconds
      ? `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`
      : undefined,
  });
}
