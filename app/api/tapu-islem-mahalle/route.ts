import { proxyRoute } from '@/lib/api-handler';

export const GET = proxyRoute(
  '/api/v1/tapu-islem-mahalle',
  { il: 'il', ilce: 'ilce' },
  600
);
