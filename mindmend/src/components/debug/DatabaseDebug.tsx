"use client";

import { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DatabaseDebug() {
  const [debugData, setDebugData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();
  const user = useUser();

  const testDatabase = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testing database connection...');
      console.log('👤 Current user:', user?.id);

      // Test 1: Check if therapist_availability table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('therapist_availability')
        .select('count')
        .limit(1);

      console.log('📊 Table check result:', { tableCheck, tableError });

      // Test 2: Check if user has any availability data
      if (user?.id) {
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('therapist_availability')
          .select('*')
          .eq('therapist_id', user.id);

        console.log('📅 Availability data:', { availabilityData, availabilityError });

        // Test 3: Check if user has any unavailability data
        const { data: unavailabilityData, error: unavailabilityError } = await supabase
          .from('therapist_unavailability')
          .select('*')
          .eq('therapist_id', user.id);

        console.log('🚫 Unavailability data:', { unavailabilityData, unavailabilityError });

        // Test 4: Check if user has any appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq('therapist_id', user.id);

        console.log('📋 Appointments data:', { appointmentsData, appointmentsError });

        setDebugData({
          user: user.id,
          tableExists: !tableError,
          availabilityCount: availabilityData?.length || 0,
          unavailabilityCount: unavailabilityData?.length || 0,
          appointmentsCount: appointmentsData?.length || 0,
          errors: {
            table: tableError,
            availability: availabilityError,
            unavailability: unavailabilityError,
            appointments: appointmentsError
          }
        });
      }
    } catch (error) {
      console.error('❌ Database test error:', error);
      setDebugData({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">Database Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testDatabase} disabled={loading}>
          {loading ? 'Testing...' : 'Test Database Connection'}
        </Button>
        
        {debugData && (
          <div className="space-y-2 text-sm">
            <div><strong>User ID:</strong> {debugData.user}</div>
            <div><strong>Table Exists:</strong> {debugData.tableExists ? '✅' : '❌'}</div>
            <div><strong>Availability Records:</strong> {debugData.availabilityCount}</div>
            <div><strong>Unavailability Records:</strong> {debugData.unavailabilityCount}</div>
            <div><strong>Appointments:</strong> {debugData.appointmentsCount}</div>
            
            {Object.entries(debugData.errors || {}).map(([key, error]) => (
              <div key={key}>
                <strong>{key} Error:</strong> {error ? JSON.stringify(error) : 'None'}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 