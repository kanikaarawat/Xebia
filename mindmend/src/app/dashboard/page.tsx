'use client';

import { useUser, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserDashboard from '@/components/dashboard/UserDashboard';
import TherapistDashboard from '@/components/dashboard/TherapistDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function Dashboard() {
  const user = useUser();
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('user');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (session === undefined) return; // still loading
    if (!user) {
      router.push('/login');
    }
  }, [user, session, router]);

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
          setUserRole(user.user_metadata?.role || 'user');
        } else {
          setUserRole(profile.role || 'user');
        }
      } catch (error) {
        setUserRole(user.user_metadata?.role || 'user');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user, supabase]);

  if (session === undefined || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
        <div className="bg-white/90 rounded-xl shadow-xl p-10 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Welcome to MindMend</h2>
          <p className="text-slate-600 mb-6 text-center max-w-md">
            Sign in or create an account to access your personalized dashboard and wellness tools.
          </p>
          <a
            href="/signup"
            className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mb-2"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="text-indigo-600 hover:text-pink-600 font-medium text-base mt-2"
          >
            Already have an account? Sign in
          </a>
        </div>
      </div>
    );
  }

  if (userRole === 'therapist') {
    return <TherapistDashboard />;
  }
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }
  return <UserDashboard />;
} 