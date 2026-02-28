import { proxyRoute } from '@/lib/api-handler';

export const GET = proxyRoute(
  '/api/v1/il-fiyatlari',
  { kategori: 'kategori' },
  1800
);
