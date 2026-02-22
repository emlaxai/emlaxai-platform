import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EMLAXAI_API_URL || 'http://34.12.117.124:8000';
const API_KEY = process.env.EMLAXAI_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const il = searchParams.get('il') || 'MANISA';

    const params = new URLSearchParams();
    params.set('il', il);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `${BACKEND_URL}/api/v1/disaster-risk?${params.toString()}`,
      {
        headers: { 'X-API-Key': API_KEY },
        signal: controller.signal,
        cache: 'no-store',
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: 'Backend error' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
