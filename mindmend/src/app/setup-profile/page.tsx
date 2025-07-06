'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function SetupProfile() {
  const router = useRouter();
  const user = useUser();
  const session = useSession();
  const supabase = useSupabaseClient();

  const [profile, setProfile] = useState<unknown>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  // Debug logging
  console.log('🔍 SetupProfile render state:', {
    user: user ? { id: user.id, email: user.user_metadata.email } : null,
    session,
    profile,
    profileLoading
  });

  // Database connectivity check
  const checkDatabaseConnection = async () => {
    try {
      console.log('🔍 Checking database connection...');
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Database connection failed:', error);
        return false;
      } else {
        console.log('✅ Database connection successful');
        return true;
      }
    } catch (error) {
      console.error('❌ Database check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log('🔍 Fetching profile for user:', user.id);
        
        // First, check database connection
        const dbConnected = await checkDatabaseConnection();
        if (!dbConnected) {
          console.error('❌ Cannot proceed - database not connected');
          setProfile(null);
          setProfileLoading(false);
          return;
        }
        
        // Then try to fetch profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('🔍 Profile fetch result:', { data, error });

        if (error) {
          console.error('Error fetching profile:', error);
          
          // Handle different error types
          if (error.code === 'PGRST116') {
            // Profile not found - try to create one
            console.log('🔍 Profile not found, creating basic profile');
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  email: user.user_metadata.email,
                  role: 'user'
                })
                .select()
                .single();

              if (createError) {
                console.error('❌ Error creating profile:', createError);
                // Don't throw error, just set profile to null and let the UI handle it
                setProfile(null);
              } else {
                console.log('✅ Basic profile created:', newProfile);
                setProfile(newProfile);
              }
            } catch (createError: any) {
              console.error('❌ Unexpected error creating profile:', createError);
              // Don't throw error, just set profile to null
              setProfile(null);
            }
          } else if (error.code === '42P01') {
            // Table doesn't exist
            console.error('❌ Profiles table does not exist');
            setProfile(null);
          } else if (error.code === '42501') {
            // Permission denied
            console.error('❌ Permission denied - RLS policy issue');
            setProfile(null);
          } else {
            // Other database errors
            console.error('❌ Database error:', error.message);
            setProfile(null);
          }
        } else {
          console.log('✅ Profile found:', data);
          setProfile(data);
          // Pre-fill form with existing data
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (error: any) {
        console.error('❌ Unexpected error in fetchProfile:', error);
        // Don't throw error, just set profile to null
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Starting profile setup for user:', user.id);
      console.log('🔍 Current profile data:', profile);
      console.log('🔍 Form data:', { firstName, lastName, bio, avatarUrl, specialization, licenseNumber });

      // Update profiles table with basic info
      const profileUpdates: any = {
        first_name: firstName,
        last_name: lastName,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      console.log('🔍 Updating profiles table with:', profileUpdates);

      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id)
        .select();

      console.log('🔍 Profile update result:', { updateData, updateError });

      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        setError(updateError.message);
        setLoading(false);
        return;
      }

      console.log('✅ Profile updated successfully');

      // If user is a therapist, save to therapists table
      if (profile?.role === 'therapist') {
        console.log('🔍 User is therapist, saving to therapists table');
        
        const therapistData = {
          id: user.id,
          specialization,
          license_number: licenseNumber,
        };

        console.log('🔍 Therapist data to save:', therapistData);

        const { data: therapistResult, error: therapistError } = await supabase
          .from('therapists')
          .upsert(therapistData)
          .select();

        console.log('🔍 Therapist save result:', { therapistResult, therapistError });

        if (therapistError) {
          console.error('❌ Therapist save error:', therapistError);
          setError(therapistError.message);
          setLoading(false);
          return;
        }

        console.log('✅ Therapist data saved successfully');
      } else {
        console.log('🔍 User is not a therapist, skipping therapist table');
      }

      console.log('✅ Profile setup completed, redirecting to dashboard');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Unexpected error during profile setup:', error);
      setError(error.message || 'An error occurred while saving your profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-slate-800">MindMend</span>
            </Link>
          </div>
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 text-center">
              <CardTitle className="text-red-600 mb-4">Authentication Required</CardTitle>
              <p className="text-slate-600 mb-4">
                You need to be logged in to complete your profile setup.
              </p>
              <Button onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-slate-800">MindMend</span>
            </Link>
          </div>
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600">
                Loading your profile...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If profile still doesn't exist after loading, show error
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-slate-800">MindMend</span>
            </Link>
          </div>
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 text-center">
              <CardTitle className="text-red-600 mb-4">Profile Error</CardTitle>
              <p className="text-slate-600 mb-4">
                Unable to load or create your profile. This is usually a database setup issue.
              </p>
              <div className="space-y-3 text-sm text-slate-500 mb-6">
                <p>Please try these steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Run the <code className="bg-slate-100 px-1 rounded">quick_fix_profile.sql</code> script in your Supabase SQL Editor</li>
                  <li>Check the browser console for specific error messages</li>
                  <li>Visit <code className="bg-slate-100 px-1 rounded">/debug</code> for system status</li>
                  <li>Refresh this page after fixing the database</li>
                </ol>
              </div>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()} className="w-full">
                  Refresh Page
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/debug')}
                  className="w-full"
                >
                  Check System Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold text-slate-800">MindMend</span>
          </Link>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl text-indigo-700 font-bold">Complete Your Profile</CardTitle>
            <CardDescription className="text-slate-600">
              Just a few more details to personalize your experience
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us something about yourself..."
                />
              </div>

              <div>
                <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              {profile?.role === 'therapist' && (
                <>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="text-center text-sm text-red-600">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-6"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
