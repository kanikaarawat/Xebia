'use client';

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfileCheck() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [profile, setProfile] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking profile for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('🔍 Profile result:', { data, error });
        
        if (error) {
          setError(error.message);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User Information:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify({
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata
              }, null, 2)}
            </pre>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {profile && (
            <div>
              <h3 className="font-semibold mb-2">Profile Information:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(profile, null, 2)}
              </pre>
              
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Profile Completeness Check:</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ ID: {profile.id ? 'Present' : 'Missing'}</li>
                  <li>✅ Email: {profile.email ? 'Present' : 'Missing'}</li>
                  <li>✅ Role: {profile.role ? 'Present' : 'Missing'}</li>
                  <li>✅ First Name: {profile.first_name ? 'Present' : 'Missing'}</li>
                  <li>✅ Last Name: {profile.last_name ? 'Present' : 'Missing'}</li>
                  <li>✅ Bio: {profile.bio ? 'Present' : 'Missing'}</li>
                  <li>✅ Avatar URL: {profile.avatar_url ? 'Present' : 'Missing'}</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
            <Button onClick={() => window.location.href = '/setup-profile'}>
              Go to Setup Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 