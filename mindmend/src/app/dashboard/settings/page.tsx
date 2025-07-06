'use client';

import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Save,
  Camera,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  avatar_url?: string;
  role: string;
  phone?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export default function SettingsPage() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    timezone: 'UTC',
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    appointment_reminders: true,
    mood_reminders: true,
    weekly_reports: false,
    marketing_emails: false,
  });
  
  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profile_visibility: 'private',
    share_mood_data: false,
    allow_analytics: true,
  });
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to load profile');
          return;
        }

        setUserProfile(profile);
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          bio: profile.bio || '',
          phone: profile.phone || '',
          timezone: profile.timezone || 'UTC',
        });
      } catch (err: any) {
        console.error('Error:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, supabase, router]);

  const handleProfileUpdate = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('First name and last name are required');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const updateData: unknown = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        bio: formData.bio.trim(),
        updated_at: new Date().toISOString(),
      };

      // Only include phone and timezone if they exist in the database
      if (formData.phone.trim()) {
        (updateData as unknown).phone = formData.phone.trim();
      }
      if (formData.timezone) {
        (updateData as unknown).timezone = formData.timezone;
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      if (data) {
        // Update local state with the new data
        setUserProfile(data);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('No data returned from update');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err.code === 'PGRST116') {
        setError('Profile not found. Please refresh the page and try again.');
      } else if (err.message?.includes('RLS')) {
        setError('Permission denied. Please check your account status.');
      } else {
        setError(`Failed to update profile: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const { error: passwordError } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (passwordError) {
        throw passwordError;
      }

      setSuccess('Password updated successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Delete user profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Delete user account
      const { error: userError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (userError) {
        throw userError;
      }

      router.push('/');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account');
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (!userProfile) return 'U';
    return `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`.toUpperCase();
  };

  // Debug function to check profile data
  const debugProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Current user:', user);
      console.log('Current form data:', formData);
      console.log('Current user profile:', userProfile);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('Database profile:', data);
      console.log('Database error:', error);
    } catch (err) {
      console.error('Debug error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-slate-600">Manage your account preferences and privacy</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur p-1 h-10 sm:h-14">
            <TabsTrigger value="profile" className="rounded-lg text-xs sm:text-base font-medium">
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg text-xs sm:text-base font-medium">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-lg text-xs sm:text-base font-medium">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="account" className="rounded-lg text-xs sm:text-base font-medium">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-lg sm:text-xl">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-white shadow-lg">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg sm:text-2xl font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full bg-white border-2"
                    >
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600">{userProfile?.email}</p>
                    <Badge className="mt-2 bg-indigo-100 text-indigo-700 text-xs sm:text-sm">
                      {userProfile?.role || 'User'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm sm:text-base">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => {
                        setFormData({ ...formData, first_name: e.target.value });
                      }}
                      placeholder="Enter your first name"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm sm:text-base">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => {
                        setFormData({ ...formData, last_name: e.target.value });
                      }}
                      placeholder="Enter your last name"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                      }}
                      placeholder="Enter your phone number"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm sm:text-base">Timezone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => {
                        setFormData({ ...formData, timezone: value });
                      }}
                    >
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm sm:text-base">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => {
                      setFormData({ ...formData, bio: e.target.value });
                    }}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={debugProfile}
                    className="text-slate-600 border-slate-200 text-sm sm:text-base"
                  >
                    Debug Profile
                  </Button>
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={saving || !formData.first_name.trim() || !formData.last_name.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-lg sm:text-xl">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Choose how and when you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm sm:text-base">Email Notifications</h4>
                      <p className="text-xs sm:text-sm text-slate-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email_notifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, email_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm sm:text-base">Appointment Reminders</h4>
                      <p className="text-xs sm:text-sm text-slate-600">Get reminded about upcoming sessions</p>
                    </div>
                    <Switch
                      checked={notifications.appointment_reminders}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, appointment_reminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm sm:text-base">Mood Check-ins</h4>
                      <p className="text-xs sm:text-sm text-slate-600">Daily reminders to log your mood</p>
                    </div>
                    <Switch
                      checked={notifications.mood_reminders}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, mood_reminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm sm:text-base">Weekly Reports</h4>
                      <p className="text-xs sm:text-sm text-slate-600">Receive weekly progress summaries</p>
                    </div>
                    <Switch
                      checked={notifications.weekly_reports}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, weekly_reports: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm sm:text-base">Marketing Emails</h4>
                      <p className="text-xs sm:text-sm text-slate-600">Receive updates about new features</p>
                    </div>
                    <Switch
                      checked={notifications.marketing_emails}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, marketing_emails: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setSuccess('Notification preferences saved!')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-lg sm:text-xl">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  Privacy & Security
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Control your privacy settings and data sharing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Profile Visibility</Label>
                    <Select
                      value={privacy.profile_visibility}
                      onValueChange={(value) => setPrivacy({ ...privacy, profile_visibility: value })}
                    >
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private - Only you can see</SelectItem>
                        <SelectItem value="therapists">Therapists only</SelectItem>
                        <SelectItem value="public">Public - Anyone can see</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm sm:text-base">Share Mood Data</h4>
                      <p className="text-xs sm:text-sm text-slate-600">Allow therapists to see your mood trends</p>
                    </div>
                    <Switch
                      checked={privacy.share_mood_data}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, share_mood_data: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm sm:text-base">Analytics</h4>
                      <p className="text-xs sm:text-sm text-slate-600">Help us improve by sharing usage data</p>
                    </div>
                    <Switch
                      checked={privacy.allow_analytics}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, allow_analytics: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setSuccess('Privacy settings saved!')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 sm:space-y-6">
            {/* Password Change */}
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-lg sm:text-xl">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password" className="text-sm sm:text-base">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showPasswords ? "text" : "password"}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      placeholder="Enter current password"
                      className="text-sm sm:text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password" className="text-sm sm:text-base">New Password</Label>
                  <Input
                    id="new_password"
                    type={showPasswords ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    placeholder="Enter new password"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-sm sm:text-base">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type={showPasswords ? "text" : "password"}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    placeholder="Confirm new password"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordData.new_password || !passwordData.confirm_password}
                    className="bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-lg sm:text-xl">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  Account Actions
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Manage your account and data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-slate-200 rounded-lg gap-3 sm:gap-0">
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm sm:text-base">Sign Out</h4>
                    <p className="text-xs sm:text-sm text-slate-600">Sign out of your account</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-red-200 rounded-lg bg-red-50 gap-3 sm:gap-0">
                  <div>
                    <h4 className="font-medium text-red-800 text-sm sm:text-base">Delete Account</h4>
                    <p className="text-xs sm:text-sm text-red-600">Permanently delete your account and all data</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 text-sm sm:text-base"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={saving}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {saving ? 'Deleting...' : 'Delete Account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 