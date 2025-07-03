'use client';

import { useUser, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Users, Clock, BookOpen, Shield, ArrowRight, Star, CheckCircle } from 'lucide-react';

export default function Home() {
  const user = useUser();
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Navigate to login page after sign out
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                  MindMend
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-indigo-50"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-indigo-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-indigo-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                  <Star className="w-4 h-4 mr-2" />
                  Trusted by 10,000+ users
                </div>
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Nurturing Mental</span>{' '}
                  <span className="block bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent xl:inline">
                    Wellness
                  </span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 sm:text-xl sm:max-w-xl sm:mx-auto md:mt-8 md:text-2xl lg:mx-0 leading-relaxed">
                  Connect with licensed therapists, track your mental health journey, and access 
                  comprehensive wellness resources in a secure, stigma-free environment.
                </p>
                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border-2 border-indigo-200 text-base font-medium rounded-xl text-indigo-700 bg-white/80 backdrop-blur-sm hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Learn More
                  </Link>
                </div>
                
                {/* Trust indicators */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-8">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600">Secure & Private</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-gray-600">Licensed Therapists</span>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/60 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              Features
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl mb-6">
              Everything you need for{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                mental wellness
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and resources designed to support your mental health journey
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="group relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 hover:border-indigo-200">
                <div className="absolute top-6 right-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
                <div className="pr-16">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Online Therapy Sessions</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Connect with licensed therapists through secure video calls and messaging. 
                    Schedule sessions that fit your lifestyle and get the support you need.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 hover:border-indigo-200">
                <div className="absolute top-6 right-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-6 w-6" />
                  </div>
                </div>
                <div className="pr-16">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Mood Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Track your daily moods and get AI-powered insights and recommendations. 
                    Understand your patterns and celebrate your progress.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 hover:border-indigo-200">
                <div className="absolute top-6 right-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
                <div className="pr-16">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Resource Library</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Access curated self-help resources, meditation guides, and wellness content. 
                    Learn practical techniques for managing stress and anxiety.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 hover:border-indigo-200">
                <div className="absolute top-6 right-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="pr-16">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Support</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Join anonymous community forums for peer support and shared experiences. 
                    Connect with others who understand your journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-indigo-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl mb-6">
            Ready to start your wellness journey?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their mental health with MindMend
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
