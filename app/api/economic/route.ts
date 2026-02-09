import { NextResponse } from 'next/server';
import { backendJSON } from '@/lib/backend';

export async function GET() {
  const { data, error, status } = await backendJSON('/api/v1/economic-data');
  
  if (error) {
    return NextResponse.json({ error }, { status });
  }
  
  return NextResponse.json(data);
}
