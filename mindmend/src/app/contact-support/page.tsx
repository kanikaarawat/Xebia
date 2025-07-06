"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Globe, Mail, MessageCircle, CreditCard } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ContactSupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    paymentMethod: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/contact-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        toast({
          title: "Message Sent!",
          description: "We&apos;ll get back to you within 24 hours with payment alternatives.",
        })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or email us directly.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for contacting us. We&apos;ll get back to you within 24 hours with alternative payment options.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p><strong>What happens next:</strong></p>
              <ul className="text-left space-y-1">
                <li>• We&apos;ll review your payment preferences</li>
                <li>• Send you PayPal or bank transfer details</li>
                <li>• Help you complete your session booking</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.history.back()} 
              className="mt-6 w-full"
            >
              Return to Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            International Payment Support
          </h1>
          <p className="text-gray-600">
            We understand RazorpayX doesn&apos;t support international cards. Let us help you with alternative payment methods.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Why This Happens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• RazorpayX is designed for Indian businesses</p>
              <p>• International cards are restricted by RBI regulations</p>
              <p>• Only Indian cards and UPI work with RazorpayX</p>
              <p>• We can arrange PayPal or bank transfers instead</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Alternative Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• <strong>PayPal:</strong> International payments accepted</p>
              <p>• <strong>Bank Transfer:</strong> Direct bank-to-bank transfer</p>
              <p>• <strong>UPI:</strong> Works with any UPI app globally</p>
              <p>• <strong>Indian Cards:</strong> If you have an Indian bank card</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Support for Alternative Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                    placeholder="Your country"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentMethod">Preferred Payment Method *</Label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select payment method</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="upi">UPI (Google Pay, PhonePe)</option>
                  <option value="indian-card">Indian Bank Card</option>
                  <option value="other">Other (specify in message)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="message">Additional Details</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Tell us about your preferred payment method, any specific requirements, or questions about the session..."
                  rows={4}
                />
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Response Time:</strong> We&apos;ll get back to you within 24 hours with payment instructions and session booking details.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need immediate help? Email us at support@mindmend.com</p>
          <p>Or call us at +91-XXXXXXXXXX (India) / +1-XXX-XXX-XXXX (International)</p>
        </div>
      </div>
    </div>
  )
} 