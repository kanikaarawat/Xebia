"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AppointmentsList from "@/components/booking/AppointmentsList";

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

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [currentMood, setCurrentMood] = useState<"happy" | "neutral" | "sad" | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  const moodData = [
    { day: "Mon", mood: 7 },
    { day: "Tue", mood: 6 },
    { day: "Wed", mood: 8 },
    { day: "Thu", mood: 5 },
    { day: "Fri", mood: 7 },
    { day: "Sat", mood: 9 },
    { day: "Sun", mood: 8 },
  ];

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
    if (!currentMood) return;
    setLoading(true);
    setError(null);
    setInsight(null);
    try {
      const res = await fetch("/api/mood-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood_score: moodToScore(currentMood) }),
      });
      if (!res.ok) throw new Error("Failed to fetch insight");
      const data = await res.json();
      setInsight(data.message);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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

  if (authLoading || profileLoading) {
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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100">
        <div className="container mx-auto flex items-center justify-between px-4 lg:px-8 py-4 lg:py-5">
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500">
              <Heart className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </span>
            <span className="text-lg lg:text-2xl font-semibold text-indigo-700">
              MindMend
            </span>
            <Badge className="ml-2 lg:ml-3 bg-indigo-100 text-indigo-700 px-2 py-1 lg:px-3 lg:py-1 text-xs lg:text-sm">
              User Portal
            </Badge>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="ghost" size="sm" className="text-indigo-600 p-2">
              <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-indigo-600 p-2">
              <Settings className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
              <AvatarImage src={userProfile.avatar_url} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm lg:text-base">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="container mx-auto space-y-8 lg:space-y-12 px-4 lg:px-8 py-8 lg:py-16 max-w-7xl">
        <section className="space-y-4 lg:space-y-6">
          <div className="space-y-2 lg:space-y-3">
            <h1 className="text-2xl lg:text-4xl font-bold text-indigo-800 leading-tight">
              {getGreeting()}, {getDisplayName()}!
            </h1>
            <p className="text-base lg:text-lg text-slate-600">
              Here's a snapshot of your wellness journey.
            </p>
          </div>
          
          {/* User Info Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-lg">
            <CardContent className="p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4 lg:gap-6">
                <Avatar className="h-16 w-16 lg:h-20 lg:w-20">
                  <AvatarImage src={userProfile.avatar_url} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg lg:text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3 lg:space-y-4">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-semibold text-indigo-800 mb-2">
                      {getDisplayName()}
                    </h3>
                    <p className="text-slate-600 text-base lg:text-lg">{userProfile.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    <Badge className="bg-blue-100 text-blue-700 px-3 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm">
                      Wellness Member
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 px-3 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm">
                      Active Since {new Date(userProfile.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  {userProfile.bio && (
                    <p className="text-slate-600 text-sm lg:text-base leading-relaxed">{userProfile.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 lg:space-y-8"
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
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      icon: Calendar,
                      value: "7",
                      label: "Upcoming Sessions",
                    },
                    {
                      icon: Users,
                      value: "5",
                      label: "Completed Sessions",
                    },
                    {
                      icon: Star,
                      value: "7.1",
                      label: "Avg Mood Score",
                    },
                  ].map(({ icon: Icon, value, label }) => (
                    <Card
                      key={label}
                      className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="flex items-center gap-4 p-6 lg:p-8">
                        <span className="flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-indigo-100">
                          <Icon className="h-6 w-6 lg:h-7 lg:w-7 text-indigo-600" />
                        </span>
                        <div>
                          <p className="text-2xl lg:text-3xl font-bold text-indigo-800 mb-1">
                            {value}
                          </p>
                          <p className="text-sm text-slate-600 font-medium">{label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8">
                      <Button
                        variant={currentMood === "happy" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setCurrentMood("happy")}
                        className={`flex flex-col items-center space-y-2 h-auto py-4 px-6 lg:py-6 lg:px-8 ${
                          currentMood === "happy"
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "border-green-200 hover:bg-green-50 text-green-600"
                        }`}
                      >
                        <Smile className="w-8 h-8 lg:w-10 lg:h-10" />
                        <span className="text-base lg:text-lg font-medium">Good</span>
                      </Button>
                      <Button
                        variant={currentMood === "neutral" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setCurrentMood("neutral")}
                        className={`flex flex-col items-center space-y-2 h-auto py-4 px-6 lg:py-6 lg:px-8 ${
                          currentMood === "neutral"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "border-yellow-200 hover:bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        <Meh className="w-8 h-8 lg:w-10 lg:h-10" />
                        <span className="text-base lg:text-lg font-medium">Okay</span>
                      </Button>
                      <Button
                        variant={currentMood === "sad" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setCurrentMood("sad")}
                        className={`flex flex-col items-center space-y-2 h-auto py-4 px-6 lg:py-6 lg:px-8 ${
                          currentMood === "sad"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "border-blue-200 hover:bg-blue-50 text-blue-600"
                        }`}
                      >
                        <Frown className="w-8 h-8 lg:w-10 lg:h-10" />
                        <span className="text-base lg:text-lg font-medium">Struggling</span>
                      </Button>
                    </div>
                    {currentMood && (
                      <div className="text-center space-y-4">
                        <Button
                          className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white px-6 py-2 lg:px-8 lg:py-3 text-base lg:text-lg"
                          onClick={handleLogMood}
                          disabled={loading}
                        >
                          {loading ? "Logging..." : "Log My Mood"}
                        </Button>
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
                    )}
                  </CardContent>
                </Card>

                {/* Mood Trends */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-4 lg:pb-6">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                      <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      Your Mood This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between h-32 lg:h-40 space-x-2">
                      {moodData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2 lg:space-y-3 flex-1">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-400 to-pink-400 rounded-t-lg transition-all duration-300"
                            style={{ height: `${(data.mood / 10) * 100}%` }}
                          />
                          <span className="text-xs lg:text-sm text-slate-600 font-medium">{data.day}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 lg:mt-6 flex items-center justify-between text-xs lg:text-sm text-slate-600">
                      <span className="font-medium">Average: 7.1/10</span>
                      <Badge className="bg-green-100 text-green-700">+0.8 from last week</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6 lg:space-y-8">
                {/* Upcoming Appointments */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-4 lg:pb-6">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                      <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      Upcoming Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 lg:space-y-4">
                    <AppointmentsList 
                      showUpcoming={true}
                      showPast={false}
                      limit={3}
                      showCard={false}
                      title=""
                      description=""
                      onViewAll={() => setActiveTab('appointments')}
                    />
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
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs lg:text-sm text-slate-600">Mood Improvement</span>
                        <span className="text-xs lg:text-sm font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2 lg:h-3" />
                    </div>
                    
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs lg:text-sm text-slate-600">Sessions Completed</span>
                        <span className="text-xs lg:text-sm font-medium">5</span>
                      </div>
                      <Progress value={Math.min(5 * 20, 100)} className="h-2 lg:h-3" />
                    </div>

                    <div className="pt-3 lg:pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-slate-600">Current Streak</span>
                        <Badge className="bg-orange-100 text-orange-700">7 days</Badge>
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
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm lg:text-base"
                      onClick={() => router.push('/dashboard/book-session')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book New Session
                    </Button>
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
            <AppointmentsList 
              showUpcoming={true}
              showPast={true}
              title="All Appointments"
              description="View and manage your therapy sessions"
              showCard={true}
            />
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
                          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base w-full sm:w-auto"
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
                  {/* Mood Chart */}
                  <div className="bg-slate-50 rounded-xl p-4 lg:p-6">
                    <h3 className="text-base lg:text-lg font-semibold text-indigo-800 mb-4">Weekly Mood Chart</h3>
                    <div className="flex items-end justify-between h-32 lg:h-48 space-x-2">
                      {moodData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2 lg:space-y-3 flex-1">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-400 to-pink-400 rounded-t-lg transition-all duration-300"
                            style={{ height: `${(data.mood / 10) * 100}%` }}
                          />
                          <span className="text-xs lg:text-sm text-slate-600 font-medium">{data.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

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
                      <span className="text-xs lg:text-sm font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2 lg:h-3" />
                  </div>
                  
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-slate-600">Sessions Completed</span>
                      <span className="text-xs lg:text-sm font-medium">5</span>
                    </div>
                    <Progress value={Math.min(5 * 20, 100)} className="h-2 lg:h-3" />
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm text-slate-600">Self-Care Activities</span>
                      <span className="text-xs lg:text-sm font-medium">60%</span>
                    </div>
                    <Progress value={60} className="h-2 lg:h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg lg:text-xl">
                    <Star className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800 text-sm lg:text-base">First Session</p>
                        <p className="text-xs lg:text-sm text-green-600">Completed your first therapy session</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800 text-sm lg:text-base">Mood Tracker</p>
                        <p className="text-xs lg:text-sm text-blue-600">Logged mood for 7 consecutive days</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-800 text-sm lg:text-base">Consistent</p>
                        <p className="text-xs lg:text-sm text-purple-600">Attended 3 sessions in a row</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 