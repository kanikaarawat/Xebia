'use client';

import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  scheduled_at: string;
  type: string;
  status: string;
}

export default function VideoCallTestPage() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [testAppointmentId, setTestAppointmentId] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchAppointments();
  }, [user, router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user?.id)
        .eq('type', 'Video Call')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        setStatus('Error fetching appointments: ' + error.message);
      } else {
        setAppointments(data || []);
        setStatus(`Found ${data?.length || 0} video call appointments`);
      }
    } catch (err) {
      console.error('Error:', err);
      setStatus('Error: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  const createTestAppointment = async () => {
    try {
      setLoading(true);
      setStatus('Creating test appointment...');

      // Get a therapist
      const { data: therapists } = await supabase
        .from('therapists')
        .select('id')
        .limit(1);

      if (!therapists || therapists.length === 0) {
        setStatus('No therapists found. Please add therapists first.');
        return;
      }

      const therapistId = therapists[0].id;

      // Create test appointment
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user?.id,
          therapist_id: therapistId,
          scheduled_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
          duration: 60,
          type: 'Video Call',
          notes: 'Test video call appointment for debugging',
          status: 'upcoming'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        setStatus('Error creating appointment: ' + error.message);
      } else {
        setStatus('Test appointment created successfully!');
        setTestAppointmentId(appointment.id);
        fetchAppointments();
      }
    } catch (err) {
      console.error('Error:', err);
      setStatus('Error: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  const testVideoCall = (appointmentId: string) => {
    router.push(`/video/${appointmentId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-700">Video Call Authorization Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">Current User</Label>
              <div className="p-3 bg-gray-50 rounded-lg mt-2">
                <p><strong>ID:</strong> {user?.id}</p>
                <p><strong>Email:</strong> {user?.email}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={createTestAppointment}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Creating...' : 'Create Test Appointment'}
              </Button>
              <Button 
                onClick={fetchAppointments}
                disabled={loading}
                variant="outline"
              >
                Refresh Appointments
              </Button>
            </div>

            {status && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700">{status}</p>
              </div>
            )}

            {testAppointmentId && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700">
                  <strong>Test Appointment ID:</strong> {testAppointmentId}
                </p>
                <Button 
                  onClick={() => testVideoCall(testAppointmentId)}
                  className="mt-2 bg-green-600 hover:bg-green-700"
                >
                  Test Video Call
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-blue-700">Your Video Call Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500">No video call appointments found.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <p><strong>ID:</strong> {appointment.id}</p>
                        <p><strong>Type:</strong> {appointment.type}</p>
                        <p><strong>Status:</strong> {appointment.status}</p>
                        <p><strong>Scheduled:</strong> {new Date(appointment.scheduled_at).toLocaleString()}</p>
                      </div>
                      <Button 
                        onClick={() => testVideoCall(appointment.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Test Video Call
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 