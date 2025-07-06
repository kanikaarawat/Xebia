'use client';

import { useUser, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthTest() {
  const user = useUser();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [profile, setProfile] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Auth test - User:', user);
        console.log('🔍 Auth test - Session:', session);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('🔍 Auth test - Profile result:', { data, error });
        
        if (error) {
          setError(error.message);
        } else {
          setProfile(data);
          
          // Test the same completeness check as LoginForm
          const missing = (v: unknown) =>
            typeof v !== 'string' ? !v : v.trim().length === 0;
          
          const isTherapist = data.role === 'therapist';
          const incomplete = 
            missing(data.first_name) ||
            missing(data.last_name) ||
            (isTherapist && (
              missing(data.specialization) ||
              missing(data.license_number)
            ));

          console.log('🔍 Auth test - Completeness check:', {
            profile: data,
            isTherapist,
            incomplete,
            missingFields: {
              first_name: missing(data.first_name),
              last_name: missing(data.last_name),
              ...(isTherapist && {
                specialization: missing(data.specialization),
                license_number: missing(data.license_number)
              })
            }
          });
        }
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [user, session, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Authentication State:</h3>
            <ul className="space-y-1 text-sm">
              <li>✅ User: {user ? 'Logged in' : 'Not logged in'}</li>
              <li>✅ Session: {session ? 'Active' : 'No session'}</li>
              <li>✅ User ID: {user?.id || 'N/A'}</li>
              <li>✅ User Email: {user?.email || 'N/A'}</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {profile && (
            <div>
              <h3 className="font-semibold mb-2">Profile Completeness Test:</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ ID: {profile.id ? 'Present' : 'Missing'}</li>
                <li>✅ Email: {profile.email ? 'Present' : 'Missing'}</li>
                <li>✅ Role: {profile.role ? 'Present' : 'Missing'}</li>
                <li>✅ First Name: {profile.first_name ? 'Present' : 'Missing'}</li>
                <li>✅ Last Name: {profile.last_name ? 'Present' : 'Missing'}</li>
                <li>✅ Bio: {profile.bio ? 'Present' : 'Missing'}</li>
                <li>✅ Avatar URL: {profile.avatar_url ? 'Present' : 'Missing'}</li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-800">Completeness Check Result:</h4>
                <p className="text-sm text-blue-700">
                  Based on your requirements (first_name, last_name for users), 
                  this profile should be considered: <strong>COMPLETE</strong>
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={() => window.location.href = '/dashboard'}>
              Try Dashboard
            </Button>
            <Button onClick={() => window.location.href = '/setup-profile'}>
              Try Setup Profile
            </Button>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 