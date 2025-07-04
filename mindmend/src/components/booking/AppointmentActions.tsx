'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppointments } from '@/lib/hooks/useAppointments';
import { getFreeSlotsFixed as getFreeSlots } from '@/lib/freeSlotsFixed';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import CancellationModal from './CancellationModal';

interface AppointmentActionsProps {
  appointment: {
    id: string;
    scheduled_at: string;
    status: string;
    type: string;
    duration: number;
    therapist_id: string;
    therapist?: {
      profiles: {
        first_name: string;
        last_name: string;
      };
    };
    notes?: string;
  };
  onActionComplete?: () => void;
}

export default function AppointmentActions({ appointment, onActionComplete }: AppointmentActionsProps) {
  const { actions, loading, error } = useAppointments();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{ start_time: string; end_time: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [debugSlots, setDebugSlots] = useState<any>(null);
  const [newType, setNewType] = useState(appointment.type);
  const [newDuration, setNewDuration] = useState(appointment.duration);
  const [newNotes, setNewNotes] = useState(appointment.notes || "");

  // Fetch slots when date changes
  useEffect(() => {
    if (!showRescheduleDialog) return;
    setAvailableSlots([]);
    setSelectedSlot("");
    setRescheduleError(null);
    setDebugSlots(null);
    if (rescheduleDate && newDuration) {
      setFetchingSlots(true);
      getFreeSlots(appointment.therapist_id, rescheduleDate, 30, newDuration)
        .then((result) => {
          setAvailableSlots(result.available);
          setDebugSlots(result);
        })
        .catch((err) => {
          setAvailableSlots([]);
          setDebugSlots({ error: err?.message || String(err) });
        })
        .finally(() => setFetchingSlots(false));
    }
  }, [rescheduleDate, showRescheduleDialog, appointment.therapist_id, newDuration]);

  useEffect(() => {
    if (showRescheduleDialog) {
      setNewType(appointment.type);
      setNewDuration(appointment.duration);
      setNewNotes(appointment.notes || "");
    }
  }, [showRescheduleDialog, appointment.type, appointment.duration, appointment.notes]);

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancellationSuccess = () => {
    setActionSuccess('Appointment cancelled successfully');
    setShowCancelDialog(false);
    onActionComplete?.();
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleRescheduleAppointment = async () => {
    setRescheduleError(null);
    if (!rescheduleDate || !selectedSlot) {
      setRescheduleError("Please select a new date and time slot.");
      return;
    }
    setRescheduleLoading(true);
    try {
      const newDateTime = `${rescheduleDate}T${selectedSlot}:00`;
      const payload = {
        appointment_id: appointment.id,
        new_scheduled_at: new Date(newDateTime).toISOString(),
        new_duration: newDuration,
        new_type: newType,
        notes: newNotes,
      };
      console.log('Reschedule payload:', payload, {
        selectedSlot,
        rescheduleDate,
        newDateTime,
        iso: new Date(newDateTime).toISOString(),
      });
      const res = await fetch("/api/appointments/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setRescheduleError(data.error || "Failed to reschedule appointment.");
      } else {
        setActionSuccess("Appointment rescheduled successfully!");
        setShowRescheduleDialog(false);
        onActionComplete?.();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err: any) {
      setRescheduleError(err.message || "Failed to reschedule appointment.");
    } finally {
      setRescheduleLoading(false);
    }
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

  // Calculate if appointment is within 24 hours
  const now = new Date();
  const scheduledDate = new Date(appointment.scheduled_at);
  const hoursUntilAppointment = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isWithin24Hours = hoursUntilAppointment <= 24 && hoursUntilAppointment > 0;

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
      <div className="flex flex-row flex-wrap gap-2 mt-2 w-full">
        {isUpcoming && (
          <>
            {isWithin24Hours ? (
              <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm text-center">
                You can't cancel or reschedule an appointment within 24 hours of its scheduled time as per our policy.
              </div>
            ) : (
              <>
                <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={loading}
                      className="flex-1 min-w-[100px] max-w-[120px] whitespace-nowrap text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Reschedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
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
                      <div className="space-y-2">
                        <Label htmlFor="reschedule-date">New Date</Label>
                        <input
                          id="reschedule-date"
                          type="date"
                          className="border rounded px-2 py-1 w-full"
                          value={rescheduleDate}
                          onChange={e => setRescheduleDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="session-duration">Session Duration</Label>
                        <Select value={String(newDuration)} onValueChange={val => setNewDuration(Number(val))}>
                          <SelectTrigger id="session-duration" className="w-full bg-white">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {(rescheduleDate && newDuration) && (
                        <div className="space-y-2">
                          {fetchingSlots && <div className="text-sm text-blue-600">Loading available slots...</div>}
                          {rescheduleDate && !fetchingSlots && availableSlots.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {availableSlots.map(slot => (
                                <Button
                                  key={slot.start_time}
                                  variant={selectedSlot === slot.start_time ? "default" : "outline"}
                                  onClick={() => setSelectedSlot(slot.start_time)}
                                  className={selectedSlot === slot.start_time ? "bg-blue-600 text-white" : ""}
                                >
                                  {slot.start_time} - {slot.end_time}
                                </Button>
                              ))}
                            </div>
                          )}
                          {rescheduleDate && !fetchingSlots && availableSlots.length === 0 && (
                            <div className="text-sm text-red-600">No available slots for this date and duration.</div>
                          )}
                        </div>
                      )}
                      <div className="space-y-1">
                        <Label htmlFor="session-type">Session Type</Label>
                        <Select value={newType} onValueChange={setNewType}>
                          <SelectTrigger id="session-type" className="w-full">
                            <SelectValue placeholder="Select session type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="In-Person">In-Person</SelectItem>
                            <SelectItem value="Video Call">Video Call</SelectItem>
                            <SelectItem value="Phone Call">Phone Call</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="session-notes">Additional Notes</Label>
                        <Textarea
                          id="session-notes"
                          className="w-full border rounded px-2 py-1"
                          rows={3}
                          value={newNotes}
                          onChange={e => setNewNotes(e.target.value)}
                          placeholder="Add any notes for your therapist..."
                        />
                      </div>
                      {rescheduleError && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                          {/* Black semi-opaque overlay */}
                          <div className="fixed inset-0 bg-black" style={{ opacity: 0.5 }}></div>
                          {/* White error popup card - solid white, no transparency */}
                          <div className="relative z-10" style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', padding: '2rem', maxWidth: '24rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #e5e7eb' }}>
                            <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                            <div className="text-lg font-semibold text-red-800 mb-2">Reschedule Error</div>
                            <AlertDescription className="text-red-700 text-center mb-4">
                              {rescheduleError}
                            </AlertDescription>
                            <Button variant="outline" onClick={() => setRescheduleError(null)}>
                              Close
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRescheduleDialog(false)} disabled={rescheduleLoading}>
                        Close
                      </Button>
                      <Button 
                        variant="default" 
                        onClick={handleRescheduleAppointment}
                        disabled={rescheduleLoading || !selectedSlot}
                      >
                        {rescheduleLoading ? 'Rescheduling...' : 'Reschedule'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={loading}
                  onClick={handleCancelClick}
                  className="flex-1 min-w-[80px] max-w-[100px] whitespace-nowrap text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>

                <CancellationModal
                  isOpen={showCancelDialog}
                  onClose={() => setShowCancelDialog(false)}
                  appointment={{
                    id: appointment.id,
                    date: new Date(appointment.scheduled_at).toISOString().split('T')[0],
                    start_time: new Date(appointment.scheduled_at).toTimeString().slice(0, 5),
                    amount: 0, // You'll need to get this from the appointment data
                    status: appointment.status
                  }}
                  onCancellationSuccess={handleCancellationSuccess}
                />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
} 