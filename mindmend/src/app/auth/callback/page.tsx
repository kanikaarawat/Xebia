'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const isEmpty = (v: unknown) => typeof v !== 'string' ? !v : v.trim().length === 0;
    
export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useSupabaseClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlError = searchParams.get('error');
      const urlErrorDesc = searchParams.get('error_description');
      if (urlError) {
        console.error('OAuth Error:', urlError, urlErrorDesc);
        setError(urlErrorDesc || urlError);
        setLoading(false);
        return;
      }

      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();
        console.log('AuthCallback: user:', user, 'userError:', userError);

        if (userError || !user) {
          setError('Could not authenticate user. Please try again.');
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
          setError('Error fetching your profile.');
          setLoading(false);
          return;
        }

        // If profile doesn't exist, create one
        if (!profile) {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user'
          });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            setError('Could not create your profile. Please contact support.');
            setLoading(false);
            return;
          }

          router.push('/setup-profile');
          return;
        }

        const isTherapist = profile.role === 'therapist';
        const incomplete =
          isEmpty(profile.first_name) ||
          isEmpty(profile.last_name) ||
          (isTherapist &&
            (isEmpty(profile.bio) ||
              isEmpty(profile.specialization) ||
              isEmpty(profile.license_number)));

        router.push(incomplete ? '/setup-profile' : '/dashboard');
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams, supabase]);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-red-200">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Authentication Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium shadow hover:from-indigo-600 hover:to-pink-600 transition"
            onClick={() => router.push('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
