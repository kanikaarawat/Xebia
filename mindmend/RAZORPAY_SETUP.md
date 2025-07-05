# Razorpay Payment Gateway Setup Guide for MindMend

## Overview
This guide helps you set up the **regular Razorpay payment gateway** (not RazorpayX) for accepting customer payments in your mental wellness app.

## What You Need

### 1. **Razorpay Payment Gateway Account**
- **NOT** RazorpayX (business banking)
- Regular Razorpay payment gateway account
- Business verification and KYC

### 2. **Account Types**
- **Test Mode**: For development and testing
- **Live Mode**: For production payments

## Step 1: Create Razorpay Payment Gateway Account

### 1.1 Sign Up
1. Visit [https://razorpay.com/](https://razorpay.com/)
2. Click "Get Started" or "Sign Up"
3. Choose "Payment Gateway" (not RazorpayX)
4. Complete business registration

### 1.2 Business Verification
1. Upload business documents
2. Complete KYC verification
3. Wait for approval (24-48 hours)
4. Activate payment methods

### 1.3 Enable Payment Methods
In your Razorpay dashboard:
1. Go to "Settings" → "Payment Methods"
2. Enable:
   - **Cards**: Credit/Debit cards (Indian only)
   - **UPI**: Unified Payment Interface
   - **Net Banking**: Internet banking
   - **Wallets**: Digital wallets

## Step 2: Environment Variables

Add these to your `.env.local`:

```env
# Razorpay Payment Gateway Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Test Mode (set to false for production)
RAZORPAY_TEST_MODE=true
```

## Step 3: API Configuration

### 3.1 Order Creation
The order creation API is configured for regular Razorpay:
- Uses standard payment gateway settings
- Includes platform identification
- Handles all supported payment methods

### 3.2 Payment Verification
Payment verification works with Razorpay signatures and webhooks.

## Step 4: Frontend Integration

### 4.1 Payment Component
The `RazorpayPayment` component is optimized for regular Razorpay:
- Standard payment gateway UI
- Razorpay-specific configurations
- Better error handling for international users

### 4.2 Payment Methods Display
Configured to show:
- Cards (Indian cards only)
- UPI (Google Pay, PhonePe, etc.)
- Net Banking
- Digital Wallets

## Step 5: Testing

### 5.1 Test Cards
Use Razorpay test cards:
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
1. Use Razorpay dashboard for payment monitoring
2. Set up alerts for failed payments
3. Monitor webhook delivery

## International Card Limitations

### Why International Cards Don't Work
1. **RBI Regulations**: Indian payment gateways restricted to Indian cards
2. **Business Location**: Razorpay is an Indian company
3. **Compliance**: International processing requires additional licenses

### Solutions for International Users
1. **UPI Payments**: Work globally with any UPI app
2. **PayPal Integration**: For international payments
3. **Bank Transfers**: Direct bank-to-bank transfers
4. **Alternative Gateways**: Stripe, PayPal, etc.

## Troubleshooting

### Common Issues

#### 1. "No appropriate payment method found"
**Cause**: Payment methods not enabled in Razorpay
**Solution**: 
- Contact Razorpay support
- Enable UPI, cards, net banking in dashboard
- Wait 24-48 hours for activation

#### 2. International Cards Not Working
**Cause**: Razorpay restricts international processing
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

#### Razorpay Support
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
- Razorpay handles PCI compliance
- Don't store card data
- Use Razorpay hosted pages

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

## Alternative Payment Solutions

### For International Users
1. **PayPal Integration**: Global payment acceptance
2. **Stripe**: International card processing
3. **Bank Transfers**: Direct transfers
4. **UPI**: Works with any UPI app globally

### Implementation Options
1. **Multiple Gateways**: Razorpay + PayPal/Stripe
2. **Geographic Routing**: Route based on user location
3. **Manual Processing**: Support team handles international payments

---

**Note**: This setup is for the regular Razorpay payment gateway. RazorpayX is a separate business banking platform and cannot be used for customer payments. 