"use client"

import { useState } from 'react'
import RazorpayPayment from '@/components/booking/RazorpayPayment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard } from 'lucide-react'

// Define a type for Razorpay response
interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  // add other fields if needed
}

export default function TestPaymentPage() {
  const [orderId, setOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const createTestOrder = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50000, // ₹500 in paise
          currency: 'INR',
          sessionId: 'test-session-123',
          userId: 'test-user-456',
          notes: {
            test: true,
            purpose: 'Test payment integration',
            therapistName: 'Test Therapist'
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOrderId(data.order.id)
        toast({
          title: "✅ Test Order Created",
          description: `Order ID: ${data.order.id}`,
        })
      } else {
        throw new Error(data.error || 'Failed to create test order')
      }
    } catch (err: unknown) {
      console.error('Test order creation error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: "❌ Order Creation Failed",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (response: unknown) => {
    const payment = response as RazorpayPaymentResponse;
    toast({
      title: "🎉 Payment Test Successful!",
      description: `Payment ID: ${payment.razorpay_payment_id}`,
    })
  }

  const handlePaymentFailure = (error: unknown) => {
    toast({
      title: "❌ Payment Test Failed",
      description: error instanceof Error ? error.message : 'Payment failed',
      variant: "destructive",
    })
  }

  const handlePaymentClose = () => {
    setOrderId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Test</h1>
          <p className="text-slate-600">Test the Razorpay payment integration</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-slate-800">
              Test Session Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Test Details</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>Amount:</strong> ₹500 (50000 paise)</p>
                <p><strong>Purpose:</strong> Test payment integration</p>
                <p><strong>Environment:</strong> Test Mode</p>
                {orderId && (
                  <p><strong>Order ID:</strong> {orderId}</p>
                )}
              </div>
            </div>

            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-700">
                <strong>Payment Method Tips:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• <strong>UPI:</strong> Use Google Pay, PhonePe, or Paytm</li>
                  <li>• <strong>Net Banking:</strong> Use your bank's net banking</li>
                  <li>• <strong>Cards:</strong> Indian cards only (international not supported)</li>
                  <li>• <strong>Wallets:</strong> Paytm, PhonePe, and other digital wallets</li>
                </ul>
              </AlertDescription>
            </Alert>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {!orderId ? (
              <div className="text-center">
                <Button
                  onClick={createTestOrder}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Test Order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Create Test Order
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <RazorpayPayment
                orderId={orderId}
                amount={50000}
                currency="INR"
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onClose={handlePaymentClose}
              />
            )}

            <div className="text-center space-y-2">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="w-full"
              >
                Back to Dashboard
              </Button>
              
              <Button
                onClick={() => window.location.href = '/test-razorpay'}
                variant="outline"
                className="w-full"
              >
                Test API Only
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 