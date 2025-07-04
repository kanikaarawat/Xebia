"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    date: string;
    start_time: string;
    amount: number;
    status: string;
  };
  onCancellationSuccess: () => void;
}

export default function CancellationModal({ 
  isOpen, 
  onClose, 
  appointment, 
  onCancellationSuccess 
}: CancellationModalProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancellationResult, setCancellationResult] = useState<any>(null);

  const sessionDate = new Date(appointment.date + 'T' + appointment.start_time);
  const now = new Date();
  const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refundPercentage = 0;
  let refundReason = '';
  let policyColor = 'text-red-600';
  let policyIcon = <XCircle className="w-5 h-5" />;

  if (hoursUntilSession >= 48) {
    refundPercentage = 80;
    refundReason = 'Cancelled more than 48 hours before session';
    policyColor = 'text-green-600';
    policyIcon = <CheckCircle className="w-5 h-5" />;
  } else if (hoursUntilSession >= 24) {
    refundPercentage = 50;
    refundReason = 'Cancelled between 24-48 hours before session';
    policyColor = 'text-yellow-600';
    policyIcon = <AlertTriangle className="w-5 h-5" />;
  } else {
    refundPercentage = 0;
    refundReason = 'Cancelled less than 24 hours before session - no refund';
    policyColor = 'text-red-600';
    policyIcon = <XCircle className="w-5 h-5" />;
  }

  const refundAmount = Math.round((appointment.amount / 100) * refundPercentage);

  const handleCancellation = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          userId: 'current-user-id', // You'll need to get this from auth context
          reason: reason.trim() || 'User requested cancellation'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel appointment');
      }

      setCancellationResult(result);
      onCancellationSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Cancel Session
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this session? Please review our refund policy below.
          </DialogDescription>
        </DialogHeader>

        {!cancellationResult ? (
          <div className="space-y-4">
            {/* Session Details */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-2">Session Details</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p><strong>Date:</strong> {formatDate(appointment.date)}</p>
                <p><strong>Time:</strong> {formatTime(appointment.start_time)}</p>
                <p><strong>Amount:</strong> ₹{(appointment.amount / 100).toFixed(2)}</p>
                <p><strong>Time until session:</strong> {Math.round(hoursUntilSession)} hours</p>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Refund Policy
              </h3>
              <div className="space-y-2 text-sm">
                <div className={`flex items-center gap-2 ${policyColor}`}>
                  {policyIcon}
                  <span className="font-medium">{refundReason}</span>
                </div>
                <div className="ml-7">
                  <p><strong>Refund Amount:</strong> ₹{refundAmount.toFixed(2)}</p>
                  <p><strong>Refund Percentage:</strong> {refundPercentage}%</p>
                </div>
              </div>
            </div>

            {/* Refund Policy Details */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Our Refund Policy:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• <strong>48+ hours before:</strong> 80% refund</li>
                <li>• <strong>24-48 hours before:</strong> 50% refund</li>
                <li>• <strong>Less than 24 hours:</strong> No refund</li>
              </ul>
            </div>

            {/* Cancellation Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason for cancellation (optional)
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
                className="min-h-[80px]"
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Keep Session
              </Button>
              <Button
                onClick={handleCancellation}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'Cancelling...' : 'Cancel Session'}
              </Button>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Session Cancelled Successfully
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Refund Details</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Original Amount:</strong> ₹{(appointment.amount / 100).toFixed(2)}</p>
                <p><strong>Refund Amount:</strong> ₹{cancellationResult.refundAmount.toFixed(2)}</p>
                <p><strong>Refund Percentage:</strong> {cancellationResult.refundPercentage}%</p>
                <p><strong>Reason:</strong> {cancellationResult.refundReason}</p>
              </div>
            </div>

            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 