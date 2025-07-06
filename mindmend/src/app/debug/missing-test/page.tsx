'use client';

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const missing = (v: unknown) =>
  typeof v !== 'string' ? !v : v.trim().length === 0;

export default function MissingTest() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [profile, setProfile] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testMissing = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
          
          // Test the missing function on each field
          const isTherapist = data.role === 'therapist';
          const first_name_missing = missing(data.first_name);
          const last_name_missing = missing(data.last_name);
          
          console.log('🔍 Missing function test:', {
            first_name: data.first_name,
            first_name_missing,
            last_name: data.last_name,
            last_name_missing,
            isTherapist,
            role: data.role
          });
          
          // Test the completeness logic
          const incomplete = first_name_missing || last_name_missing;
          
          console.log('🔍 Completeness test:', {
            incomplete,
            first_name_missing,
            last_name_missing
          });
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    testMissing();
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-red-600">No profile found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isTherapist = profile.role === 'therapist';
  const first_name_missing = missing(profile.first_name);
  const last_name_missing = missing(profile.last_name);
  const incomplete = first_name_missing || last_name_missing;

  return (
    <div className="min-h-screen p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Missing Function Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Profile Data:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Missing Function Results:</h3>
            <ul className="space-y-1 text-sm">
              <li>✅ First Name: "{profile.first_name}" - Missing: {first_name_missing ? 'YES' : 'NO'}</li>
              <li>✅ Last Name: "{profile.last_name}" - Missing: {last_name_missing ? 'YES' : 'NO'}</li>
              <li>✅ Role: {profile.role}</li>
              <li>✅ Is Therapist: {isTherapist ? 'YES' : 'NO'}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Completeness Check:</h3>
            <div className={`p-3 rounded ${incomplete ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <strong>Result:</strong> {incomplete ? 'INCOMPLETE' : 'COMPLETE'}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Expected Behavior:</h3>
            <p className="text-sm text-gray-600">
              For users: Only first_name and last_name are required.<br/>
              For therapists: first_name, last_name, specialization, and license_number are required.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 