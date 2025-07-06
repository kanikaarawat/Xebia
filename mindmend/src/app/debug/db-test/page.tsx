'use client';

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  data?: unknown;
  errorCode?: string;
  expected?: string;
}

export default function DatabaseTest() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const results = {
        user: user,
        tests: [] as TestResult[]
      };

      try {
        // Test 1: Basic connection
        console.log('🔍 Testing basic database connection...');
        const { data: connectionTest, error: connectionError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        results.tests.push({
          name: 'Basic Connection',
          success: !connectionError,
          error: connectionError?.message,
          data: connectionTest
        });

        // Test 2: Check if user's profile exists
        console.log('🔍 Testing profile fetch for user:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        results.tests.push({
          name: 'Profile Fetch',
          success: !profileError,
          error: profileError?.message,
          data: profile,
          errorCode: profileError?.code
        });

        // Test 3: Check RLS policies
        console.log('🔍 Testing RLS policies...');
        const { data: rlsTest, error: rlsError } = await supabase
          .from('profiles')
          .select('id, email, role')
          .limit(5);

        results.tests.push({
          name: 'RLS Policy Test',
          success: !rlsError,
          error: rlsError?.message,
          data: rlsTest?.length || 0
        });

        // Test 4: Try to insert a test record (should fail due to RLS)
        console.log('🔍 Testing insert permissions...');
        const { data: insertTest, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: 'test-user-id',
            email: 'test@example.com',
            role: 'user'
          });

        results.tests.push({
          name: 'Insert Test',
          success: false, // Should fail due to RLS
          error: insertError?.message,
          expected: 'Should fail due to RLS'
        });

      } catch (err) {
        console.error('❌ Error in database tests:', err);
        results.tests.push({
          name: 'General Error',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }

      setTestResults(results);
      setLoading(false);
    };

    runTests();
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-red-600">Not logged in</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User Information:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(testResults?.user, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {testResults?.tests.map((test: any, index: number) => (
              <div key={index} className={`p-4 rounded mb-3 ${test.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                <h4 className="font-semibold mb-2">
                  {test.name} {test.success ? '✅ PASS' : '❌ FAIL'}
                </h4>
                {test.error && (
                  <p className="text-sm text-red-700 mb-2">
                    <strong>Error:</strong> {test.error}
                    {test.errorCode && <span className="ml-2">(Code: {test.errorCode})</span>}
                  </p>
                )}
                {test.data && (
                  <details className="text-sm">
                    <summary className="cursor-pointer">View Data</summary>
                    <pre className="bg-white p-2 rounded mt-2 text-xs overflow-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
                {test.expected && (
                  <p className="text-sm text-gray-600">
                    <strong>Expected:</strong> {test.expected}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => window.location.href = '/dashboard'}>
              Try Dashboard Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Refresh Tests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 