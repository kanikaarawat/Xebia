'use client';

import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useUser, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnavailabilityDataViewer from '@/components/debug/UnavailabilityDataViewer';
import DatabaseDiagnostic from '@/components/debug/DatabaseDiagnostic';
import UnavailabilityTable from '@/components/debug/UnavailabilityTable';
import FreeSlotsTester from '@/components/debug/FreeSlotsTester';
import { TimeConversionTester } from '@/components/debug/TimeConversionTester';

const supabase = createPagesBrowserClient();

export default function DebugPage() {
  const user = useUser();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [debugInfo, setDebugInfo] = useState<unknown>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebugChecks = async () => {
      const info: unknown = {};

      // Check authentication
      info.auth = {
        user: user ? { id: user.id, email: user.email } : null,
        timestamp: new Date().toISOString()
      };

      // Test basic connection
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        info.connection = { success: !error, error: error?.message };
      } catch (err) {
        info.connection = { success: false, error: err };
      }

      // Check profiles table
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(5);
        info.profiles = { 
          count: data?.length || 0, 
          data: data?.slice(0, 3), 
          error: error?.message 
        };
      } catch (err) {
        info.profiles = { error: err };
      }

      // Check therapists table
      try {
        const { data, error } = await supabase.from('therapists').select('*');
        info.therapists = { 
          count: data?.length || 0, 
          data: data?.slice(0, 3), 
          error: error?.message 
        };
      } catch (err) {
        info.therapists = { error: err };
      }

      // Test the exact query from book session
      try {
        const { data, error } = await supabase
          .from('therapists')
          .select(`
            id,
            specialization,
            license_number,
            profiles!inner(
              first_name,
              last_name,
              avatar_url
            )
          `)
          .order('profiles(first_name)');
        
        info.bookSessionQuery = { 
          count: data?.length || 0, 
          data: data?.slice(0, 2), 
          error: error?.message 
        };
      } catch (err) {
        info.bookSessionQuery = { error: err };
      }

      // Test availability table
      try {
        const { data, error } = await supabase
          .from('therapist_availability')
          .select('*')
          .limit(5);
        
        info.availability = { 
          count: data?.length || 0, 
          data: data?.slice(0, 3), 
          error: error?.message 
        };
      } catch (err) {
        info.availability = { error: err };
      }

        // Test getFreeSlots function
  if (info.therapists?.data?.length > 0) {
    try {
      const testTherapistId = info.therapists.data[0].id;
      const testDate = new Date().toISOString().split('T')[0]; // Today
      const { getFreeSlotsFixed: getFreeSlots } = await import('@/lib/freeSlotsFixed');
      const freeSlots = await getFreeSlots(testTherapistId, testDate);
      
      info.freeSlotsTest = {
        therapist_id: testTherapistId,
        date: testDate,
        available_slots_count: freeSlots.available.length,
        unavailable_slots_count: freeSlots.unavailable.length,
        available_slots: freeSlots.available.slice(0, 3),
        unavailable_slots: freeSlots.unavailable.slice(0, 3)
      };
    } catch (err) {
      info.freeSlotsTest = { error: err };
    }
  }

      setDebugInfo(info);
      setLoading(false);
    };

    runDebugChecks();
  }, [user, supabase]);

  const addTestTherapist = async () => {
    if (!user) return;
    
    try {
      // Update profile to therapist role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'therapist',
          first_name: 'Dr. Test',
          last_name: 'Therapist'
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;

      // Add therapist data
      const { error: therapistError } = await supabase
        .from('therapists')
        .insert({
          id: user.id,
          specialization: 'Test Therapy',
          license_number: 'TEST123'
        });
      
      if (therapistError) throw therapistError;

      alert('Test therapist added! Refresh the page to see changes.');
    } catch (err: unknown) {
      alert(`Error: ${err}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <p>Loading debug information...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Database Debug</h1>
          <p className="text-slate-600">Check your database connection and data</p>
        </div>

        <Tabs defaultValue="debug" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="debug">Debug Info</TabsTrigger>
            <TabsTrigger value="unavailability">Unavailability Data</TabsTrigger>
            <TabsTrigger value="table">Raw Data Table</TabsTrigger>
            <TabsTrigger value="freeslots">Free Slots Tester</TabsTrigger>
            <TabsTrigger value="timeconversion">Time Conversion</TabsTrigger>
            <TabsTrigger value="diagnostic">Database Diagnostic</TabsTrigger>
          </TabsList>

          <TabsContent value="debug">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-indigo-700 font-bold">Debug Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Authentication</h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.auth, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Database Connection</h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.connection, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Profiles Table</h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.profiles, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Therapists Table</h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.therapists, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Book Session Query Test</h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.bookSessionQuery, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Availability Table</h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.availability, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Get Free Slots Test</h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.freeSlotsTest, null, 2)}
              </pre>
            </div>

            {user && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={addTestTherapist}
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
                >
                  Add Test Therapist (Current User)
                </Button>
              </div>
            )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unavailability">
            <UnavailabilityDataViewer />
          </TabsContent>

          <TabsContent value="table">
            <UnavailabilityTable />
          </TabsContent>

          <TabsContent value="freeslots">
            <FreeSlotsTester />
          </TabsContent>

          <TabsContent value="timeconversion">
            <TimeConversionTester />
          </TabsContent>

          <TabsContent value="diagnostic">
            <DatabaseDiagnostic />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 