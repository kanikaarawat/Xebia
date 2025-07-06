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
    // Don't redirect - let the component handle the logged-out state
  }, [user, session, router]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserRole(profile.role || 'user');
        } else {
          setUserRole(user.user_metadata?.role || 'user');
        }
      } catch (error) {
        setUserRole(user.user_metadata?.role || 'user');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user, supabase]);

  // Show loading only when session is still loading (undefined) or when user is logged in and profile is loading
  if (session === undefined || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 xl:h-24 xl:w-24 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 xl:py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-indigo-800 mb-2 sm:mb-3 lg:mb-4 leading-tight">
              Your Journey to
              <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent block sm:inline"> Mental Wellness</span>
              <br className="hidden sm:block" />Starts Here
            </h1>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-600 mb-3 sm:mb-4 lg:mb-6 max-w-2xl mx-auto px-2 sm:px-4">
              Connect with qualified therapists, track your mood, and get personalized insights to improve your mental health and well-being.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8 px-2 sm:px-4">
              <div className="bg-white/80 rounded-xl p-3 sm:p-4 lg:p-6 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 mx-auto">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-indigo-800 mb-1 sm:mb-2">Mood Tracking</h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600">Track your daily mood patterns and get AI-powered insights.</p>
              </div>
              
              <div className="bg-white/80 rounded-xl p-3 sm:p-4 lg:p-6 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 mx-auto">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-indigo-800 mb-1 sm:mb-2">Expert Therapy</h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600">Connect with qualified mental health professionals.</p>
              </div>
              
              <div className="bg-white/80 rounded-xl p-3 sm:p-4 lg:p-6 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 mx-auto">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-indigo-800 mb-1 sm:mb-2">AI Insights</h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600">Get personalized recommendations and progress analysis.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center px-2 sm:px-4">
              <a
                href="/signup"
                className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 text-center"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-semibold transition-all duration-200 text-center"
              >
                Sign In
              </a>
            </div>
          </div>
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