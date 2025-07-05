"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Smartphone, Globe, CreditCard, Download } from 'lucide-react'

export default function TestUPIPage() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null)

  const upiApps = [
    {
      name: 'Google Pay',
      icon: '💳',
      description: 'Works with international cards',
      features: ['International cards supported', 'Easy setup', 'Widely accepted'],
      downloadUrl: 'https://pay.google.com'
    },
    {
      name: 'PhonePe',
      icon: '📱',
      description: 'Popular Indian payment app',
      features: ['Indian bank integration', 'QR code scanning', 'Bill payments'],
      downloadUrl: 'https://phonepe.com'
    },
    {
      name: 'Paytm',
      icon: '🏦',
      description: 'Comprehensive payment solution',
      features: ['Wallet functionality', 'Bank transfers', 'Shopping payments'],
      downloadUrl: 'https://paytm.com'
    },
    {
      name: 'BHIM',
      icon: '🏛️',
      description: 'Official UPI app by NPCI',
      features: ['Government backed', 'Direct bank integration', 'Secure'],
      downloadUrl: 'https://bhimupi.org.in'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">UPI Payment Guide</h1>
          <p className="text-slate-600">Learn how to use UPI payments - works globally!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Why UPI Works Globally
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <strong>International Cards:</strong> Google Pay accepts international cards
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <strong>No Location Restriction:</strong> Works from anywhere in the world
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <strong>Instant Payments:</strong> Real-time transfers
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <strong>Secure:</strong> Government-backed payment system
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                How to Use UPI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">1</Badge>
                  <p><strong>Download:</strong> Any UPI app (Google Pay recommended)</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">2</Badge>
                  <p><strong>Setup:</strong> Add your card (international cards work)</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">3</Badge>
                  <p><strong>Pay:</strong> Scan QR or enter UPI ID when prompted</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">4</Badge>
                  <p><strong>Confirm:</strong> Complete payment - instant confirmation!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600" />
              Recommended UPI Apps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {upiApps.map((app) => (
                <Card 
                  key={app.name}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedApp === app.name ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedApp(app.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{app.icon}</span>
                      <div>
                        <h3 className="font-semibold text-slate-800">{app.name}</h3>
                        <p className="text-sm text-slate-600">{app.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {app.features.map((feature, index) => (
                        <p key={index} className="text-xs text-slate-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {feature}
                        </p>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(app.downloadUrl, '_blank')
                      }}
                    >
                      Download {app.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Alert className="bg-yellow-50 border-yellow-200 mb-6">
          <AlertDescription className="text-yellow-700">
            <strong>💡 Pro Tip:</strong> Google Pay is the best option for international users as it accepts international cards and works globally. PhonePe and Paytm are also good alternatives.
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-4">
          <Button
            onClick={() => window.location.href = '/test-payment'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Try Payment Now
          </Button>
          
          <div className="space-y-2">
            <Button
              onClick={() => window.location.href = '/contact-support'}
              variant="outline"
              className="w-full"
            >
              Need Help? Contact Support
            </Button>
            
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 