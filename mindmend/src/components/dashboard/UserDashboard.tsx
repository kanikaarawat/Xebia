"use client";

import { useState, useEffect } from "react";
import { useUser, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Heart,
  Calendar,
  MessageCircle,
  BookOpen,
  Users,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Bell,
  Settings,
  Video,
  Phone,
  Search,
  Clock,
  Star,
  MapPin,
  User,
  Plus,
  CheckCircle,
  AlertCircle,
  FileText,
  Video as VideoIcon,
  MessageCircle as MessageIcon,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AppointmentsList from "@/components/booking/AppointmentsList";
import UserSessionStats from "@/components/booking/UserSessionStats";
import { useSessionCounts } from "@/lib/hooks/useSessionCounts";
import { Textarea } from "@/components/ui/textarea";
import { format, subDays } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { PersonalizedVideos } from "@/components/booking/PersonalizedVideos";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  bio: string;
  avatar_url?: string;
  rating?: number;
}

// SVG face icons for moods 1-5
const MoodFaces = [
  // 1: Very Sad
  () => {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#fecaca" />
        <circle cx="9" cy="11" r="1" fill="#991b1b" />
        <circle cx="15" cy="11" r="1" fill="#991b1b" />
        <path d="M9 17c1-1 3-1 6 0" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  },
  // 2: Sad
  () => {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#fca5a5" />
        <circle cx="9" cy="11" r="1" fill="#b91c1c" />
        <circle cx="15" cy="11" r="1" fill="#b91c1c" />
        <path d="M9 16c1-0.5 3-0.5 6 0" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  },
  // 3: Neutral
  () => {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#fef08a" />
        <circle cx="9" cy="11" r="1" fill="#b45309" />
        <circle cx="15" cy="11" r="1" fill="#b45309" />
        <path d="M9 16h6" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  },
  // 4: Happy
  () => {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#bbf7d0" />
        <circle cx="9" cy="11" r="1" fill="#166534" />
        <circle cx="15" cy="11" r="1" fill="#166534" />
        <path d="M9 15c1 1 3 1 6 0" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  },
  // 5: Very Happy
  () => {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#a7f3d0" />
        <circle cx="9" cy="11" r="1" fill="#065f46" />
        <circle cx="15" cy="11" r="1" fill="#065f46" />
        <path d="M9 14c1.5 2 4.5 2 6 0" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  },
];

export default function UserDashboard() {
  const user = useUser();
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [selectedMoodScore, setSelectedMoodScore] = useState<number | null>(null);
  const [moodLogSuccess, setMoodLogSuccess] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [moodNotes, setMoodNotes] = useState("");
  
  // Filter states for appointments
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Use the custom hook for session counts
  const { upcomingCount, completedCount, todayCount, loading: sessionCountsLoading, error: sessionCountsError } = useSessionCounts(userProfile?.id);

  // Mood log state
  const [moodData, setMoodData] = useState<{ day: string; mood: number | null }[]>([]);
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [averageMood, setAverageMood] = useState<number | null>(null);

  // Weekly mood analysis state
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<string | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyError, setWeeklyError] = useState<string | null>(null);

  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate mood improvement percent (last 7 days vs previous 7 days)
  let moodImprovementPercent = 0;
  if (moodData.length >= 14) {
    const prev7 = moodData.slice(0, 7).map(d => d.mood ?? 0);
    const last7 = moodData.slice(7, 14).map(d => d.mood ?? 0);
    const prevAvg = prev7.reduce((a, b) => a + b, 0) / 7;
    const lastAvg = last7.reduce((a, b) => a + b, 0) / 7;
    if (prevAvg > 0) {
      moodImprovementPercent = Math.round(((lastAvg - prevAvg) / prevAvg) * 100);
    } else {
      moodImprovementPercent = 0;
    }
  }
  // Calculate current streak (consecutive days with mood logged)
  let currentStreak = 0;
  for (let i = moodData.length - 1; i >= 0; i--) {
    if (typeof moodData[i].mood === 'number') {
      currentStreak++;
    } else {
      break;
    }
  }

  // Fetch mood logs for the last 7 days
  useEffect(() => {
    if (!user) return;
    setMoodLoading(true);
    setMoodError(null);
    const fetchMoodLogs = async () => {
      try {
        const res = await fetch(`/api/mood-insights/history?userId=${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch mood logs');
        const { moods, average_mood, error } = await res.json();
        if (error) throw new Error(error);
        setAverageMood(average_mood);
        console.log('Mood API Response:', { moods, average_mood });
        // Build last 7 days array
        const days = Array.from({ length: 7 }).map((_, i) => {
          const date = subDays(new Date(), 6 - i);
          const dayLabel = format(date, 'EEE');
          const dateStr = format(date, 'yyyy-MM-dd');
          console.log(`Checking date ${dateStr} for day ${dayLabel}`);
          const entry = moods?.find((d: any) => d.logged_at && d.logged_at.slice(0, 10) === dateStr);
          console.log(`Found entry for ${dateStr}:`, entry);
          return { day: dayLabel, mood: entry ? entry.mood_score : null };
        });
        console.log('Final moodData:', days);
        setMoodData(days);
      } catch (err: any) {
        setMoodError(err.message || 'Could not load mood data');
      } finally {
        setMoodLoading(false);
      }
    };
    fetchMoodLogs();
  }, [user]);

  // Fetch weekly mood analysis
  const fetchWeeklyAnalysis = async () => {
    if (!user) return;
    setWeeklyLoading(true);
    setWeeklyError(null);
    try {
      const res = await fetch(`/api/mood-analysis/weekly?userId=${user.id}`);
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 404) {
          setWeeklyError(errorData.suggestion || 'No weekly data available');
        } else {
          throw new Error(errorData.error || 'Failed to fetch weekly analysis');
        }
        return;
      }
      const data = await res.json();
      setWeeklyAnalysis(data.analysis);
      setWeeklyStats(data.statistics);
    } catch (err: any) {
      setWeeklyError(err.message || 'Could not load weekly analysis');
    } finally {
      setWeeklyLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyAnalysis();
  }, [user]);

  // Map mood to score
  const moodToScore = (mood: "happy" | "neutral" | "sad") => {
    switch (mood) {
      case "happy": return 8;
      case "neutral": return 5;
      case "sad": return 2;
      default: return 5;
    }
  };

  // Utility function to properly display error objects
  const logError = (prefix: string, error: any) => {
    console.log(`${prefix} - Message:`, error?.message || 'No message');
    console.log(`${prefix} - Details:`, error?.details || 'No details');
    console.log(`${prefix} - Hint:`, error?.hint || 'No hint');
    console.log(`${prefix} - Code:`, error?.code || 'No code');
    console.log(`${prefix} - Stack:`, error?.stack || 'No stack');
    console.log(`${prefix} - Name:`, error?.name || 'No name');
    console.log(`${prefix} - Full object:`, error);
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching user profile for:', user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('🔍 User profile result:', { profile, error });

        if (error) {
          console.error('❌ Error fetching user profile:', error);
          setError('Failed to load profile data');
        } else {
          console.log('✅ User profile loaded:', profile);
          setUserProfile(profile);
        }
      } catch (err) {
        console.error('❌ Unexpected error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch available therapists
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            bio,
            avatar_url,
            therapists(
              specialization
            )
          `)
          .eq('role', 'therapist')
          .not('first_name', 'is', null);

        if (error) {
          console.error('Error fetching therapists:', error);
        } else {
          const therapistData = data?.map(profile => ({
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            specialization: profile.therapists?.[0]?.specialization || 'General Therapy',
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            rating: 4.5 + Math.random() * 0.5 // Mock rating
          })) || [];
          setTherapists(therapistData);
        }
      } catch (err) {
        console.error('Error fetching therapists:', err);
      }
    };

    fetchTherapists();
  }, []);

  const handleLogMood = async () => {
    if (!selectedMoodScore) return;
    setLoading(true);
    setError(null);
    setInsight(null);
    setMoodLogSuccess(null);

    try {
      // 1. Get Supabase session (to optionally use access_token)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("session", session);
      // 2. Build headers safely
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(session?.access_token && {
          Authorization: `Bearer ${session.access_token}`,
        }),
      };

      // 3. First, log the mood to the database
      const moodRes = await fetch('/api/mood-insights', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          mood_score: selectedMoodScore,
          notes: moodNotes,
        }),
      });

      // 4. Handle mood logging response
      if (!moodRes.ok) {
        const errorData = await moodRes.json();
        console.error('Mood API error:', errorData);
        setError(errorData.error || 'Failed to log mood');
        return;
      }

      // 5. Get Gemini suggestions
      const geminiRes = await fetch('/api/mood-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_score: selectedMoodScore,
          notes: moodNotes,
        }),
      });

      // 6. Handle Gemini response
      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        setMoodLogSuccess('Mood logged successfully!');
        setInsight(geminiData.reflection || 'No suggestions available');
      } else {
        // If Gemini fails, still show success for mood logging but with a fallback message
        setMoodLogSuccess('Mood logged!');
        setInsight('Mood logged successfully. Check back later for personalized insights.');
      }

      setSelectedMoodScore(null);
      setMoodNotes("");
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    } else if (userProfile?.first_name) {
      return userProfile.first_name;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    } else if (userProfile?.first_name) {
      return userProfile.first_name[0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const filteredTherapists = therapists.filter(therapist =>
    therapist.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Utility function to get therapist name by ID
  const getTherapistName = (therapistId: string) => {
    const therapist = therapists.find(t => t.id === therapistId);
    if (therapist) {
      return `${therapist.first_name} ${therapist.last_name}`;
    }
    return 'Unknown Therapist';
  };

  // Utility function to get therapist specialization by ID
  const getTherapistSpecialization = (therapistId: string) => {
    const therapist = therapists.find(t => t.id === therapistId);
    return therapist?.specialization || 'General Therapy';
  };

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const res = await fetch(`/api/notifications?user_id=${user.id}`);
      if (res.ok) {
        const { notifications } = await res.json();
        setNotifications(notifications);
        setUnreadCount(notifications.filter((n: any) => !n.read).length);
      }
    };
    fetchNotifications();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, mark_all: true })
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markOneAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: id })
    });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-8 py-16 max-w-7xl">
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Profile Not Found</h2>
              <p className="text-slate-600 mb-6">
                We couldn't load your user profile. This might be because:
              </p>
              <ul className="text-slate-600 text-left max-w-md mx-auto mb-6 space-y-2">
                <li>• Your profile hasn't been set up yet</li>
                <li>• There's a database connection issue</li>
                <li>• You need to complete your registration</li>
              </ul>
              <Button
                onClick={() => router.push('/setup-profile')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Complete Profile Setup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-indigo-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 lg:px-8 py-2 lg:py-3">
          {/* Left: Logo and Brand */}
          <div className="flex items-center gap-3 lg:gap-4 ml-2 lg:ml-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg">
                <Heart className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </span>
              <span className="text-xl lg:text-2xl font-bold text-indigo-800">
                MindMend
              </span>
            </div>
          </div>

          {/* Center: Page Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-lg lg:text-xl font-semibold text-indigo-700">
              User Dashboard
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Notifications Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-indigo-600 p-2 relative">
                  <Bell className="h-5 w-5 lg:h-6 lg:w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/30 backdrop-blur-sm border border-indigo-200 shadow-xl" align="end">
                <div className="p-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-indigo-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-indigo-600">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-indigo-400" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-indigo-100">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 cursor-pointer hover:bg-indigo-50/50 transition-colors ${!notification.read ? 'bg-gradient-to-r from-indigo-50 to-pink-50' : ''
                            }`}
                          onClick={() => markOneAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-indigo-500' : 'bg-indigo-300'
                              }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-indigo-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-indigo-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-indigo-400 mt-2">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className="p-3 border-t border-indigo-200 bg-gradient-to-r from-indigo-50 to-pink-50">
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-600 p-2"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-10 w-10 lg:h-10 lg:w-10" />
            </Button>

            {/* Profile Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <Avatar className="h-8 w-8 lg:h-10 lg:w-10 cursor-pointer">
                    <AvatarImage src={userProfile.avatar_url} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm lg:text-base">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0 bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/30 backdrop-blur-sm border border-indigo-200 shadow-xl" align="end">
                <div className="p-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-pink-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile.avatar_url} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-indigo-900">{getDisplayName()}</p>
                      <p className="text-sm text-indigo-600">{userProfile.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-indigo-50/50"
                    onClick={() => router.push('/setup-profile')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50/50"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push('/login');
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="container mx-auto px-4 lg:px-8 py-6 lg:py-12 max-w-7xl">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 lg:p-8 border border-indigo-100 shadow-sm mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-16 w-16 lg:h-20 lg:w-20 border-4 border-white shadow-lg">
                <AvatarImage src={userProfile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-pink-500 text-white text-lg lg:text-xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-indigo-800 mb-2">
                {getGreeting()}, {getDisplayName()}! 👋
              </h1>
              <p className="text-base lg:text-lg text-indigo-600 mb-3">
                Welcome back to your wellness journey. Here's what's happening today.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-3 py-1 text-sm font-medium">
                  Wellness Member
                </Badge>
                <Badge className="bg-white/80 text-indigo-700 px-3 py-1 text-sm font-medium border border-indigo-200">
                  Member since {new Date(userProfile.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-7xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 rounded-xl bg-white/70 backdrop-blur p-1 h-12 lg:h-14">
            <TabsTrigger value="overview" className="rounded-lg text-sm lg:text-base font-medium">Overview</TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-lg text-sm lg:text-base font-medium">Appointments</TabsTrigger>
            <TabsTrigger value="therapists" className="rounded-lg text-sm lg:text-base font-medium">Find Therapists</TabsTrigger>
            <TabsTrigger value="mood" className="rounded-lg text-sm lg:text-base font-medium">Mood Tracking</TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg text-sm lg:text-base font-medium">Progress</TabsTrigger>
          </TabsList>

          {/* ── Overview tab ── */}
          <TabsContent value="overview" className="space-y-6 lg:space-y-8">
            <div className="grid gap-6 lg:gap-8 xl:grid-cols-3">
              {/* Left (2 cols on large screens, 1 col on smaller) */}
              <div className="space-y-6 lg:space-y-8 xl:col-span-2">
                {/* Quick stats */}
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {sessionCountsLoading ? (
                    <div className="col-span-4 flex justify-center items-center h-20">
                      <span className="text-slate-600 text-base">Loading session stats...</span>
                    </div>
                  ) : sessionCountsError ? (
                    <div className="col-span-4 flex justify-center items-center h-20">
                      <span className="text-red-600 text-base">{sessionCountsError}</span>
                    </div>
                  ) : ([
                    {
                      icon: Calendar,
                      value: sessionCountsLoading ? "..." : (upcomingCount === null ? "0" : upcomingCount),
                      label: "Upcoming Sessions",
                    },
                    {
                      icon: Users,
                      value: sessionCountsLoading ? "..." : (completedCount === null ? "0" : completedCount),
                      label: "Completed Sessions",
                    },
                    {
                      icon: Star,
                      value: moodLoading ? "..." : (averageMood !== null ? averageMood.toFixed(1) : "0"),
                      label: "Mood Score",
                    },
                    {
                      icon: Clock,
                      value: sessionCountsLoading ? "..." : (todayCount === null ? "0" : todayCount),
                      label: "Today's Appointments",
                    },
                  ].map(({ icon: Icon, value, label }) => (
                    <Card
                      key={label}
                      className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="flex items-center gap-3 p-4 lg:p-5">
                        <span className="flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-full bg-indigo-100">
                          <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                        </span>
                        <div>
                          <p className={`text-xl lg:text-2xl font-bold mb-1 ${label === "Mood Score" && averageMood !== null
                              ? averageMood >= 4 ? 'text-green-600'
                                : averageMood >= 3 ? 'text-yellow-600'
                                  : 'text-red-600'
                              : 'text-indigo-800'
                            }`}>
                            {value}
                          </p>
                          <p className="text-xs lg:text-sm text-slate-600 font-medium">{label}</p>
                          {label === "Mood Score" && (
                            <div className="space-y-1 mt-1">
                              <div className="flex items-center gap-1">
                                <p className="text-xs text-slate-500">out of 5</p>
                                {averageMood !== null && (
                                  <span className={`text-xs px-1 py-0.5 rounded ${averageMood >= 4 ? 'bg-green-100 text-green-700'
                                      : averageMood >= 3 ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                    {averageMood >= 4 ? 'Great' : averageMood >= 3 ? 'Good' : 'Needs attention'}
                                  </span>
                                )}
                              </div>
                              {moodData.filter(d => typeof d.mood === 'number').length > 0 && (
                                <p className="text-xs text-slate-400">
                                  Based on {moodData.filter(d => typeof d.mood === 'number').length} days
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )))}
                </div>

                {/* Quick Mood Check */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-4 lg:pb-6">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                      <Heart className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      How are you feeling today?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 lg:space-y-6">
                    <div className="flex flex-wrap justify-center gap-2 lg:gap-3">
                      {[...Array(5)].map((_, i) => {
                        const score = i + 1;
                        const isSelected = selectedMoodScore === score;
                        // Use a neutral background and colored border for each mood
                        const borderColor =
                          score === 1
                            ? "border-red-300"
                            : score === 2
                              ? "border-orange-300"
                              : score === 3
                                ? "border-yellow-300"
                                : score === 4
                                  ? "border-green-300"
                                  : "border-emerald-300";
                        const ringColor = isSelected ? "ring-4 ring-indigo-400 scale-110" : "";
                        return (
                          <button
                            key={score}
                            type="button"
                            className={`w-12 h-16 lg:w-14 lg:h-20 rounded-xl font-bold flex flex-col items-center justify-center border-2 bg-gray-50 hover:bg-purple-100 transition-all duration-150 focus:outline-none text-lg lg:text-xl ${borderColor} ${ringColor}`}
                            onClick={() => setSelectedMoodScore(score)}
                            aria-label={`Mood score ${score}`}
                          >
                            <span className="mb-1">{MoodFaces[i]()}</span>
                            <span className="text-xs lg:text-sm">{score}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-center space-y-4">
                      <div>
                        <Label htmlFor="mood-notes" className="block text-left mb-2 text-slate-700 font-medium">Notes (optional)</Label>
                        <Textarea
                          id="mood-notes"
                          value={moodNotes}
                          onChange={e => setMoodNotes(e.target.value)}
                          placeholder="Add any notes about your mood today..."
                          className="mb-4 min-h-[60px]"
                          maxLength={300}
                        />
                      </div>
                      <Button
                        className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white px-6 py-2 lg:px-8 lg:py-3 text-base lg:text-lg"
                        onClick={handleLogMood}
                        disabled={loading || !selectedMoodScore}
                      >
                        {loading ? "Logging..." : "Log My Mood"}
                      </Button>
                      {moodLogSuccess && (
                        <div className="p-4 bg-green-50 rounded-lg text-green-800 border border-green-100">
                          <p className="font-medium">✅ {moodLogSuccess}</p>
                        </div>
                      )}
                      {insight && (
                        <div className="p-4 bg-indigo-50 rounded-lg text-indigo-800 border border-indigo-100">
                          <p className="font-medium">💡 Insight:</p>
                          <p>{insight}</p>
                        </div>
                      )}
                      {error && (
                        <div className="p-4 bg-red-50 rounded-lg text-red-800 border border-red-100">
                          <p className="font-medium">⚠️ Error:</p>
                          <p>{error}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Mood Tracking Card (Mood Trends) */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-4 lg:pb-6">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                      <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      Your Mood This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {moodLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : moodError ? (
                      <div className="text-center text-red-600">{moodError}</div>
                    ) : (
                      <>
                        <div className="flex items-end justify-between h-32 lg:h-40 space-x-2">
                          {moodData.map((data, index) => {
                            const maxHeight = 120; // 120px max height
                            const height = typeof data.mood === 'number' ? (data.mood / 5) * maxHeight : 20;
                            const minHeight = typeof data.mood === 'number' ? Math.max(height, 20) : 20;
                            return (
                              <div key={index} className="flex flex-col items-center space-y-2 lg:space-y-3 flex-1">
                                <div
                                  className={`w-full rounded-t-lg transition-all duration-300 border-2 border-purple-500 ${typeof data.mood === 'number' ? 'bg-gradient-to-t from-indigo-400 to-pink-400' : 'bg-slate-200'}`}
                                  style={{
                                    height: `${minHeight}px`,
                                    backgroundColor: typeof data.mood === 'number' ? '#8b5cf6' : '#e2e8f0'
                                  }}
                                />
                                <span className="text-xs lg:text-sm text-slate-600 font-medium">{data.day}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 lg:mt-6 flex items-center justify-between text-xs lg:text-sm text-slate-600">
                          <span className="font-medium">
                            Average: {averageMood !== null ? averageMood.toFixed(2) : '--'}/5
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6 lg:space-y-8">
                {/* Upcoming Appointments */}
                <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4 lg:pb-6">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      </div>
                      Upcoming Sessions
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Your next therapy appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AppointmentsList
                      showUpcoming={true}
                      showPast={false}
                      limit={5}
                      showCard={false}
                      title=""
                      description=""
                      onViewAll={() => setActiveTab('appointments')}
                      statusFilter={["upcoming", "scheduled", "completed"]}
                    />

                    {/* Quick action button */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        onClick={() => setActiveTab('appointments')}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        View All Appointments
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        onClick={() => router.push('/dashboard/book-session')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Book New Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Summary */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-4 lg:pb-6">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                      <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 lg:space-y-6">
                    {/* Mood Improvement */}
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs lg:text-sm text-slate-600">Mood Improvement</span>
                        <span className="text-xs lg:text-sm font-medium">
                          {averageMood !== null ? Math.round((averageMood / 5) * 100) : 0}%
                        </span>
                      </div>
                      <Progress value={averageMood !== null ? (averageMood / 5) * 100 : 0} className="h-2 lg:h-3" />
                    </div>
                    {/* Sessions Completed */}
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs lg:text-sm text-slate-600">Sessions Completed</span>
                        <span className="text-xs lg:text-sm font-medium">{completedCount || 0}</span>
                      </div>
                      <Progress value={Math.min((completedCount || 0) * 20, 100)} className="h-2 lg:h-3" />
                    </div>
                    {/* Mood Tracking Streak */}
                    <div className="pt-3 lg:pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-slate-600">Mood Tracking Streak</span>
                        <Badge className="bg-orange-100 text-orange-700">
                          {moodData.filter(d => typeof d.mood === 'number').length} days
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-4 lg:pb-6">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                      <Plus className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 lg:space-y-4">
                    <Button
                      variant="outline"
                      className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-sm lg:text-base"
                      onClick={() => setActiveTab('therapists')}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Find Therapists
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-sm lg:text-base"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Self-Help Library
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Appointments tab ── */}
          <TabsContent value="appointments" className="space-y-6 lg:space-y-8">
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                      <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      All Appointments
                    </CardTitle>
                    <CardDescription>View and manage your therapy sessions</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push('/dashboard/book-session')}
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white"
                  >
                    Book a Session
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="status-filter" className="text-sm font-medium text-slate-700">Status:</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger id="status-filter" className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="date-filter" className="text-sm font-medium text-slate-700">Date:</Label>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                          <SelectTrigger id="date-filter" className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="past">Past</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Appointments List */}
                  <AppointmentsList
                    showUpcoming={true}
                    showPast={true}
                    title=""
                    description=""
                    showCard={false}
                    statusFilter={statusFilter !== "all" ? [statusFilter] : undefined}
                    dateFilter={dateFilter}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Find Therapists tab ── */}
          <TabsContent value="therapists" className="space-y-6 lg:space-y-8">
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                  <Search className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                  Find a Therapist
                </CardTitle>
                <CardDescription>Connect with qualified mental health professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 lg:space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Search by name or specialization..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base lg:text-lg"
                    />
                  </div>

                  <div className="grid gap-4 lg:gap-6">
                    {filteredTherapists.map((therapist) => (
                      <div key={therapist.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 lg:p-6 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <Avatar className="w-16 h-16 flex-shrink-0">
                          <AvatarImage src={therapist.avatar_url} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl">
                            {therapist.first_name[0]}{therapist.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg lg:text-xl font-semibold text-indigo-800 mb-2">
                            Dr. {therapist.first_name} {therapist.last_name}
                          </h3>
                          <p className="text-slate-600 mb-2">{therapist.specialization}</p>
                          {therapist.bio && (
                            <p className="text-slate-500 text-sm mb-3 line-clamp-2">{therapist.bio}</p>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-slate-600">{therapist.rating?.toFixed(1)}</span>
                            </div>
                            <Badge className="bg-green-100 text-green-700 w-fit">Available</Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => router.push(`/dashboard/book-session?therapist=${therapist.id}`)}
                          className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white px-6 py-2 lg:px-8 lg:py-3 text-base lg:text-lg"
                        >
                          Book Session
                        </Button>
                      </div>
                    ))}
                  </div>

                  {filteredTherapists.length === 0 && searchQuery && (
                    <div className="text-center py-8 lg:py-12">
                      <Search className="h-12 w-12 lg:h-16 lg:w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-base lg:text-lg font-semibold text-slate-800 mb-2">No therapists found</h3>
                      <p className="text-slate-600">Try adjusting your search terms.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Mood Tracking tab ── */}
          <TabsContent value="mood" className="space-y-6 lg:space-y-8">
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                  <Heart className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                  Mood Tracking & Insights
                </CardTitle>
                <CardDescription>Track your emotional patterns and get personalized insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 lg:space-y-8">
                  {/* Mood Chart (Bar Graph) */}
                  <div className="bg-slate-50 rounded-xl p-4 lg:p-6">
                    <h3 className="text-base lg:text-lg font-semibold text-indigo-800 mb-4">Weekly Mood Chart</h3>
                    {moodLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : moodError ? (
                      <div className="text-center text-red-600">{moodError}</div>
                    ) : (
                      <div className="flex items-end justify-between h-32 lg:h-48 space-x-2">
                        {moodData.map((data, index) => {
                          const maxHeight = 120; // 120px max height
                          const height = typeof data.mood === 'number' ? (data.mood / 5) * maxHeight : 20;
                          const minHeight = typeof data.mood === 'number' ? Math.max(height, 20) : 20;
                          console.log(`Bar ${index} (${data.day}): mood=${data.mood}, height=${height}px, minHeight=${minHeight}px`);
                          return (
                            <div key={index} className="flex flex-col items-center space-y-2 lg:space-y-3 flex-1">
                              <div
                                className={`w-full rounded-t-lg transition-all duration-300 ${typeof data.mood === 'number' ? 'bg-gradient-to-t from-indigo-400 to-pink-400' : 'bg-slate-200'}`}
                                style={{ height: `${minHeight}px` }}
                              />
                              <span className="text-xs lg:text-sm text-slate-600 font-medium">{data.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Weekly Mood Analysis */}
                  <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-indigo-800 text-lg lg:text-xl">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                          AI Weekly Analysis
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={fetchWeeklyAnalysis}
                          disabled={weeklyLoading}
                          className="text-indigo-600 hover:bg-indigo-100"
                        >
                          {weeklyLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </Button>
                      </CardTitle>
                      <CardDescription>Personalized insights and recommendations based on your mood patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {weeklyLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : weeklyError ? (
                        <div className="text-center p-6">
                          <div className="text-slate-500 mb-2">{weeklyError}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.reload()}
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : weeklyAnalysis ? (
                        <div className="space-y-4">
                          {/* Weekly Statistics */}
                          {weeklyStats && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-white/60 rounded-lg border border-indigo-100">
                              <div className="text-center">
                                <div className="text-lg font-semibold text-blue-700">{weeklyStats.averageMood}/5</div>
                                <div className="text-xs text-slate-600">Avg Mood</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-purple-700">{weeklyStats.daysTracked}/7</div>
                                <div className="text-xs text-slate-600">Days Tracked</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-pink-700">{weeklyStats.consistency}%</div>
                                <div className="text-xs text-slate-600">Consistency</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-indigo-700">{weeklyStats.moodVariance}</div>
                                <div className="text-xs text-slate-600">Variance</div>
                              </div>
                            </div>
                          )}

                          {/* AI Analysis */}
                          <div className="bg-white/80 rounded-xl p-6 border border-indigo-100 shadow-sm">
                            <div className="space-y-6">
                              {weeklyAnalysis.split('\n\n').map((section, index) => {
                                const lines = section.split('\n');
                                const title = lines[0];
                                const content = lines.slice(1).join('\n');

                                // Minimal theme colors: pink, purple, blue
                                const sectionStyles = {
                                  'Mood Summary': {
                                    text: 'text-blue-800'
                                  },
                                  'Key Insights': {
                                    text: 'text-purple-800'
                                  },
                                  'Recommendations': {
                                    text: 'text-pink-800'
                                  },
                                  'Encouragement': {
                                    text: 'text-indigo-800'
                                  }
                                };

                                const styles = sectionStyles[title as keyof typeof sectionStyles] || {
                                  text: 'text-slate-800'
                                };

                                return (
                                  <div key={index}>
                                    <h4 className={`font-semibold text-lg mb-3 ${styles.text}`}>
                                      {title}
                                    </h4>
                                    <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                                      {content.split('\n').map((line, lineIndex) => {
                                        if (line.trim().startsWith('•')) {
                                          return (
                                            <div key={lineIndex} className="flex items-start gap-3">
                                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                                              <span>{line.replace('•', '').trim()}</span>
                                            </div>
                                          );
                                        }
                                        return (
                                          <p key={lineIndex}>{line}</p>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 text-slate-500">
                          No weekly analysis available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Mood Insights */}
                  <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
                    <Card className="border-green-100 bg-green-50/50">
                      <CardContent className="p-4 lg:p-6">
                        <h4 className="font-semibold text-green-800 mb-2">Positive Trends</h4>
                        <ul className="text-xs lg:text-sm text-green-700 space-y-1">
                          <li>• Your mood improved by 15% this week</li>
                          <li>• Consistent sleep patterns detected</li>
                          <li>• Increased social activity noted</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-100 bg-blue-50/50">
                      <CardContent className="p-4 lg:p-6">
                        <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
                        <ul className="text-xs lg:text-sm text-blue-700 space-y-1">
                          <li>• Try meditation for stress relief</li>
                          <li>• Consider scheduling a session</li>
                          <li>• Practice gratitude journaling</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-100 bg-blue-50/60 shadow-md mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-800 text-lg lg:text-xl">
                  <Video className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                  Personalized Calming Videos
                </CardTitle>
                <CardDescription>Curated for your current mood</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.id && <PersonalizedVideos userId={user.id} />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Progress tab ── */}
          <TabsContent value="progress" className="space-y-6 lg:space-y-8">
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
              {/* Progress Overview */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                    <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-slate-600">Mood Improvement</span>
                      <span className="text-xs lg:text-sm font-medium">
                        {averageMood !== null ? Math.round((averageMood / 5) * 100) : 0}%
                      </span>
                    </div>
                    <Progress value={averageMood !== null ? (averageMood / 5) * 100 : 0} className="h-2 lg:h-3" />
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-slate-600">Sessions Completed</span>
                      <span className="text-xs lg:text-sm font-medium">{completedCount || 0}</span>
                    </div>
                    <Progress value={Math.min((completedCount || 0) * 20, 100)} className="h-2 lg:h-3" />
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-slate-600">Mood Tracking Streak</span>
                      <span className="text-xs lg:text-sm font-medium">
                        {moodData.filter(d => typeof d.mood === 'number').length} days
                      </span>
                    </div>
                    <Progress value={Math.min((moodData.filter(d => typeof d.mood === 'number').length / 7) * 100, 100)} className="h-2 lg:h-3" />
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-slate-600">Overall Wellness Score</span>
                      <span className="text-xs lg:text-sm font-medium">
                        {averageMood !== null ? Math.round((averageMood / 5) * 100) : 0}%
                      </span>
                    </div>
                    <Progress value={averageMood !== null ? (averageMood / 5) * 100 : 0} className="h-2 lg:h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Mood Trends Analysis */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                    <Heart className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                    Mood Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-slate-600">Average Mood This Week</span>
                      <span className="text-xs lg:text-sm font-medium">
                        {averageMood !== null ? averageMood.toFixed(1) : '--'}/5
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-slate-600">Best Day</span>
                      <span className="text-xs lg:text-sm font-medium">
                        {moodData.length > 0 ?
                          moodData.reduce((max, day) =>
                            (typeof day.mood === 'number' && day.mood > (typeof max.mood === 'number' ? max.mood : 0)) ? day : max
                          ).day : '--'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-slate-600">Days Tracked</span>
                      <span className="text-xs lg:text-sm font-medium">
                        {moodData.filter(d => typeof d.mood === 'number').length}/7
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 lg:pt-4 border-t border-slate-200">
                    <h4 className="font-semibold text-indigo-800 mb-2 text-sm lg:text-base">This Week's Pattern</h4>
                    <div className="flex space-x-1">
                      {moodData.map((day, index) => (
                        <div
                          key={index}
                          className={`flex-1 h-8 rounded ${typeof day.mood === 'number'
                              ? day.mood >= 4 ? 'bg-green-400'
                                : day.mood >= 3 ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              : 'bg-slate-200'
                            }`}
                          title={`${day.day}: ${day.mood || 'No data'}/5`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Mon</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements Section */}
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                  <Star className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                  Achievements & Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* First Session Achievement */}
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${(completedCount || 0) >= 1 ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'
                    }`}>
                    <CheckCircle className={`w-4 h-4 lg:w-5 lg:h-5 ${(completedCount || 0) >= 1 ? 'text-green-600' : 'text-slate-400'
                      }`} />
                    <div>
                      <p className={`font-medium text-sm lg:text-base ${(completedCount || 0) >= 1 ? 'text-green-800' : 'text-slate-600'
                        }`}>First Session</p>
                      <p className={`text-xs lg:text-sm ${(completedCount || 0) >= 1 ? 'text-green-600' : 'text-slate-500'
                        }`}>Complete your first therapy session</p>
                    </div>
                  </div>

                  {/* Mood Tracker Achievement */}
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${moodData.filter(d => typeof d.mood === 'number').length >= 7 ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'
                    }`}>
                    <CheckCircle className={`w-4 h-4 lg:w-5 lg:h-5 ${moodData.filter(d => typeof d.mood === 'number').length >= 7 ? 'text-blue-600' : 'text-slate-400'
                      }`} />
                    <div>
                      <p className={`font-medium text-sm lg:text-base ${moodData.filter(d => typeof d.mood === 'number').length >= 7 ? 'text-blue-800' : 'text-slate-600'
                        }`}>Mood Tracker</p>
                      <p className={`text-xs lg:text-sm ${moodData.filter(d => typeof d.mood === 'number').length >= 7 ? 'text-blue-600' : 'text-slate-500'
                        }`}>Log mood for 7 consecutive days</p>
                    </div>
                  </div>

                  {/* Consistent Achievement */}
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${(completedCount || 0) >= 3 ? 'bg-purple-50 border border-purple-200' : 'bg-slate-50 border border-slate-200'
                    }`}>
                    <CheckCircle className={`w-4 h-4 lg:w-5 lg:h-5 ${(completedCount || 0) >= 3 ? 'text-purple-600' : 'text-slate-400'
                      }`} />
                    <div>
                      <p className={`font-medium text-sm lg:text-base ${(completedCount || 0) >= 3 ? 'text-purple-800' : 'text-slate-600'
                        }`}>Consistent</p>
                      <p className={`text-xs lg:text-sm ${(completedCount || 0) >= 3 ? 'text-purple-600' : 'text-slate-500'
                        }`}>Attend 3 sessions</p>
                    </div>
                  </div>

                  {/* High Mood Achievement */}
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${averageMood !== null && averageMood >= 4 ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50 border border-slate-200'
                    }`}>
                    <CheckCircle className={`w-4 h-4 lg:w-5 lg:h-5 ${averageMood !== null && averageMood >= 4 ? 'text-yellow-600' : 'text-slate-400'
                      }`} />
                    <div>
                      <p className={`font-medium text-sm lg:text-base ${averageMood !== null && averageMood >= 4 ? 'text-yellow-800' : 'text-slate-600'
                        }`}>Positive Vibes</p>
                      <p className={`text-xs lg:text-sm ${averageMood !== null && averageMood >= 4 ? 'text-yellow-600' : 'text-slate-500'
                        }`}>Maintain high mood average</p>
                    </div>
                  </div>

                  {/* Progress Maker Achievement */}
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${(completedCount || 0) >= 5 ? 'bg-indigo-50 border border-indigo-200' : 'bg-slate-50 border border-slate-200'
                    }`}>
                    <CheckCircle className={`w-4 h-4 lg:w-5 lg:h-5 ${(completedCount || 0) >= 5 ? 'text-indigo-600' : 'text-slate-400'
                      }`} />
                    <div>
                      <p className={`font-medium text-sm lg:text-base ${(completedCount || 0) >= 5 ? 'text-indigo-800' : 'text-slate-600'
                        }`}>Progress Maker</p>
                      <p className={`text-xs lg:text-sm ${(completedCount || 0) >= 5 ? 'text-indigo-600' : 'text-slate-500'
                        }`}>Complete 5 sessions</p>
                    </div>
                  </div>

                  {/* Wellness Warrior Achievement */}
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${moodData.filter(d => typeof d.mood === 'number').length >= 7 && (completedCount || 0) >= 3 ? 'bg-pink-50 border border-pink-200' : 'bg-slate-50 border border-slate-200'
                    }`}>
                    <CheckCircle className={`w-4 h-4 lg:w-5 lg:h-5 ${moodData.filter(d => typeof d.mood === 'number').length >= 7 && (completedCount || 0) >= 3 ? 'text-pink-600' : 'text-slate-400'
                      }`} />
                    <div>
                      <p className={`font-medium text-sm lg:text-base ${moodData.filter(d => typeof d.mood === 'number').length >= 7 && (completedCount || 0) >= 3 ? 'text-pink-800' : 'text-slate-600'
                        }`}>Wellness Warrior</p>
                      <p className={`text-xs lg:text-sm ${moodData.filter(d => typeof d.mood === 'number').length >= 7 && (completedCount || 0) >= 3 ? 'text-pink-600' : 'text-slate-500'
                        }`}>Track mood & attend sessions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights & Recommendations */}
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                  <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                  Personalized Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
                  <div className="space-y-3 lg:space-y-4">
                    <h4 className="font-semibold text-indigo-800 text-sm lg:text-base">Your Progress</h4>
                    <ul className="text-xs lg:text-sm text-slate-600 space-y-2">
                      {averageMood !== null && averageMood >= 4 && (
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Great mood stability this week!</span>
                        </li>
                      )}
                      {moodData.filter(d => typeof d.mood === 'number').length >= 5 && (
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Consistent mood tracking habit</span>
                        </li>
                      )}
                      {(completedCount || 0) >= 1 && (
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Active therapy engagement</span>
                        </li>
                      )}
                      {averageMood !== null && averageMood < 3 && (
                        <li className="flex items-center space-x-2">
                          <AlertCircle className="w-3 h-3 text-orange-500" />
                          <span>Consider scheduling a session</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <h4 className="font-semibold text-indigo-800 text-sm lg:text-base">Recommendations</h4>
                    <ul className="text-xs lg:text-sm text-slate-600 space-y-2">
                      {moodData.filter(d => typeof d.mood === 'number').length < 7 && (
                        <li className="flex items-center space-x-2">
                          <Plus className="w-3 h-3 text-blue-500" />
                          <span>Log your mood daily for better insights</span>
                        </li>
                      )}
                      {(completedCount || 0) === 0 && (
                        <li className="flex items-center space-x-2">
                          <Plus className="w-3 h-3 text-blue-500" />
                          <span>Book your first therapy session</span>
                        </li>
                      )}
                      {averageMood !== null && averageMood < 3 && (
                        <li className="flex items-center space-x-2">
                          <Plus className="w-3 h-3 text-blue-500" />
                          <span>Try meditation or deep breathing exercises</span>
                        </li>
                      )}
                      <li className="flex items-center space-x-2">
                        <Plus className="w-3 h-3 text-blue-500" />
                        <span>Practice gratitude journaling</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 