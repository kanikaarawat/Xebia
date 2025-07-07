"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Video } from 'lucide-react';
import StreamVideoCall from '@/components/ui/stream-video-call';

export default function StreamTestPage() {
  const [appointmentId, setAppointmentId] = useState('test-appointment-123');
  const [userName, setUserName] = useState('Test User');
  const [userRole, setUserRole] = useState<'patient' | 'therapist'>('patient');
  const [startCall, setStartCall] = useState(false);

  const handleStartCall = () => {
    setStartCall(true);
  };

  const handleCallEnd = () => {
    setStartCall(false);
  };

  if (startCall) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-700 font-bold flex items-center gap-2">
              <Video className="h-6 w-6" />
              Stream Video Test
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Test Configuration</h3>
              <p className="text-blue-700 text-sm">
                This page allows you to test the Stream Video integration with custom parameters.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="appointmentId">Appointment ID</Label>
                <Input
                  id="appointmentId"
                  value={appointmentId}
                  onChange={(e) => setAppointmentId(e.target.value)}
                  placeholder="Enter appointment ID"
                />
              </div>

              <div>
                <Label htmlFor="userName">User Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter user name"
                />
              </div>

              <div>
                <Label>User Role</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={userRole === 'patient' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserRole('patient')}
                  >
                    Patient
                  </Button>
                  <Button
                    variant={userRole === 'therapist' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserRole('therapist')}
                  >
                    Therapist
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Current Settings</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Appointment ID:</strong> {appointmentId}</p>
                <p><strong>User Name:</strong> {userName}</p>
                <p><strong>User Role:</strong> 
                  <Badge variant="secondary" className="ml-2">
                    {userRole === 'therapist' ? 'Therapist' : 'Patient'}
                  </Badge>
                </p>
              </div>
            </div>

            <Button 
              onClick={handleStartCall}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              size="lg"
            >
              <Video className="h-5 w-5 mr-2" />
              Start Test Video Call
            </Button>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Instructions</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Click "Start Test Video Call" to begin</li>
                <li>• Allow camera and microphone permissions</li>
                <li>• Test video and audio controls</li>
                <li>• Open another browser tab to test with multiple participants</li>
                <li>• Use the same appointment ID to join the same call</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 