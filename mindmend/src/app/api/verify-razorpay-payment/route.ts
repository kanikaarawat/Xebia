import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      sessionId,
      error_code,
      error_description,
    } = body;

    // Check if this is an error response (payment failed)
    if (error_code || error_description) {
      console.log('Payment failed:', { error_code, error_description, sessionId });
      
      // Handle specific international transaction error
      if (error_code === 'BAD_REQUEST_ERROR' && error_description?.includes('international_transaction_not_allowed')) {
        return NextResponse.json({
          success: false,
          error: 'international_card_not_supported',
          message: 'International cards are not supported by Razorpay. Please use UPI payment instead.',
          suggestion: 'Try UPI payment with Google Pay, PhonePe, or any UPI app',
          fallback: 'contact_support'
        }, { status: 400 });
      }

      // Handle other payment errors
      return NextResponse.json({
        success: false,
        error: error_code || 'payment_failed',
        message: error_description || 'Payment failed. Please try again.',
        suggestion: 'Try UPI payment or contact support for alternative methods'
      }, { status: 400 });
    }

    // Validate required fields for successful payment
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { 
          success: false,
          error: 'missing_fields',
          message: 'Missing required payment verification fields' 
        },
        { status: 400 }
      );
    }

    // Verify the payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    const isAuthentic = signature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({
        success: false,
        error: 'invalid_signature',
        message: 'Invalid payment signature'
      }, { status: 400 });
    }

    // Here you would typically:
    // 1. Update your database with payment success
    // 2. Create appointment record
    // 3. Send confirmation emails
    // 4. Update session status

    console.log('Payment verification successful:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      sessionId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

  } catch (error: unknown) {
    console.error('Payment verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'verification_failed',
      message: 'Failed to verify payment'
    }, { status: 500 });
  }
} 