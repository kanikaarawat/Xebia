'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppointments } from '@/lib/hooks/useAppointments';

interface AppointmentActionsProps {
  appointment: {
    id: string;
    scheduled_at: string;
    status: string;
    type: string;
    duration: number;
    therapist?: {
      profiles: {
        first_name: string;
        last_name: string;
      };
    };
  };
  onActionComplete?: () => void;
}

export default function AppointmentActions({ appointment, onActionComplete }: AppointmentActionsProps) {
  const { actions, loading, error } = useAppointments();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellationInfo, setCancellationInfo] = useState<any>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleCancelClick = async () => {
    const info = await actions.getCancellationInfo(appointment.id);
    setCancellationInfo(info);
    setShowCancelDialog(true);
  };

  const handleCancelAppointment = async () => {
    const success = await actions.cancelAppointment(appointment.id, cancelReason);
    if (success) {
      setActionSuccess('Appointment cancelled successfully');
      setShowCancelDialog(false);
      setCancelReason('');
      onActionComplete?.();
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleRescheduleAppointment = async () => {
    // For now, we'll just show a message that rescheduling is coming soon
    // In a full implementation, you'd open a date/time picker
    setActionSuccess('Rescheduling feature coming soon!');
    setShowRescheduleDialog(false);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getDurationText = (duration: number) => {
    if (duration === 30) return '30 min';
    if (duration === 60) return '1 hour';
    if (duration === 90) return '1.5 hours';
    if (duration === 120) return '2 hours';
    return `${duration} min`;
  };

  const { date, time } = formatDateTime(appointment.scheduled_at);
  const isUpcoming = appointment.status === 'upcoming';
  const canCancel = cancellationInfo?.can_cancel ?? true;

  return (
    <>
      {/* Success Message */}
      {actionSuccess && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {actionSuccess}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isUpcoming && (
          <>
            <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={loading}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Reschedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reschedule Appointment</DialogTitle>
                  <DialogDescription>
                    Reschedule your session with Dr. {appointment.therapist?.profiles.first_name} {appointment.therapist?.profiles.last_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700">Current Appointment</p>
                    <p className="text-sm text-slate-600">{date} at {time}</p>
                    <p className="text-sm text-slate-600">{appointment.type} • {getDurationText(appointment.duration)}</p>
                  </div>
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Rescheduling feature coming soon!</p>
                    <p className="text-sm text-slate-500 mt-2">
                      You'll be able to select a new date and time from available slots.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={loading || !canCancel}
                  onClick={handleCancelClick}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Appointment</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel your session with Dr. {appointment.therapist?.profiles.first_name} {appointment.therapist?.profiles.last_name}?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700">Appointment Details</p>
                    <p className="text-sm text-slate-600">{date} at {time}</p>
                    <p className="text-sm text-slate-600">{appointment.type} • {getDurationText(appointment.duration)}</p>
                  </div>

                  {cancellationInfo && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">Cancellation Policy</p>
                      <p className="text-sm text-blue-600">{cancellationInfo.cancellation_policy.message}</p>
                      <p className="text-sm text-blue-600 mt-1">
                        {cancellationInfo.hours_until_appointment} hours until appointment
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="cancel-reason">Reason for cancellation (optional)</Label>
                    <Textarea
                      id="cancel-reason"
                      placeholder="Please let us know why you're cancelling..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {!canCancel && cancellationInfo && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        {cancellationInfo.cancellation_policy.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    Keep Appointment
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelAppointment}
                    disabled={loading || !canCancel}
                  >
                    {loading ? 'Cancelling...' : 'Cancel Appointment'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </>
  );
} 