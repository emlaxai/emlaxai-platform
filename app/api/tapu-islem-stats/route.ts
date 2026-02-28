import { proxyRoute } from '@/lib/api-handler';

export const GET = proxyRoute(
  '/api/v1/tapu-islem-stats',
  { il: 'il', parsel_id: 'parsel_id' },
  600
);
