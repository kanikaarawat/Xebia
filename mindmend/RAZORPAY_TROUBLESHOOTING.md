# Razorpay Payment Troubleshooting Guide

## Common Payment Issues & Solutions

### 1. International Card Not Supported Error

**Error:** `BAD_REQUEST_ERROR: international_transaction_not_allowed`

**Cause:** Razorpay for Indian businesses only supports Indian bank cards and UPI payments.

**Solutions:**
- ✅ **Use UPI Payment** (Recommended)
  - Download Google Pay, PhonePe, or any UPI app
  - Works with international cards too!
  - Scan QR code or enter UPI ID when prompted
- ✅ **Use Indian Bank Card**
  - Only Indian bank-issued cards work
  - International cards are blocked by Razorpay
- ✅ **Contact Support for Alternatives**
  - PayPal integration
  - Bank transfer options
  - Other international payment methods

### 2. Payment Method Not Found Error

**Error:** `No appropriate payment method found`

**Cause:** Razorpay account configuration issues or unsupported payment methods.

**Solutions:**
- ✅ **Enable UPI in Razorpay Dashboard**
  - Go to Razorpay Dashboard → Settings → Payment Methods
  - Enable UPI, Cards, Net Banking
- ✅ **Use UPI Payment** (Most Reliable)
  - Works globally with any UPI app
  - Google Pay, PhonePe, Paytm, etc.
- ✅ **Check Account Configuration**
  - Verify Razorpay account is properly set up
  - Contact Razorpay support if needed

### 3. Payment Gateway Loading Issues

**Error:** `Failed to load Razorpay payment gateway`

**Solutions:**
- ✅ **Refresh the page**
- ✅ **Check internet connection**
- ✅ **Try different browser**
- ✅ **Clear browser cache**

### 4. Payment Verification Failures

**Error:** `Invalid payment signature`

**Solutions:**
- ✅ **Check environment variables**
  - Verify `RAZORPAY_KEY_SECRET` is correct
  - Ensure keys are from the right environment (test/live)
- ✅ **Contact support if issue persists**

## Payment Method Recommendations

### For Indian Users:
1. **UPI Payment** (Best Option)
   - Google Pay, PhonePe, Paytm
   - Instant, secure, no fees
   - Works with any Indian bank account

2. **Indian Bank Cards**
   - Credit/Debit cards from Indian banks
   - Visa, MasterCard, RuPay

3. **Net Banking**
   - Direct bank transfer
   - Available for major Indian banks

### For International Users:
1. **UPI Payment** (Recommended)
   - Download any UPI app
   - Add international card to UPI app
   - Works globally!

2. **Contact Support**
   - Request PayPal integration
   - Bank transfer options
   - Alternative payment methods

## Testing Payment Integration

### Test Cards (Indian Only):
- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002

### Test UPI IDs:
- **Success:** success@razorpay
- **Failure:** failure@razorpay

## Environment Variables Required

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# For Production
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

## API Endpoints

### Create Order:
```
POST /api/create-razorpay-order
```

### Verify Payment:
```
POST /api/verify-razorpay-payment
```

### Test Pages:
- `/test-payment` - Basic payment test
- `/test-upi` - UPI payment guide
- `/test-payment-simple` - Simple payment test

## Support Resources

### For Users:
- **UPI Guide:** `/test-upi`
- **Contact Support:** `/contact-support`
- **Alternative Payments:** `/dashboard/book-session`

### For Developers:
- **Razorpay Docs:** https://razorpay.com/docs/
- **Test Dashboard:** https://dashboard.razorpay.com/app/test
- **Live Dashboard:** https://dashboard.razorpay.com/app/live

## Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `BAD_REQUEST_ERROR` | Invalid request parameters | Check order details |
| `international_transaction_not_allowed` | International card blocked | Use UPI payment |
| `payment_method_not_found` | Payment method disabled | Enable in dashboard |
| `invalid_signature` | Verification failed | Check API keys |
| `order_not_found` | Order doesn't exist | Create new order |

## Best Practices

1. **Always show UPI as primary option**
2. **Provide clear error messages**
3. **Offer alternative payment methods**
4. **Include support contact information**
5. **Test with both success and failure scenarios**
6. **Handle international users gracefully**

## Monitoring & Logging

### Payment Events to Monitor:
- Order creation success/failure
- Payment initiation
- Payment success/failure
- Verification success/failure
- International card attempts

### Log Format:
```json
{
  "event": "payment_attempt",
  "orderId": "order_xxx",
  "paymentMethod": "card/upi/netbanking",
  "amount": 1000,
  "currency": "INR",
  "userAgent": "...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Security Considerations

1. **Never expose API secrets in frontend**
2. **Always verify payment signatures**
3. **Use HTTPS in production**
4. **Validate all input parameters**
5. **Log security events**
6. **Handle errors gracefully**

## Performance Optimization

1. **Lazy load Razorpay script**
2. **Cache order creation responses**
3. **Use webhooks for real-time updates**
4. **Implement retry logic for failures**
5. **Optimize payment flow UX**

---

**Need Help?** Contact our support team or visit `/contact-support` for assistance. 