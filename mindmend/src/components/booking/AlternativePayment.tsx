"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AlternativePaymentProps {
  sessionId: string
  userId: string
  amount: number
  therapistName?: string
  sessionDate?: string
  onPaymentSuccess?: (paymentId: string) => void
  onPaymentFailure?: (error: string) => void
}

export default function AlternativePayment({
  sessionId,
  userId,
  amount,
  therapistName = 'Therapist',
  sessionDate,
  onPaymentSuccess,
  onPaymentFailure
}: AlternativePaymentProps) {
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: '',
    message: ''
  })
  const { toast } = useToast()

  const formatAmount = (amountInPaise: number) => {
    return `₹${(amountInPaise / 100).toFixed(2)}`
  }

  const handleAlternativePayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/alternative-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          amount: formatAmount(amount),
          paymentMethod: formData.paymentMethod,
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
          title: "Payment Request Sent",
          description: data.message,
        })
        onPaymentSuccess?.(data.reference)
      } else {
        throw new Error(data.error || 'Failed to send payment request')
      }
    } catch (error: unknown) {
      console.error('Alternative payment error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send payment request",
        variant: "destructive",
      })
      onPaymentFailure?.(error instanceof Error ? error.message : "Failed to send payment request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <CreditCard className="w-5 h-5" />
            Alternative Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-purple-200">
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
              onClick={() => setShowForm(true)}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Mail className="mr-2 h-4 w-4" />
              Request Alternative Payment
            </Button>
          </div>

          <div className="text-xs text-slate-500 text-center">
            <p>💳 We'll contact you with payment options</p>
            <p>📞 PayPal, bank transfer, or manual payment</p>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Payment Request Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="alt-name">Name *</Label>
              <Input
                id="alt-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="alt-email">Email *</Label>
              <Input
                id="alt-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="alt-phone">Phone</Label>
              <Input
                id="alt-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="alt-payment-method">Preferred Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI (Manual)</SelectItem>
                  <SelectItem value="card">Card Payment (Manual)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alt-message">Additional Notes</Label>
              <Textarea
                id="alt-message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Any specific payment preferences or questions..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAlternativePayment}
                disabled={loading || !formData.name || !formData.email}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Payment Request'
                )}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
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