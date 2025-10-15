import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount, bookingId } = await request.json();

    // Return mock success response for demo
    return NextResponse.json({
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      MerchantRequestID: 'mock-merchant-request-id',
      CheckoutRequestID: 'mock-checkout-request-id',
    });
  } catch (error: any) {
    console.error('STK Push error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
