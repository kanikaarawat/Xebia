"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users, 
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
  User,
  StreamTheme,
  ParticipantView,
  StreamVideoParticipant,
} from '@stream-io/video-react-sdk';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useSession } from '@supabase/auth-helpers-react'; // or your auth method
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

interface StreamVideoCallProps {
  appointmentId: string;
  roomName: string;
  userName: string;
  userRole: 'patient' | 'therapist';
  onCallEnd?: () => void;
}

// Stream configuration
const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY || 'mmhfdzb5evj2';

export default function StreamVideoCall({ 
  appointmentId, 
  roomName, 
  userName, 
  userRole, 
  onCallEnd 
}: StreamVideoCallProps) {
  const router = useRouter();
  const session = useSession();
  const userId = session?.user?.id;
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Stream client and call
  useEffect(() => {
    if (!isClient) return;

    const initializeCall = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Fetch appointment details
        console.log('Fetching appointment for ID:', appointmentId);
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single();
        console.log('Supabase appointment fetch:', { data, error });

        if (error || !data) {
          setError('Could not fetch appointment details.');
          setIsLoading(false);
          return;
        }

        // 2. Check if current user is allowed (by ID only)
        if (!userId) {
          setError('You must be logged in to join this call.');
          setIsLoading(false);
          return;
        }
        if (userId !== data.therapist_id && userId !== data.patient_id) {
          setError('You are not authorized to join this call.');
          setIsLoading(false);
          return;
        }

        // Create user object with ID that matches the test token
        // Add session-specific data to prevent duplicate tiles
        const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const user: User = {
          id: 'Satele_Shan', // Match the user ID in the test token
          name: `${userName} (${sessionId.slice(-6)})`, // Add session suffix to name
          image: `https://getstream.io/random_svg/?id=${userName}&name=${userName}`,
        };

        console.log('🔍 Stream - Creating user with ID:', user.id);
        console.log('🔍 Stream - User name:', userName);
        console.log('🔍 Stream - User role:', userRole);

        // Generate token
        const token = await generateStreamToken(user.id);

        // Create Stream client
        const streamClient = new StreamVideoClient({ 
          apiKey: STREAM_API_KEY, 
          user, 
          token 
        });

        // Connect the user first
        await streamClient.connectUser(user, token);

        // Create call
        const streamCall = streamClient.call('default', `mindmend-${appointmentId}`);
        
        // 3. Join (and create if needed)
        await streamCall.join({ create: true });

        // 4. Check current participants in the call
        const participants = Object.values(streamCall.state.participants || {});

        // Helper to check if a user is a therapist or patient
        const isTherapist = (id: string) => id === data.therapist_id;
        const isPatient = (id: string) => id === data.patient_id;

        let therapistPresent = false;
        let patientPresent = false;

        for (const p of participants) {
          if (isTherapist(p.userId)) therapistPresent = true;
          if (isPatient(p.userId)) patientPresent = true;
        }

        // Block if another therapist is present and current user is therapist
        if (isTherapist(userId) && therapistPresent) {
          setError('Another therapist is already in the call.');
          setIsLoading(false);
          return;
        }

        // Block if another patient is present and current user is patient
        if (isPatient(userId) && patientPresent) {
          setError('Another patient is already in the call.');
          setIsLoading(false);
          return;
        }

        setClient(streamClient);
        setCall(streamCall);
        setIsLoading(false);

      } catch (err) {
        console.error('Stream initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize video call');
        setIsLoading(false);
      }
    };

    initializeCall();

    // Cleanup function
    return () => {
      const cleanup = async () => {
        try {
          if (call) {
            // Disable camera and microphone
            if (call.camera.isEnabled) {
              await call.camera.disable();
            }
            if (call.microphone.isEnabled) {
              await call.microphone.disable();
            }
            
            await call.leave();
          }
          
          if (client) {
            await client.disconnectUser();
          }
          
          // Stream SDK handles track cleanup automatically
          
        } catch (error) {
          console.log('Error during cleanup:', error);
        }
      };
      
      cleanup();
    };
  }, [isClient, appointmentId, userName, userRole, userId]);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (call && !isLoading) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [call, isLoading]);

  // Handle page unload to release permissions
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (call) {
        // Disable camera and microphone
        if (call.camera.isEnabled) {
          call.camera.disable();
        }
        if (call.microphone.isEnabled) {
          call.microphone.disable();
        }
        
        // Leave the call
        call.leave();
      }
      
      if (client) {
        client.disconnectUser();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [call, client]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate Stream token - using a working test token for demo
  const generateStreamToken = async (userId: string): Promise<string> => {
    // For demo purposes, using a working test token
    // In production, this should be generated server-side with proper JWT signing
    // Note: This token works for any user ID in demo mode
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL1NhdGVsZV9TaGFuIiwidXNlcl9pZCI6IlNhdGVsZV9TaGFuIiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3NTE3NTQyOTksImV4cCI6MTc1MjM1OTA5OX0.aNMgVHaPkrTPUrWg5sCME3NUiu7Zt2VtELa-5oXqJRc';
  };

  const handleLeaveCall = useCallback(async () => {
    try {
      toast({
        title: "Leaving call...",
        description: "Disabling camera and microphone permissions.",
        duration: 2000,
      });

      // Disable camera and microphone before leaving
      if (call) {
        if (call.camera.isEnabled) {
          await call.camera.disable();
        }
        if (call.microphone.isEnabled) {
          await call.microphone.disable();
        }
        
        // Leave the call
        await call.leave();
      }
      
      // Stream SDK handles track cleanup automatically when leaving
      toast({
        title: "Call ended",
        description: "Camera and microphone access has been disabled.",
        duration: 3000,
      });
      
    } catch (error) {
      console.log('Error during call cleanup:', error);
      toast({
        title: "Error",
        description: "There was an issue leaving the call.",
        variant: "destructive",
        duration: 3000,
      });
    }
    
    onCallEnd?.();
    
    // Redirect based on user role
    if (userRole === 'therapist') {
      router.push('/dashboard/');
    } else {
      router.push('/dashboard/');
    }
  }, [call, onCallEnd, router, userRole]);

  // Show loading state
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {!isClient ? 'Initializing...' : 'Connecting to Video Call'}
            </h3>
            <p className="text-slate-500">
              {!isClient ? 'Setting up video call environment...' : 'Setting up your secure video session...'}
            </p>
            <Button 
              onClick={() => {
                if (userRole === 'therapist') {
                  router.push('/dashboard/therapist');
                } else {
                  router.push('/dashboard/appointments');
                }
              }}
              variant="outline"
              className="mt-4"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Connection Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => {
              if (userRole === 'therapist') {
                router.push('/dashboard/therapist');
              } else {
                router.push('/dashboard/appointments');
              }
            }}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show Stream Video UI
  if (client && call) {
    return (
      <div className="min-h-screen bg-black">
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <StreamTheme>
              <VideoCallUI 
                call={call}
                callDuration={callDuration}
                userRole={userRole}
                onLeaveCall={handleLeaveCall}
              />
            </StreamTheme>
          </StreamCall>
        </StreamVideo>
      </div>
    );
  }

  return null;
}

interface VideoCallUIProps {
  call: any;
  callDuration: number;
  userRole: string;
  onLeaveCall: () => void;
}

function VideoCallUI({ call, callDuration, userRole, onLeaveCall }: VideoCallUIProps) {
  const { useCallCallingState, useLocalParticipant, useRemoteParticipants, useParticipantCount } = useCallStateHooks();
  
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const participantCount = useParticipantCount();
  const [isLeaving, setIsLeaving] = useState(false);

  // Get camera/mic state from call controls
  const isVideoEnabled = call.camera.isEnabled;
  const isAudioEnabled = call.microphone.isEnabled;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Floating status bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Connected</span>
              </div>
              <div className="text-white/70 text-sm">
                {formatDuration(callDuration)}
              </div>
              <div className="text-white/70 text-sm">
                {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                {userRole === "therapist" ? "Therapist" : "Patient"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main video area */}
      <div className="w-full h-full flex items-center justify-center">
        <ParticipantList participants={remoteParticipants} />
      </div>

      {/* Floating local participant */}
      {localParticipant && (
        <div className="absolute top-20 left-4 z-20">
          <div className="w-64 h-36 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
            <ParticipantView participant={localParticipant} />
          </div>
        </div>
      )}

      {/* Floating control panel */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/40 backdrop-blur-lg rounded-full px-6 py-4 flex items-center space-x-4 shadow-2xl border border-white/10">
          <Button
            onClick={() => call.camera.toggle()}
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14 bg-white/20 hover:bg-white/30 border-white/20"
          >
            {isVideoEnabled ? (
              <Video className="h-6 w-6 text-white" />
            ) : (
              <VideoOff className="h-6 w-6 text-white" />
            )}
          </Button>

          <Button
            onClick={() => call.microphone.toggle()}
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14 bg-white/20 hover:bg-white/30 border-white/20"
          >
            {isAudioEnabled ? (
              <Mic className="h-6 w-6 text-white" />
            ) : (
              <MicOff className="h-6 w-6 text-white" />
            )}
          </Button>

          <div className="w-px h-8 bg-white/20"></div>

          <Button
            onClick={async () => {
              setIsLeaving(true);
              await onLeaveCall();
            }}
            variant="destructive"
            size="lg"
            disabled={isLeaving}
            className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 border-red-500 disabled:opacity-50"
          >
            {isLeaving ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <PhoneOff className="h-6 w-6 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ParticipantList({ participants }: { participants: StreamVideoParticipant[] }) {
  console.log('🔍 Stream - Participants:', participants.map(p => ({
    id: p.userId,
    name: p.name,
    sessionId: p.sessionId
  })));

  // Filter to unique participants by userId (keep latest session)
  const uniqueParticipantsByUserId = Array.from(
    new Map(participants.map(p => [p.userId, p])).values()
  );

  console.log('🔍 Stream - Unique participants:', uniqueParticipantsByUserId.map(p => ({
    id: p.userId,
    name: p.name,
    sessionId: p.sessionId
  })));

  if (uniqueParticipantsByUserId.length === 0) {
    return (
      <div className="text-center text-white/70">
        <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>Waiting for other participants to join...</p>
      </div>
    );
  }

  if (uniqueParticipantsByUserId.length === 2) {
    // Two tiles, side by side, centered
    return (
      <div className="flex justify-center items-center h-full gap-12">
        {uniqueParticipantsByUserId.map((participant) => (
          <div key={participant.userId} className="aspect-video rounded-lg overflow-hidden shadow-lg min-w-[340px] min-h-[200px] bg-black flex items-center justify-center">
            <ParticipantView participant={participant} />
          </div>
        ))}
      </div>
    );
  }

  // Default grid for 1 or more than 2
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full max-w-6xl">
      {uniqueParticipantsByUserId.map((participant) => (
        <div key={participant.userId} className="aspect-video rounded-lg overflow-hidden shadow-lg">
          <ParticipantView participant={participant} />
        </div>
      ))}
    </div>
  );
} 