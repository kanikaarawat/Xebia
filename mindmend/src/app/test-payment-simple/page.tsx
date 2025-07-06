"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle } from 'lucide-react'

export default function TestPaymentSimplePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testOrderCreation = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50000, // ₹500 in paise
          currency: 'INR',
          sessionId: 'test-session-simple',
          userId: 'test-user-simple',
          notes: {
            test: true,
            purpose: 'Simple test payment'
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(JSON.stringify(data, null, 2))
      } else {
        throw new Error(data.error || 'Failed to create order')
      }
    } catch (err: unknown) {
      console.error('Test error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const testPaymentVerification = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/verify-razorpay-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: 'test_order_123',
          razorpay_payment_id: 'test_payment_456',
          razorpay_signature: 'test_signature_789',
          sessionId: 'test-session-simple'
        }),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err: unknown) {
      console.error('Verification test error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Simple Payment Test</h1>
          <p className="text-slate-600">Test Razorpay API without authentication</p>
        </div>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-slate-800">
              API Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={testOrderCreation}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Test Order Creation
                  </>
                )}
              </Button>

              <Button
                onClick={testPaymentVerification}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Test Payment Verification
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">✅ Test Result</h3>
                <pre className="text-sm text-green-700 bg-green-100 p-2 rounded overflow-auto">
                  {result}
                </pre>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Test Information</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>Amount:</strong> ₹500 (50000 paise)</p>
                <p><strong>Currency:</strong> INR</p>
                <p><strong>Environment:</strong> Test Mode</p>
                <p><strong>Purpose:</strong> API testing without auth</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <Button
                onClick={() => window.location.href = '/test-razorpay'}
                variant="outline"
                className="w-full"
              >
                Go to Full Test Page
              </Button>
              
              <Button
                onClick={() => window.location.href = '/test-payment'}
                variant="outline"
                className="w-full"
              >
                Go to Payment Test Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 