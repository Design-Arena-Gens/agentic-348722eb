import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Return mock token for demo purposes
  return NextResponse.json({ accessToken: 'demo_access_token' });
}
