'use client';

import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterForm() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'therapist'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = useSupabaseClient();
  const router = useRouter();

  // Function to check if email already exists
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      console.log('🔍 Checking email via API:', email);
      
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('📧 API response:', data);

      if (!response.ok) {
        console.error('❌ API error:', data.error);
        return false;
      }

      return data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  // Function to get user-friendly error message
  const getErrorMessage = (error: unknown): string => {
    if (!error) return 'An error occurred';
    
    const message = error instanceof Error ? error.message : error.toString();
    console.log('🔍 Error message:', message);
    
    // Check for specific Supabase auth errors
    if (message.includes('User already registered')) {
      return 'This email is already registered. Please try signing in instead.';
    }
    
    if (message.includes('duplicate key value violates unique constraint')) {
      return 'This email is already registered. Please try signing in instead.';
    }
    
    if (message.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    
    if (message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    
    if (message.includes('Unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    
    // Check for Supabase Auth specific errors
    if (message.includes('Signup disabled')) {
      return 'Registration is currently disabled. Please try again later.';
    }
    
    if (message.includes('Email not confirmed')) {
      return 'Please check your email and confirm your account before signing in.';
    }
    
    // Check for more specific auth errors
    if (message.includes('already been registered')) {
      return 'This email is already registered. Please try signing in instead.';
    }
    
    if (message.includes('already exists')) {
      return 'This email is already registered. Please try signing in instead.';
    }
    
    if (message.includes('already in use')) {
      return 'This email is already registered. Please try signing in instead.';
    }
    
    // Return the original message if no specific match
    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Checking if email exists:', email);
      
      // Check if email already exists before attempting registration
      const emailExists = await checkEmailExists(email);
      console.log('📧 Email exists check result:', emailExists);
      
      if (emailExists) {
        console.log('❌ Email already exists, showing error');
        setError('This email is already registered. Please try signing in instead.');
        setLoading(false);
        return;
      }

      console.log('✅ Email is new, proceeding with registration');
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.log('❌ Supabase Auth error:', error);
        throw error;
      }
      
      console.log('✅ Registration successful');
      setSuccess('Registration successful! Please check your email to verify your account.');
      setTimeout(() => {
        router.push("/setup-profile");
      }, 1500); // short delay to show success message
    
    } catch (error: unknown) {
      console.log('❌ Caught error in registration:', error);
      const friendlyMessage = getErrorMessage(error);
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join MindMend
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account to get started
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={(e) => setRole(e.target.value as 'user' | 'therapist')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Individual seeking support</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="therapist"
                  checked={role === 'therapist'}
                  onChange={(e) => setRole(e.target.value as 'user' | 'therapist')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Licensed therapist</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
              {error.includes('already registered') && (
                <div className="mt-2">
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-500 underline">
                    Sign in here
                  </Link>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm text-center">{success}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 