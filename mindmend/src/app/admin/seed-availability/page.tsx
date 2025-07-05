'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface Therapist {
  id: string;
  name: string;
  email: string;
}

const daysOfWeek = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' }
];

export default function SeedAvailabilityPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    const { data } = await supabase
      .from('therapists')
      .select(`
        id,
        profiles(
          first_name,
          last_name,
          email
        )
      `);
    
    if (data) {
      setTherapists(data.map(t => ({
        id: t.id,
        name: `${t.profiles?.[0]?.first_name || ''} ${t.profiles?.[0]?.last_name || ''}`.trim(),
        email: t.profiles?.[0]?.email
      })));
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const seedAvailability = async () => {
    if (selectedDays.length === 0) {
      setStatus('Please select at least one day of the week.');
      return;
    }

    if (!startTime || !endTime) {
      setStatus('Please set start and end times.');
      return;
    }

    setLoading(true);
    setStatus('Setting up availability...');

    try {
      const rowsToInsert = [];

      for (const therapist of therapists) {
        for (const day of selectedDays) {
          rowsToInsert.push({
            therapist_id: therapist.id,
            day_of_week: day,
            start_time: startTime,
            end_time: endTime,
          });
        }
      }

      // Use upsert to avoid duplicates
      const { error: insertError } = await supabase
        .from('therapist_availability')
        .upsert(rowsToInsert, { 
          onConflict: 'therapist_id,day_of_week',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error(insertError);
        setStatus('❌ Failed to set up availability: ' + insertError.message);
      } else {
        setStatus(`✅ Successfully set up availability for ${therapists.length} therapists on ${selectedDays.length} days!`);
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ An error occurred while setting up availability.');
    } finally {
      setLoading(false);
    }
  };

  const clearAvailability = async () => {
    setLoading(true);
    setStatus('Clearing availability...');

    try {
      const { error } = await supabase
        .from('therapist_availability')
        .delete()
        .neq('id', 0); // Delete all records

      if (error) {
        setStatus('❌ Failed to clear availability: ' + error.message);
      } else {
        setStatus('✅ All availability cleared successfully!');
      }
    } catch {
      setStatus('❌ An error occurred while clearing availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-700 font-bold">
              Therapist Availability Setup
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Therapist List */}
            <div>
              <Label className="text-lg font-semibold text-slate-700">Available Therapists</Label>
              <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                {therapists.length > 0 ? (
                  <ul className="space-y-1">
                    {therapists.map((therapist) => (
                      <li key={therapist.id} className="text-sm text-slate-600">
                        • {therapist.name} ({therapist.email})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No therapists found. Please add therapists first.</p>
                )}
              </div>
            </div>

            {/* Days Selection */}
            <div>
              <Label className="text-lg font-semibold text-slate-700">Select Days</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <Label htmlFor={day.value} className="text-sm">{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime" className="text-lg font-semibold text-slate-700">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-lg font-semibold text-slate-700">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={seedAvailability} 
                disabled={loading || therapists.length === 0}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
              >
                {loading ? 'Setting up...' : 'Set Up Availability'}
              </Button>
              <Button 
                onClick={clearAvailability} 
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                Clear All
              </Button>
            </div>

            {/* Status */}
            {status && (
              <div className={`p-3 rounded-lg ${
                status.includes('✅') ? 'bg-green-50 border border-green-200' :
                status.includes('❌') ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm ${
                  status.includes('✅') ? 'text-green-700' :
                  status.includes('❌') ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {status}
                </p>
              </div>
            )}

            {/* Info */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h4 className="font-semibold text-indigo-700 mb-2">How it works:</h4>
              <ul className="text-sm text-indigo-600 space-y-1">
                <li>• Sets availability ranges for each therapist (e.g., 9 AM - 5 PM)</li>
                <li>• The system automatically generates 30-minute time slots</li>
                <li>• Patients can book sessions of 30, 60, 90, or 120 minutes</li>
                <li>• The system prevents double-bookings and ensures sufficient time</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
