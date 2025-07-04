import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    // Create a test order
    const order = await razorpay.orders.create({
      amount: 100, // ₹1 in paise
      currency: 'INR',
      receipt: 'receipt#test',
      notes: {
        test: 'true',
        purpose: 'Razorpay integration test'
      },
    });

    return NextResponse.json({
      success: true,
      order: order,
    });
  } catch (error: any) {
    console.error('Razorpay test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to create test order' 
      },
      { status: 500 }
    );
  }
}
