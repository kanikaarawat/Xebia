"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Globe, CreditCard, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface InternationalPaymentProps {
  sessionId: string
  userId: string
  amount: number
  therapistName?: string
  sessionDate?: string
  onPaymentSuccess?: (paymentId: string) => void
  onPaymentFailure?: (error: string) => void
}

export default function InternationalPayment({
  sessionId,
  userId,
  amount,
  therapistName = 'Therapist',
  sessionDate,
  onPaymentSuccess,
  onPaymentFailure
}: InternationalPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const { toast } = useToast()

  const formatAmount = (amountInPaise: number) => {
    return `₹${(amountInPaise / 100).toFixed(2)}`
  }

  const handleUPIPayment = async () => {
    setLoading(true)
    try {
      // Create order for UPI payment
      const orderResponse = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          sessionId,
          userId,
          notes: {
            therapistName,
            sessionDate,
            paymentMethod: 'UPI'
          }
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order')
      }

      // Open Razorpay with UPI focus
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'MindMend',
        description: `Therapy Session with ${therapistName}`,
        order_id: orderData.order.id,
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              }
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        handler: async function (response: unknown) {
          try {
            const verifyResponse = await fetch('/api/verify-razorpay-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                sessionId,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              toast({
                title: "Payment Successful!",
                description: "Your session has been confirmed.",
              })
              onPaymentSuccess?.(response.razorpay_payment_id as string)
            } else {
              throw new Error(verifyData.error || 'Payment verification failed')
            }
          } catch (error: any) {
            console.error('Payment verification error:', error)
            toast({
              title: "Payment Error",
              description: error.message || "Failed to verify payment",
              variant: "destructive",
            })
            onPaymentFailure?.(error.message)
          }
        },
      }

      // @ts-expect-error
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('UPI payment error:', error)
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate UPI payment",
        variant: "destructive",
      })
      onPaymentFailure?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleContactSupport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/contact-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactData.name,
          email: contactData.email,
          message: contactData.message,
          sessionDetails: {
            sessionId,
            therapistName,
            sessionDate,
            amount: formatAmount(amount)
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Support Request Sent",
          description: "We will contact you within 24 hours with alternative payment options.",
        })
        onPaymentSuccess?.('support-request')
      } else {
        throw new Error(data.error || 'Failed to send support request')
      }
    } catch (error: any) {
      console.error('Support request error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to send support request",
        variant: "destructive",
      })
      onPaymentFailure?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Globe className="w-5 h-5" />
            International Payment Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-slate-800 mb-3">Session Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Therapist:</span>
                <span className="font-medium">{therapistName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Session:</span>
                <span className="font-medium">{sessionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Amount:</span>
                <span className="font-medium text-green-600">{formatAmount(amount)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleUPIPayment}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with UPI (Recommended)
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowContactForm(true)}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support for VISA/International Cards
            </Button>
          </div>

          <div className="text-xs text-slate-500 text-center">
            <p>💡 UPI works with Google Pay, PhonePe, or Paytm</p>
            <p>🌍 For VISA/International cards, contact support</p>
          </div>
        </CardContent>
      </Card>

      {showContactForm && (
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">Contact Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={contactData.name}
                onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={contactData.message}
                onChange={(e) => setContactData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="I would like to pay using VISA card or other international payment method..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleContactSupport}
                disabled={loading || !contactData.name || !contactData.email}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </Button>
              <Button
                onClick={() => setShowContactForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 