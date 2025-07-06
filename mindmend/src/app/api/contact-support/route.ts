import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, country, paymentMethod, message } = body;

    // Validate required fields
    if (!name || !email || !country || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Send email to support team
    // 2. Store in database
    // 3. Send confirmation email to user
    // 4. Create ticket in support system

    // For now, we'll just log the request
    console.log('Contact Support Request:', {
      name,
      email,
      phone,
      country,
      paymentMethod,
      message,
      timestamp: new Date().toISOString(),
      type: 'international_payment_support'
    });

    // Simulate email sending (replace with actual email service)
    const supportEmail = {
      to: 'support@mindmend.com',
      subject: `International Payment Support Request - ${name}`,
      body: `
New international payment support request:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Country: ${country}
Preferred Payment Method: ${paymentMethod}
Message: ${message || 'No additional details provided'}

Timestamp: ${new Date().toISOString()}

Please respond within 24 hours with alternative payment options.
      `
    };

    console.log('Support Email:', supportEmail);

    // You can integrate with services like:
    // - SendGrid for email
    // - Supabase for database storage
    // - Zendesk for ticket creation
    // - Slack for team notifications

    return NextResponse.json({
      success: true,
      message: 'Support request submitted successfully. We\'ll get back to you within 24 hours.',
      ticketId: `SUPPORT-${Date.now()}`
    });

  } catch (error: unknown) {
    console.error('Contact support error:', error);
    return NextResponse.json(
      { error: 'Failed to submit support request. Please email us directly at support@mindmend.com' },
      { status: 500 }
    );
  }
} 