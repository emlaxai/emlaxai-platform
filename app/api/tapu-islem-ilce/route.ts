import { proxyRoute } from '@/lib/api-handler';

export const GET = proxyRoute(
  '/api/v1/tapu-islem-ilce',
  { il: 'il' },
  600
);
