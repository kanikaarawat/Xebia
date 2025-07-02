"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Heart, User, UserCheck } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "therapist">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const supabase = useSupabaseClient();

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
  const getErrorMessage = (error: any): string => {
    if (!error) return 'An error occurred';
    
    const message = error.message || error.toString();
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
    setError("");
    
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
      setEmailSent(true);
    } catch (err: any) {
      console.log('❌ Caught error in registration:', err);
      const friendlyMessage = getErrorMessage(err);
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      const friendlyMessage = getErrorMessage(err);
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-slate-800">MindMend</span>
            </Link>
          </div>

          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl text-indigo-700 font-bold">Check Your Email</CardTitle>
              <CardDescription className="text-slate-600">
                We've sent a confirmation link to {email}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 text-center">
              <div className="space-y-4">
                <p className="text-slate-600">
                  Please check your email and click the confirmation link to verify your account.
                </p>
                <p className="text-sm text-slate-500">
                  Once confirmed, you'll be redirected to complete your profile setup.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Back to Sign Up
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    Already confirmed? Sign in
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold text-slate-800">MindMend</span>
          </Link>
        </div>

        <Card className="bg-white shadow-xl relative overflow-visible">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl text-indigo-700 font-bold">Create Account</CardTitle>
            <CardDescription className="text-slate-600">
              Join MindMend to start your wellness journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              variant="outline"
              className="w-full bg-white border-slate-200 hover:bg-slate-50 text-slate-700 py-6"
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or sign up with email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">I am a</Label>
                <Select value={role} onValueChange={(value: "user" | "therapist") => setRole(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border border-slate-200 shadow-xl rounded-md overflow-hidden">
                    <SelectItem value="user">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Patient</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="therapist">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4" />
                        <span>Therapist</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="text-center text-sm text-red-600">
                  <p>{error}</p>
                  {error.includes('already registered') && (
                    <div className="mt-2">
                      
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-6"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in instead
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 