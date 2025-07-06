'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlError = searchParams.get('error');
      const urlErrorDesc = searchParams.get('error_description');
      if (urlError) {
        setError(urlErrorDesc || urlError);
        setLoading(false);
        return;
      }
      setError('Not implemented: supabase removed');
      setLoading(false);
    };
    handleAuthCallback();
  }, [router, searchParams]);

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
