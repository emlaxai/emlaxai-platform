/**
 * EmlaXAI Backend Proxy
 * ========================
 * Server-side only - API Key burada güvenle saklanır.
 * Browser bu dosyayı asla görmez.
 */

const BACKEND_URL = process.env.EMLAXAI_API_URL || 'http://34.7.72.39:8000';
const API_KEY = process.env.EMLAXAI_API_KEY || '';

export async function backendFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${BACKEND_URL}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    cache: 'no-store',
  });

  return response;
}

/**
 * Backend'den JSON çek ve döndür.
 * Hata durumunda uygun HTTP response üretir.
 */
export async function backendJSON<T = any>(path: string): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const response = await backendFetch(path);
    
    if (!response.ok) {
      const errorBody = await response.text();
      return { error: errorBody, status: response.status };
    }
    
    const data = await response.json();
    return { data, status: 200 };
  } catch (err) {
    return { error: 'Backend bağlantı hatası', status: 503 };
  }
}
