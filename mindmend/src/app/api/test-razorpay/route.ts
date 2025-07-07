import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
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
  } catch (error: unknown) {
    console.error('Razorpay test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create test order' 
      },
      { status: 500 }
    );
  }
}
