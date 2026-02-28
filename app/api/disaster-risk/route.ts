import { proxyRoute } from '@/lib/api-handler';

export const GET = proxyRoute(
  '/api/v1/disaster-risk',
  { il: 'il' },
  3600
);
