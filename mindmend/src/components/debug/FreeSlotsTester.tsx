'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getFreeSlotsFixed as getFreeSlots } from '@/lib/freeSlotsFixed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
}

interface Slot {
  start_time: string;
  end_time: string;
  reason?: string;
}

interface FreeSlotsResult {
  available: Slot[];
  unavailable: Slot[];
}

export default function FreeSlotsTester() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(30);
  const [freeSlots, setFreeSlots] = useState<FreeSlotsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get available therapists
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const { data, error } = await supabase
          .from('therapists')
          .select(`
            id,
            profiles!inner (
              first_name,
              last_name
            )
          `)
          .order('profiles(first_name)');

        if (error) throw error;

        const therapistList = data?.map(t => ({
          id: t.id,
          first_name: (t.profiles as any)?.first_name || '',
          last_name: (t.profiles as any)?.last_name || ''
        })) || [];

        setTherapists(therapistList);
        
        // Auto-select first therapist
        if (therapistList.length > 0 && !selectedTherapist) {
          setSelectedTherapist(therapistList[0].id);
        }
      } catch (err) {
        console.error('Error fetching therapists:', err);
        setError('Failed to load therapists');
      }
    };

    fetchTherapists();
  }, []);

  // Set default date to today
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    }
  }, [selectedDate]);

  const testFreeSlots = async () => {
    if (!selectedTherapist || !selectedDate) {
      setError('Please select a therapist and date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Testing free slots for:', {
        therapist_id: selectedTherapist,
        date: selectedDate,
        sessionDuration
      });

      const result = await getFreeSlots(selectedTherapist, selectedDate, 30, sessionDuration);
      
      console.log('✅ Free slots result:', result);
      setFreeSlots(result);
    } catch (err) {
      console.error('❌ Error testing free slots:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTherapistName = (id: string) => {
    const therapist = therapists.find(t => t.id === id);
    return therapist ? `${therapist.first_name} ${therapist.last_name}` : 'Unknown';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Free Slots Tester</h1>
        <Button onClick={testFreeSlots} disabled={loading || !selectedTherapist || !selectedDate}>
          {loading ? 'Testing...' : 'Test Free Slots'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="therapist">Therapist</Label>
              <Select value={selectedTherapist} onValueChange={setSelectedTherapist}>
                <SelectTrigger>
                  <SelectValue placeholder="Select therapist" />
                </SelectTrigger>
                <SelectContent>
                  {therapists.map((therapist) => (
                    <SelectItem key={therapist.id} value={therapist.id}>
                      {therapist.first_name} {therapist.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="duration">Session Duration (minutes)</Label>
              <Select value={sessionDuration.toString()} onValueChange={(value) => setSessionDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTherapist && selectedDate && (
            <div className="flex gap-4 items-center">
              <Badge variant="secondary">
                Testing: {getTherapistName(selectedTherapist)}
              </Badge>
              <Badge variant="secondary">
                Date: {new Date(selectedDate).toLocaleDateString()}
              </Badge>
              <Badge variant="secondary">
                Duration: {sessionDuration} minutes
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {freeSlots && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Available Slots
                <Badge variant="default" className="bg-green-600">
                  {freeSlots.available.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {freeSlots.available.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No available slots for this date
                </div>
              ) : (
                <div className="space-y-2">
                  {freeSlots.available.map((slot, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded border">
                      <span className="font-medium">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                      <Badge variant="outline" className="bg-green-100">
                        Available
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Unavailable Slots
                <Badge variant="destructive">
                  {freeSlots.unavailable.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {freeSlots.unavailable.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No unavailable slots
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {freeSlots.unavailable.map((slot, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded border">
                      <div>
                        <div className="font-medium">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {slot.reason}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        {slot.reason === 'Insufficient time' ? 'Insufficient' : 'Booked'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {freeSlots && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{freeSlots.available.length}</div>
                <div className="text-sm text-gray-600">Available Slots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{freeSlots.unavailable.length}</div>
                <div className="text-sm text-gray-600">Unavailable Slots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {freeSlots.available.length + freeSlots.unavailable.length}
                </div>
                <div className="text-sm text-gray-600">Total Slots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {freeSlots.available.length > 0 
                    ? Math.round((freeSlots.available.length / (freeSlots.available.length + freeSlots.unavailable.length)) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Availability Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 