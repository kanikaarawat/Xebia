'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DatabaseDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<unknown>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: unknown = {};

    try {
      // Test 1: Basic connection
      console.log('🔍 Testing basic connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      results.connection = {
        success: !connectionError,
        error: connectionError?.message,
        details: connectionError
      };

      // Test 2: Check if therapist_unavailability table exists
      console.log('🔍 Testing therapist_unavailability table...');
      const { data: unavailabilityTest, error: unavailabilityError } = await supabase
        .from('therapist_unavailability')
        .select('id')
        .limit(1);
      
      results.unavailabilityTable = {
        exists: !unavailabilityError,
        error: unavailabilityError?.message,
        details: unavailabilityError,
        recordCount: unavailabilityTest?.length || 0
      };

      // Test 3: Check therapists table
      console.log('🔍 Testing therapists table...');
      const { data: therapistsTest, error: therapistsError } = await supabase
        .from('therapists')
        .select('id')
        .limit(5);
      
      results.therapistsTable = {
        success: !therapistsError,
        error: therapistsError?.message,
        count: therapistsTest?.length || 0
      };

      // Test 4: Check profiles table
      console.log('🔍 Testing profiles table...');
      const { data: profilesTest, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .limit(5);
      
      results.profilesTable = {
        success: !profilesError,
        error: profilesError?.message,
        count: profilesTest?.length || 0,
        therapists: profilesTest?.filter(p => p.role === 'therapist').length || 0
      };

      // Test 5: Check appointments table
      console.log('🔍 Testing appointments table...');
      const { data: appointmentsTest, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .limit(5);
      
      results.appointmentsTable = {
        success: !appointmentsError,
        error: appointmentsError?.message,
        count: appointmentsTest?.length || 0
      };

      // Test 6: Try to create test unavailability if table exists
      if (!unavailabilityError) {
        console.log('🔍 Testing unavailability insert...');
        const testTherapistId = therapistsTest?.[0]?.id;
        
        if (testTherapistId) {
          const { data: insertTest, error: insertError } = await supabase
            .from('therapist_unavailability')
            .insert({
              therapist_id: testTherapistId,
              start_time: new Date().toISOString(),
              end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              reason: 'Diagnostic test'
            })
            .select();

          results.insertTest = {
            success: !insertError,
            error: insertError?.message,
            details: insertError
          };

          // Clean up test record
          if (insertTest?.[0]?.id) {
            await supabase
              .from('therapist_unavailability')
              .delete()
              .eq('id', insertTest[0].id);
          }
        }
      }

    } catch (error) {
      console.error('❌ Diagnostic error:', error);
      results.generalError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
    }

    setDiagnostics(results);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Database Diagnostic</h1>
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Connection Test
              <Badge variant={diagnostics.connection?.success ? "default" : "destructive"}>
                {diagnostics.connection?.success ? "✅" : "❌"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(diagnostics.connection, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Unavailability Table
              <Badge variant={diagnostics.unavailabilityTable?.exists ? "default" : "destructive"}>
                {diagnostics.unavailabilityTable?.exists ? "✅" : "❌"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(diagnostics.unavailabilityTable, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Therapists Table
              <Badge variant={diagnostics.therapistsTable?.success ? "default" : "destructive"}>
                {diagnostics.therapistsTable?.success ? "✅" : "❌"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(diagnostics.therapistsTable, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Profiles Table
              <Badge variant={diagnostics.profilesTable?.success ? "default" : "destructive"}>
                {diagnostics.profilesTable?.success ? "✅" : "❌"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(diagnostics.profilesTable, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Appointments Table
              <Badge variant={diagnostics.appointmentsTable?.success ? "default" : "destructive"}>
                {diagnostics.appointmentsTable?.success ? "✅" : "❌"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(diagnostics.appointmentsTable, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {diagnostics.insertTest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Insert Test
                <Badge variant={diagnostics.insertTest?.success ? "default" : "destructive"}>
                  {diagnostics.insertTest?.success ? "✅" : "❌"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-2 rounded">
                {JSON.stringify(diagnostics.insertTest, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {diagnostics.generalError && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">General Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-red-50 p-2 rounded text-red-700">
                {JSON.stringify(diagnostics.generalError, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Database Connection:</span>
              <Badge variant={diagnostics.connection?.success ? "default" : "destructive"}>
                {diagnostics.connection?.success ? "Working" : "Failed"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Unavailability Table:</span>
              <Badge variant={diagnostics.unavailabilityTable?.exists ? "default" : "destructive"}>
                {diagnostics.unavailabilityTable?.exists ? "Exists" : "Missing"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Therapists:</span>
              <Badge variant={diagnostics.therapistsTable?.success ? "default" : "destructive"}>
                {diagnostics.therapistsTable?.count || 0} found
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Profiles:</span>
              <Badge variant={diagnostics.profilesTable?.success ? "default" : "destructive"}>
                {diagnostics.profilesTable?.count || 0} total, {diagnostics.profilesTable?.therapists || 0} therapists
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Appointments:</span>
              <Badge variant={diagnostics.appointmentsTable?.success ? "default" : "destructive"}>
                {diagnostics.appointmentsTable?.count || 0} found
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 