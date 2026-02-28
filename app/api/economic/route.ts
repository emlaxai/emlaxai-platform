import { proxyRoute } from '@/lib/api-handler';

export const GET = proxyRoute('/api/v1/economic-data', undefined, 300);
