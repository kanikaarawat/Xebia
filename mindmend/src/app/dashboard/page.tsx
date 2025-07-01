'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import UserDashboard from '@/components/dashboard/UserDashboard';
import TherapistDashboard from '@/components/dashboard/TherapistDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('user');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Fallback to user metadata if profile not found
          setUserRole(user.user_metadata?.role || 'user');
        } else {
          setUserRole(profile.role || 'user');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to user metadata
        setUserRole(user.user_metadata?.role || 'user');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (userRole === 'therapist') {
    return <TherapistDashboard />;
  }
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }
  return <UserDashboard />;
} 