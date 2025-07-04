# RazorpayX Setup Guide for MindMend

## Overview
RazorpayX is Razorpay's business banking platform. This guide helps you configure it properly for payment processing in your mental wellness app.

## Prerequisites
- RazorpayX business account
- Valid business documentation
- Indian business entity

## Step 1: RazorpayX Account Setup

### 1.1 Create RazorpayX Account
1. Visit [https://x.razorpay.com/](https://x.razorpay.com/)
2. Sign up with your business credentials
3. Complete KYC verification
4. Wait for account approval (24-48 hours)

### 1.2 Enable Payment Gateway
1. Log into your RazorpayX dashboard
2. Navigate to "Payments" → "Payment Gateway"
3. Enable the following payment methods:
   - **Cards**: Credit/Debit cards
   - **UPI**: Unified Payment Interface
   - **Net Banking**: Internet banking
   - **Wallets**: Digital wallets

### 1.3 Configure Webhook
1. Go to "Settings" → "Webhooks"
2. Add webhook URL: `https://yourdomain.com/api/verify-razorpay-payment`
3. Select events: `payment.captured`, `payment.failed`

## Step 2: Environment Variables

Add these to your `.env.local`:

```env
# RazorpayX Configuration
RAZORPAY_KEY_ID=your_razorpayx_key_id
RAZORPAY_KEY_SECRET=your_razorpayx_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpayx_key_id

# Optional: Test Mode
RAZORPAY_TEST_MODE=true
```

## Step 3: API Configuration

### 3.1 Order Creation
The order creation API is configured for RazorpayX:
- Uses business banking platform settings
- Includes platform-specific notes
- Handles RazorpayX payment methods

### 3.2 Payment Verification
Payment verification works with RazorpayX signatures and webhooks.

## Step 4: Frontend Integration

### 4.1 Payment Component
The `RazorpayPayment` component is optimized for RazorpayX:
- Business banking UI
- RazorpayX-specific configurations
- Better error handling for business accounts

### 4.2 Payment Methods Display
Configured to show:
- Cards (Indian cards only)
- UPI (Google Pay, PhonePe, etc.)
- Net Banking
- Digital Wallets

## Step 5: Testing

### 5.1 Test Cards
Use RazorpayX test cards:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002

### 5.2 Test UPI
- Use any UPI ID: `test@razorpay`

### 5.3 Test Net Banking
- Use any bank selection in test mode

## Step 6: Production Deployment

### 6.1 Switch to Live Mode
1. Update environment variables with live keys
2. Set `RAZORPAY_TEST_MODE=false`
3. Update webhook URLs to production domain

### 6.2 Monitor Payments
1. Use RazorpayX dashboard for payment monitoring
2. Set up alerts for failed payments
3. Monitor webhook delivery

## Troubleshooting

### Common Issues

#### 1. "No appropriate payment method found"
**Cause**: Payment methods not enabled in RazorpayX
**Solution**: 
- Contact RazorpayX support
- Enable UPI, cards, net banking in dashboard
- Wait 24-48 hours for activation

#### 2. International Cards Not Working
**Cause**: RazorpayX restricts international processing
**Solution**:
- Use UPI payments (Google Pay, PhonePe)
- Contact support for alternative methods
- Use Indian bank cards only

#### 3. Payment Gateway Not Loading
**Cause**: Script loading issues
**Solution**:
- Check internet connection
- Clear browser cache
- Try alternative payment methods

### Support Contacts

#### RazorpayX Support
- Email: support@razorpay.com
- Phone: 1800-123-4567
- Live Chat: Available on dashboard

#### MindMend Support
- Email: support@mindmend.com
- For alternative payment arrangements

## Best Practices

### 1. Payment Method Priority
1. **UPI**: Highest success rate for Indian users
2. **Cards**: Good for users with Indian cards
3. **Net Banking**: Alternative for bank users
4. **Wallets**: For users with digital wallets

### 2. Error Handling
- Clear error messages for users
- Alternative payment options
- Support contact information

### 3. User Experience
- Simple payment flow
- Clear pricing display
- Multiple payment options
- Mobile-friendly interface

## Security Considerations

### 1. Webhook Security
- Verify webhook signatures
- Use HTTPS endpoints
- Implement idempotency

### 2. Data Protection
- Don't store payment details
- Use secure environment variables
- Implement proper error logging

### 3. PCI Compliance
- RazorpayX handles PCI compliance
- Don't store card data
- Use RazorpayX hosted pages

## Monitoring and Analytics

### 1. Payment Analytics
- Track success/failure rates
- Monitor payment method usage
- Analyze user behavior

### 2. Error Tracking
- Log payment errors
- Monitor webhook failures
- Track user support requests

### 3. Performance Metrics
- Payment processing time
- Gateway uptime
- User conversion rates

## Updates and Maintenance

### 1. Regular Updates
- Keep RazorpayX SDK updated
- Monitor API changes
- Update webhook handling

### 2. Backup Plans
- Alternative payment providers
- Manual payment processing
- Support escalation procedures

---

**Note**: This setup is specifically for RazorpayX business banking. For regular Razorpay payment gateway, use different configuration settings. 