"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock } from "lucide-react";
import StreamVideoCall from "@/components/ui/stream-video-call";

interface Appointment {
  id: string;
  type: string;
  scheduled_at: string;
  status: string;
  patient_id: string;
  therapist_id: string;
  therapist?: {
    profiles: {
      first_name: string;
      last_name: string;
    };
  };
  patient?: {
    profiles: {
      first_name: string;
      last_name: string;
    };
  };
}

export default function VideoCallPage() {
  const router = useRouter();
  const params = useParams();
  const user = useUser();
  const supabase = useSupabaseClient();
  
  const appointmentId = params?.appointmentId as string;
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [userRole, setUserRole] = useState<'patient' | 'therapist' | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    if (!user || !appointmentId) {
      router.push('/login');
      return;
    }

    fetchAppointmentDetails();
  }, [user, appointmentId, router]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Video Call - User ID:', user?.id);
      console.log('🔍 Video Call - Appointment ID:', appointmentId);
      
      // Fetch appointment details - use simpler query like appointments list
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      console.log('🔍 Video Call - Appointment Data:', appointmentData);
      console.log('🔍 Video Call - Appointment Error:', appointmentError);

      if (appointmentError || !appointmentData) {
        console.error('❌ Video Call - Appointment not found:', appointmentError);
        setError('Appointment not found');
        return;
      }

      // Check if user is authorized for this appointment
      console.log('🔍 Video Call - Comparing IDs:');
      console.log('  User ID:', user?.id);
      console.log('  Patient ID:', appointmentData.patient_id);
      console.log('  Therapist ID:', appointmentData.therapist_id);
      console.log('  User ID type:', typeof user?.id);
      console.log('  Patient ID type:', typeof appointmentData.patient_id);
      console.log('  Therapist ID type:', typeof appointmentData.therapist_id);
      console.log('  Is Patient?', user?.id === appointmentData.patient_id);
      console.log('  Is Therapist?', user?.id === appointmentData.therapist_id);

      // More robust authorization check
      const isPatient = user?.id && appointmentData.patient_id && user.id === appointmentData.patient_id;
      const isTherapist = user?.id && appointmentData.therapist_id && user.id === appointmentData.therapist_id;

      console.log('🔍 Video Call - Authorization check:');
      console.log('  isPatient:', isPatient);
      console.log('  isTherapist:', isTherapist);

      if (!isPatient && !isTherapist) {
        console.log('❌ Video Call - Authorization failed: User is neither patient nor therapist');
        setError('You are not authorized to join this video call');
        return;
      }

      setAppointment(appointmentData);

      // Determine user role
      let role: 'patient' | 'therapist' | null = null;
      let name = '';

      if (isPatient) {
        role = 'patient';
        // Get patient name from profiles table
        const { data: patientProfile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        console.log('🔍 Video Call - Patient profile:', patientProfile, 'Error:', profileError);
        
        name = `${patientProfile?.first_name || ''} ${patientProfile?.last_name || ''}`.trim();
        if (!name) name = 'Patient';
      } else if (isTherapist) {
        role = 'therapist';
        // Get therapist name from profiles table
        const { data: therapistProfile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        console.log('🔍 Video Call - Therapist profile:', therapistProfile, 'Error:', profileError);
        
        name = `Dr. ${therapistProfile?.first_name || ''} ${therapistProfile?.last_name || ''}`.trim();
        if (!name || name === 'Dr. ') name = 'Therapist';
      }

      console.log('🔍 Video Call - Determined Role:', role);
      console.log('🔍 Video Call - User Name:', name);

      if (!role) {
        console.log('❌ Video Call - No role determined');
        setError('You are not authorized to join this video call');
        return;
      }

      setUserRole(role);
      setUserName(name);

      // TODO: Add time checks later
      // Check if user can join the call
      // const now = new Date();
      // const appointmentTime = new Date(appointmentData.scheduled_at);
      // const timeDiff = appointmentTime.getTime() - now.getTime();
      // const hoursDiff = timeDiff / (1000 * 60 * 60);

      // // Allow joining 15 minutes before and 2 hours after the scheduled time
      // const canJoinNow = hoursDiff >= -2 && hoursDiff <= 0.25;
      // setCanJoin(canJoinNow);
      
      // For now, allow joining anytime
      setCanJoin(true);

      console.log('✅ Video Call - Authorization successful');

    } catch (err) {
      console.error('❌ Video Call - Error fetching appointment:', err);
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleCallEnd = async () => {
    // Optionally mark appointment as completed
    if (appointment && userRole === 'therapist') {
      try {
        await supabase
          .from('appointments')
          .update({ status: 'completed' })
          .eq('id', appointmentId);
      } catch (err) {
        console.error('Error updating appointment status:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading Video Call</h3>
            <p className="text-slate-500">Preparing your secure video session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Access Denied</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard/appointments')}>
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment || !userRole || !canJoin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-700 mb-2">Video Call Not Available</h3>
            <p className="text-yellow-600 mb-4">
              {!canJoin 
                ? "Video calls are only available 15 minutes before and up to 2 hours after the scheduled time."
                : "Unable to join video call at this time."
              }
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <p><strong>Appointment:</strong> {appointment?.type}</p>
              <p><strong>Scheduled:</strong> {appointment?.scheduled_at ? new Date(appointment.scheduled_at).toLocaleString() : 'N/A'}</p>
              <p><strong>Status:</strong> {appointment?.status}</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/appointments')}
              className="mt-4"
            >
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <StreamVideoCall
      appointmentId={appointmentId}
      roomName={appointmentId}
      userName={userName}
      userRole={userRole}
      onCallEnd={handleCallEnd}
    />
  );
} 