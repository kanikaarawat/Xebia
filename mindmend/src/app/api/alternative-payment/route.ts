import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, amount, sessionDetails, paymentMethod } = await req.json();

    // Here you would typically:
    // 1. Send an email to your support team
    // 2. Create a manual payment record
    // 3. Contact the user for payment details
    
    console.log('Alternative payment request:', { 
      name, 
      email, 
      phone, 
      amount, 
      sessionDetails, 
      paymentMethod 
    });

    // For now, we'll just return a success response
    // In production, you'd integrate with PayPal, Stripe, or manual payment processing

    return NextResponse.json({
      success: true,
      message: 'Alternative payment request received. We will contact you within 2 hours with payment instructions.',
      reference: `ALT-${Date.now()}`,
    });
  } catch (error: unknown) {
    console.error('Alternative payment error:', error);
    return NextResponse.json(
      { error: 'Failed to process alternative payment request' },
      { status: 500 }
    );
  }
} 