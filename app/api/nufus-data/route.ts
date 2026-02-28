import { proxyRoute } from '@/lib/api-handler';

export const GET = proxyRoute('/api/v1/nufus-data', undefined, 600);
