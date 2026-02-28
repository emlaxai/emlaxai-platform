import { proxyRoute } from '@/lib/api-handler';

export const GET = proxyRoute(
  '/api/v1/turkiye-trend',
  { ay_sayisi: 'ay_sayisi', kategori: 'kategori' },
  1800
);
