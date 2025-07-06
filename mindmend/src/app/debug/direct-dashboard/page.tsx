'use client';

import { useUser, useSession } from '@supabase/auth-helpers-react';
import UserDashboard from '@/components/dashboard/UserDashboard';

export default function DirectDashboard() {
  const user = useUser();
  const session = useSession();

  console.log('🔍 DirectDashboard - User:', user);
  console.log('🔍 DirectDashboard - Session:', session);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Logged In</h1>
          <p className="text-gray-600">Please log in first</p>
        </div>
      </div>
    );
  }

  // Force render the appropriate dashboard based on user role
  // We'll assume user role for now since your profile shows role: 'user'
  console.log('🔍 DirectDashboard - Rendering UserDashboard directly');
  return <UserDashboard />;
} 