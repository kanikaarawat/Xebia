'use client';

import { useUser, useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserDashboard from '@/components/dashboard/UserDashboard';

export default function BypassLogin() {
  const user = useUser();
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 BypassLogin - User:', user);
    console.log('🔍 BypassLogin - Session:', session);
    
    if (!user) {
      console.log('🔍 BypassLogin - No user, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('🔍 BypassLogin - User found, proceeding to dashboard');
  }, [user, session, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Logged In</h1>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  console.log('🔍 BypassLogin - Rendering UserDashboard');
  return <UserDashboard />;
} 