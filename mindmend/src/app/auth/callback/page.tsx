'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const missing = (v: unknown) => typeof v !== "string" ? !v : v.trim().length === 0;

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      // 1. Check for error in URL (from OAuth)
      const urlError = searchParams.get('error');
      const urlErrorDesc = searchParams.get('error_description');
      if (urlError) {
        setError(urlErrorDesc || urlError);
        setLoading(false);
        console.error('❌ OAuth error:', urlError, urlErrorDesc);
        return;
      }
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError('Could not authenticate user. Please try again.');
          setLoading(false);
          console.error('❌ Supabase user error:', userError);
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileError && profileError.code !== 'PGRST116') {
          setError('Error fetching your profile.');
          setLoading(false);
          console.error('❌ Profile fetch error:', profileError);
          return;
        }
        // If no profile exists, create one
        if (!profile) {
          console.log('📝 Creating profile in auth callback...');
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user',
          });
          if (insertError) {
            setError('Could not create your profile. Please contact support.');
            setLoading(false);
            console.error('❌ Error creating profile:', insertError);
            return;
            
          } else {
            console.log('✅ Profile created with role:', user.user_metadata?.role || 'user');
          }
          router.push('/setup-profile');
          return;
        }
        const isTherapist = profile.role === 'therapist';
        const incomplete =
          missing(profile.first_name) ||
          missing(profile.last_name) ||
          (isTherapist && (
            missing(profile.bio) ||
            missing(profile.specialization) ||
            missing(profile.license_number)
          ));
        router.push(incomplete ? '/setup-profile' : '/dashboard');
      } catch (err: any) {
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
        console.error('❌ Unexpected error in auth callback:', err);
      }
    };
    checkProfile();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
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