'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserDashboard from '@/components/dashboard/UserDashboard';
import TherapistDashboard from '@/components/dashboard/TherapistDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = user.user_metadata?.role || 'user';

  if (userRole === 'therapist') {
    return <TherapistDashboard />;
  }
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }
  return <UserDashboard />;
} 