'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

// Helper for missing fields (copied from LoginForm)
const missing = (v: unknown) => typeof v !== 'string' ? !v : v.trim().length === 0;

// Reusable redirect logic (copied from LoginForm)
async function redirectBasedOnProfile(supabase: any, router: any, userId: string, userEmail: string) {
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) {
    await supabase.from('profiles').insert({
      id: userId,
      email: userEmail,
      role: 'user',
    });
    // Wait for the insert to propagate
    await new Promise((res) => setTimeout(res, 300));
    await router.push('/setup-profile');
    return;
  }

  const isTherapist = profile.role === 'therapist';
  const missingChecks = {
    first_name: missing(profile.first_name),
    last_name: missing(profile.last_name),
    bio: missing(profile.bio),
    specialization: isTherapist ? missing(profile.specialization) : false,
    license_number: isTherapist ? missing(profile.license_number) : false,
  };
  const incomplete =
    missingChecks.first_name ||
    missingChecks.last_name ||
    missingChecks.bio ||
    missingChecks.specialization ||
    missingChecks.license_number;

  console.log('[DEBUG] Profile:', profile);
  console.log('[DEBUG] Missing checks:', missingChecks);
  console.log('[DEBUG] Incomplete:', incomplete);

  await router.push(incomplete ? '/setup-profile' : '/dashboard');
}

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      setLoading(true);
      const urlError = searchParams.get('error');
      const urlErrorDesc = searchParams.get('error_description');
      if (urlError) {
        setError(urlErrorDesc || urlError);
        setLoading(false);
        return;
      }
      // Get session/user from Supabase
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setError(error?.message || 'Authentication failed.');
        setLoading(false);
        return;
      }
      // Use the same redirect logic as LoginForm, and await the redirect
      await redirectBasedOnProfile(supabase, router, user.id, user.email!);
      setLoading(false);
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
