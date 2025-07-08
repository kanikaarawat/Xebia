"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Clock, 
  Phone, 
  PhoneOff,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface VideoCall {
  id: string;
  appointment_id: string;
  room_name: string;
  status: 'active' | 'ended' | 'waiting';
  created_at: string;
  ended_at?: string;
  participants: string[];
  therapist_name?: string;
  patient_name?: string;
}

interface Appointment {
  id: string;
  [key: string]: unknown;
}

export default function VideoCallManager() {
  const [videoCalls, setVideoCalls] = useState<VideoCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideoCalls();
    // Set up real-time subscription for video call updates
    const channel = supabase
      .channel('video-calls')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          fetchVideoCalls();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVideoCalls = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments that are currently active (in progress or scheduled for today)
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          end_time,
          status,
          created_at,
          therapist:therapists!inner(name),
          patient:profiles!inner(full_name)
        `)
        .in('status', ['confirmed', 'in_progress'])
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to fetch video calls');
        return;
      }

      // Transform appointments into video call format
      const calls: VideoCall[] = appointments?.map((appointment: Appointment) => ({
        id: appointment.id,
        appointment_id: appointment.id,
        room_name: `mindmend-${appointment.id}`,
        status: appointment.status === 'in_progress' ? 'active' : 'waiting',
        created_at: appointment.created_at as string,
        participants: [
          (appointment.therapist as { name?: string })?.name || 'Unknown Therapist',
          (appointment.patient as { full_name?: string })?.full_name || 'Unknown Patient'
        ],
        therapist_name: (appointment.therapist as { name?: string })?.name,
        patient_name: (appointment.patient as { full_name?: string })?.full_name
      })) || [];

      setVideoCalls(calls);
    } catch (err: unknown) {
      console.error('Error fetching video calls:', err);
      setError('Failed to fetch video calls');
    } finally {
      setLoading(false);
    }
  };

  const joinCall = (roomName: string) => {
    // Open video call in new window/tab
    window.open(`/video/${roomName}`, '_blank');
  };

  const endCall = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error ending call:', error);
        return;
      }

      // Refresh the list
      fetchVideoCalls();
    } catch (err: unknown) {
      console.error('Error ending call:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'waiting':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Waiting</Badge>;
      case 'ended':
        return <Badge className="bg-gray-100 text-gray-800"><PhoneOff className="w-3 h-3 mr-1" />Ended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-slate-600">Loading video calls...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm text-slate-600">Total Calls</p>
                <p className="text-2xl font-bold text-slate-800">{videoCalls.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-slate-600">Active Calls</p>
                <p className="text-2xl font-bold text-slate-800">
                  {videoCalls.filter(call => call.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-slate-600">Waiting</p>
                <p className="text-2xl font-bold text-slate-800">
                  {videoCalls.filter(call => call.status === 'waiting').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Calls List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Video Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {videoCalls.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Video className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No active video calls</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videoCalls.map((call) => (
                <div key={call.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-slate-800">Room: {call.room_name}</h3>
                        {getStatusBadge(call.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div>
                          <p><strong>Therapist:</strong> {call.therapist_name || 'Unknown'}</p>
                          <p><strong>Patient:</strong> {call.patient_name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p><strong>Created:</strong> {new Date(call.created_at).toLocaleString()}</p>
                          <p><strong>Participants:</strong> {call.participants.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => joinCall(call.room_name)}
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                      
                      {call.status === 'active' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => endCall(call.appointment_id)}
                          className="flex items-center"
                        >
                          <PhoneOff className="w-4 h-4 mr-1" />
                          End
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 