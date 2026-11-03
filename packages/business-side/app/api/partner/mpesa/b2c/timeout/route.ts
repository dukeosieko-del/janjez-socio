import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('M-Pesa B2C timeout:', JSON.stringify(body));
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa B2C timeout error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
