import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt, notes, sessionId, userId } = await req.json();

    if (!amount || !sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, sessionId, userId' },
        { status: 400 }
      );
    }

    // Generate a short receipt ID (max 40 characters)
    const shortReceipt = receipt || `sess_${Date.now().toString().slice(-8)}`;

    // Create order with regular Razorpay payment gateway
    const order = await razorpay.orders.create({
      amount, // amount in paise (e.g., 50000 = ₹500)
      currency,
      receipt: shortReceipt,
      notes: {
        sessionId,
        userId,
        platform: 'razorpay_payment_gateway', // Regular payment gateway
        ...notes,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error: unknown) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment order' },
      { status: 500 }
    );
  }
} 