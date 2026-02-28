import { NextRequest, NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'iller';
  const il = searchParams.get('il') || '';
  const ilce = searchParams.get('ilce') || '';

  let path = '';

  switch (type) {
    case 'iller':
      path = '/api/v1/locations/iller';
      break;
    case 'ilceler':
      if (!il) return NextResponse.json({ error: 'il parametresi gerekli' }, { status: 400 });
      path = `/api/v1/locations/ilceler/${encodeURIComponent(il)}`;
      break;
    case 'mahalleler':
      if (!il || !ilce) return NextResponse.json({ error: 'il ve ilce parametreleri gerekli' }, { status: 400 });
      path = `/api/v1/locations/mahalleler/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}`;
      break;
    default:
      return NextResponse.json({ error: 'Gecersiz type parametresi' }, { status: 400 });
  }

  const { data, error, status } = await backendJSON(path);

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
