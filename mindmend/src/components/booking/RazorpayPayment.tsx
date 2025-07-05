"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Smartphone, Building2, Wallet, Globe, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RazorpayPaymentProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPayment({
  orderId,
  amount,
  currency,
  onSuccess,
  onFailure,
  onClose,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInternationalHelp, setShowInternationalHelp] = useState(false);
  const [showUPIGuide, setShowUPIGuide] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay payment gateway loaded successfully');
    };
    script.onerror = () => {
      setError('Failed to load Razorpay payment gateway');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!window.Razorpay) {
      setError('Razorpay payment gateway not loaded. Please refresh and try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentFailed(false);

    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'MindMend',
        description: 'Therapy Session Payment',
        order_id: orderId,
        handler: function (response: any) {
          console.log('Razorpay payment success:', response);
          onSuccess(response);
          toast({
            title: "Payment Successful!",
            description: "Your session has been booked successfully.",
          });
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          platform: 'razorpay_payment_gateway',
          session: 'therapy',
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: function () {
            console.log('Razorpay modal dismissed');
            onClose();
          },
        },
        // Regular Razorpay payment gateway configurations
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay using any bank",
                instruments: [
                  {
                    method: "card"
                  },
                  {
                    method: "netbanking"
                  },
                  {
                    method: "wallet"
                  }
                ]
              },
              upi: {
                name: "UPI",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              }
            },
            sequence: ["block.banks", "block.upi"],
            preferences: {
              show_default_blocks: false
            }
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      console.error('Razorpay payment error:', err);
      setError(err.message || 'Failed to initialize Razorpay payment');
      onFailure(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAlternativePayment = () => {
    onClose();
    // This will trigger the alternative payment flow
  };

  const handleInternationalHelp = () => {
    setShowInternationalHelp(!showInternationalHelp);
  };

  const handleUPIGuide = () => {
    setShowUPIGuide(!showUPIGuide);
  };

  const handleRetryWithUPI = () => {
    setPaymentFailed(false);
    setError(null);
    handlePayment();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Razorpay Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            ₹{(amount / 100).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Therapy Session Payment</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {paymentFailed && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>International Card Not Supported</strong>
              <p className="mt-1 text-sm">Your international card was declined. Please use UPI payment instead.</p>
              <Button 
                onClick={handleRetryWithUPI}
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                Try Again with UPI
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* International Users Notice */}
        <Alert className="bg-blue-50 border-blue-200">
          <Globe className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>International Users:</strong> Razorpay only supports Indian cards and UPI. 
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600 underline"
              onClick={handleInternationalHelp}
            >
              Click here for alternatives
            </Button>
          </AlertDescription>
        </Alert>

        {showInternationalHelp && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Payment Options for International Users
              </h4>
              <div className="text-sm text-orange-700 space-y-2">
                <p><strong>✅ UPI Payment:</strong> Works for everyone! Use Google Pay, PhonePe, or any UPI app</p>
                <p><strong>❌ International Cards:</strong> Not supported by Razorpay</p>
                <p><strong>💳 Indian Cards:</strong> Only Indian bank cards work</p>
                <p><strong>🌍 Alternative:</strong> Contact support for PayPal or bank transfer</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* UPI Guide */}
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>💡 Best Option:</strong> UPI payments work globally! 
            <Button 
              variant="link" 
              className="p-0 h-auto text-green-600 underline"
              onClick={handleUPIGuide}
            >
              Learn how to use UPI
            </Button>
          </AlertDescription>
        </Alert>

        {showUPIGuide && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                How to Use UPI (Works Globally!)
              </h4>
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>Step 1:</strong> Download any UPI app (Google Pay, PhonePe, Paytm)</p>
                <p><strong>Step 2:</strong> Add any Indian bank account or use international cards</p>
                <p><strong>Step 3:</strong> Scan QR code or enter UPI ID when prompted</p>
                <p><strong>Step 4:</strong> Complete payment - works from anywhere in the world!</p>
                <p className="text-xs mt-2">💡 <strong>Pro tip:</strong> Google Pay and PhonePe work with international cards too!</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay with Razorpay
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            <p>Supported: Indian Cards, UPI, Net Banking, Wallets</p>
            <p className="mt-1">Powered by Razorpay Payment Gateway</p>
          </div>

          <div className="border-t pt-4 space-y-2">
            <Button
              variant="outline"
              onClick={handleAlternativePayment}
              className="w-full"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Alternative Payment Methods
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open('/contact-support', '_blank')}
              className="w-full"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Contact Support for Help
            </Button>

            <Button
              variant="outline"
              onClick={() => window.open('/test-upi', '_blank')}
              className="w-full"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Learn About UPI Payments
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center">
          <p>Having trouble with Razorpay?</p>
          <p>Try UPI payment or contact our support team.</p>
        </div>
      </CardContent>
    </Card>
  );
} 