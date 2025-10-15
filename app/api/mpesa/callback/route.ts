import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('M-Pesa Callback:', JSON.stringify(body, null, 2));

    // Handle the callback data
    // In production, update booking status in Firestore based on payment result

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: 'Failed' },
      { status: 500 }
    );
  }
}
