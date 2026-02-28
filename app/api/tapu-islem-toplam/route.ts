import { proxyRoute } from '@/lib/api-handler';

export const GET = proxyRoute(
  '/api/v1/tapu-islem-toplam',
  undefined,
  1800
);
