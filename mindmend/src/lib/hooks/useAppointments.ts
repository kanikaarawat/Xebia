import { useState, useCallback } from 'react';
import { useUser } from '@supabase/auth-helpers-react';

interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  scheduled_at: string;
  duration: number;
  type: string;
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
  therapist?: {
    id: string;
    specialization: string;
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  };
}

interface AppointmentActions {
  fetchAppointments: (status?: string, limit?: number) => Promise<Appointment[]>;
  cancelAppointment: (appointmentId: string, reason?: string) => Promise<boolean>;
  rescheduleAppointment: (appointmentId: string, newScheduledAt: string, newDuration?: number, newType?: string, notes?: string) => Promise<boolean>;
  getCancellationInfo: (appointmentId: string) => Promise<unknown>;
  markAsCompleted: (appointmentId: string) => Promise<boolean>;
}

export function useAppointments(): {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  actions: AppointmentActions;
} {
  const user = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (status?: string, limit?: number): Promise<Appointment[]> => {
    if (!user) {
      setError('User not authenticated');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ userId: user.id });
      if (status) params.append('status', status);
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/appointments?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointments');
      }

      setAppointments(data.appointments || []);
      return data.appointments || [];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointments';
      setError(errorMessage);
      console.error('Error fetching appointments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const cancelAppointment = useCallback(async (appointmentId: string, reason?: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          reason
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel appointment');
      }

      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled', updated_at: new Date().toISOString() }
            : apt
        )
      );

      console.log('Appointment cancelled successfully:', data);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel appointment';
      setError(errorMessage);
      console.error('Error cancelling appointment:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const rescheduleAppointment = useCallback(async (
    appointmentId: string, 
    newScheduledAt: string, 
    newDuration?: number, 
    newType?: string, 
    notes?: string
  ): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/appointments/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          new_scheduled_at: newScheduledAt,
          new_duration: newDuration,
          new_type: newType,
          notes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reschedule appointment');
      }

      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { 
                ...apt, 
                scheduled_at: newScheduledAt,
                duration: newDuration || apt.duration,
                type: newType || apt.type,
                notes: notes !== undefined ? notes : apt.notes,
                updated_at: new Date().toISOString()
              }
            : apt
        )
      );

      console.log('Appointment rescheduled successfully:', data);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reschedule appointment';
      setError(errorMessage);
      console.error('Error rescheduling appointment:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getCancellationInfo = useCallback(async (appointmentId: string): Promise<unknown> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      const response = await fetch(`/api/appointments/cancel?id=${appointmentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get cancellation info');
      }

      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get cancellation info';
      setError(errorMessage);
      console.error('Error getting cancellation info:', err);
      return null;
    }
  }, [user]);

  const markAsCompleted = useCallback(async (appointmentId: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/appointments/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointment_id: appointmentId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark appointment as completed');
      }
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: 'completed', updated_at: new Date().toISOString() }
            : apt
        )
      );
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark appointment as completed';
      setError(errorMessage);
      console.error('Error marking appointment as completed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    appointments,
    loading,
    error,
    actions: {
      fetchAppointments,
      cancelAppointment,
      rescheduleAppointment,
      getCancellationInfo,
      markAsCompleted
    }
  };
} 