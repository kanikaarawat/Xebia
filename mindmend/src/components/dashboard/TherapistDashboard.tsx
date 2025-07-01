"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Heart,
  Calendar,
  Users,
  Clock,
  Video,
  MessageCircle,
  FileText,
  TrendingUp,
  Bell,
  Settings,
  Star,
  CheckCircle,
  User,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

/* ---------- Types ---------- */
interface Appointment {
  id: string;
  patient_id: string;
  scheduled_at: string;
  notes: string;
  status: string;
}

interface TherapistProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  avatar_url?: string;
  specialization: string;
  license_number: string;
  created_at: string;
  updated_at: string;
}

interface AvailabilitySlot {
  id?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

/* ---------- Component ---------- */
export default function TherapistDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapistProfile, setTherapistProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  /* ── demo recent-patient list ──  */
  const recentPatients = [
    {
      id: 1,
      name: "Jordan M.",
      lastSession: "2 days ago",
      progress: "Improving",
      riskLevel: "low",
    },
    {
      id: 2,
      name: "Alex K.",
      lastSession: "1 week ago",
      progress: "Stable",
      riskLevel: "medium",
    },
    {
      id: 3,
      name: "Sam R.",
      lastSession: "3 days ago",
      progress: "Excellent",
      riskLevel: "low",
    },
  ];

  /* ── risk badge helper ── */
  const riskBadge = (level: string) => {
    switch (level) {
      case "low":
        return <Badge className="bg-green-100 text-green-700">Low Risk</Badge>;
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">Medium Risk</Badge>
        );
      case "high":
        return <Badge className="bg-red-100 text-red-700">High Risk</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-600">Unknown</Badge>;
    }
  };

  // Move these two functions above the first useEffect
  const initializeAvailabilitySlots = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const defaultSlots = days.map(day => ({
      day_of_week: day,
      start_time: '09:00',
      end_time: '17:00',
      is_available: false
    }));
    setAvailabilitySlots(defaultSlots);
  };

  const loadAvailabilitySlots = async () => {
    if (!therapistProfile) return;
    try {
      const { data, error } = await supabase
        .from('therapist_availability')
        .select('*')
        .eq('therapist_id', therapistProfile.id);
      if (error) {
        console.error('Error loading availability:', error);
        initializeAvailabilitySlots();
      } else if (data && data.length > 0) {
        setAvailabilitySlots(data);
      } else {
        initializeAvailabilitySlots();
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      initializeAvailabilitySlots();
    }
  };

  /* ── fetch therapist profile and appointments on mount ── */
  useEffect(() => {
    const fetchTherapistData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          console.log('❌ No authenticated user found');
          setLoading(false);
          return;
        }

        console.log('🔍 Fetching therapist data for user:', session.user.id);

        // First, fetch the basic profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select('*')
          .eq("id", session.user.id)
          .single();

        console.log('🔍 Basic profile result:', { profile, profileError });

        if (profileError) {
          console.error('❌ Error fetching basic profile:', profileError);
          setLoading(false);
          return;
        }

        if (!profile) {
          console.error('❌ No profile found for user');
          setLoading(false);
          return;
        }

        // Check if user is actually a therapist
        if (profile.role !== 'therapist') {
          console.error('❌ User is not a therapist, role is:', profile.role);
          setLoading(false);
          return;
        }

        // Now fetch therapist-specific data
        const { data: therapistData, error: therapistError } = await supabase
          .from("therapists")
          .select('*')
          .eq("id", session.user.id)
          .single();

        console.log('🔍 Therapist data result:', { therapistData, therapistError });

        if (therapistError) {
          console.error('❌ Error fetching therapist data:', therapistError);
          // Create basic therapist data if it doesn't exist
          if (therapistError.code === 'PGRST116') {
            console.log('🔍 Creating basic therapist data');
            const { data: newTherapistData, error: createError } = await supabase
              .from("therapists")
              .insert({
                id: session.user.id,
                specialization: 'General Therapy',
                license_number: 'Pending'
              })
              .select()
              .single();

            if (createError) {
              console.error('❌ Error creating therapist data:', createError);
            } else {
              console.log('✅ Basic therapist data created:', newTherapistData);
              const combinedData: TherapistProfile = {
                id: profile.id,
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || '',
                bio: profile.bio || '',
                avatar_url: profile.avatar_url,
                specialization: newTherapistData.specialization,
                license_number: newTherapistData.license_number,
                created_at: newTherapistData.created_at,
                updated_at: newTherapistData.updated_at,
              };
              setTherapistProfile(combinedData);
            }
          }
        } else if (therapistData) {
          console.log('✅ Therapist data found:', therapistData);
          // Combine profile and therapist data
          const combinedData: TherapistProfile = {
            id: profile.id,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            email: profile.email || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url,
            specialization: therapistData.specialization,
            license_number: therapistData.license_number,
            created_at: therapistData.created_at,
            updated_at: therapistData.updated_at,
          };
          console.log('✅ Combined therapist profile:', combinedData);
          setTherapistProfile(combinedData);
        }

        // Fetch appointments
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select("*")
          .eq("therapist_id", session.user.id)
          .order("scheduled_at", { ascending: true });

        if (appointmentsData) {
          console.log('✅ Appointments loaded:', appointmentsData.length);
          setAppointments(appointmentsData);
        }
      } catch (error) {
        console.error('❌ Unexpected error in fetchTherapistData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapistData();
  }, []);

  useEffect(() => {
    if (therapistProfile) {
      loadAvailabilitySlots();
    }
  }, [therapistProfile]);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!therapistProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-8 py-16 max-w-7xl">
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Profile Not Found</h2>
              <p className="text-slate-600 mb-6">
                We couldn't load your therapist profile. This might be because:
              </p>
              <ul className="text-slate-600 text-left max-w-md mx-auto mb-6 space-y-2">
                <li>• Your profile hasn't been set up yet</li>
                <li>• You're not registered as a therapist</li>
                <li>• There's a database connection issue</li>
              </ul>
              <Button 
                onClick={() => window.location.href = '/setup-profile'}
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = () => {
    return `${therapistProfile.first_name?.[0] || ''}${therapistProfile.last_name?.[0] || ''}`.toUpperCase();
  };

  // Save availability slots to database
  const saveAvailabilitySlots = async () => {
    if (!therapistProfile) return;
    
    setSavingAvailability(true);
    try {
      // Delete existing slots
      await supabase
        .from('therapist_availability')
        .delete()
        .eq('therapist_id', therapistProfile.id);

      // Insert new slots
      const slotsToSave = availabilitySlots
        .filter(slot => slot.is_available)
        .map(slot => ({
          therapist_id: therapistProfile.id,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time
        }));

      if (slotsToSave.length > 0) {
        const { error } = await supabase
          .from('therapist_availability')
          .insert(slotsToSave);

        if (error) {
          console.error('Error saving availability:', error);
        } else {
          console.log('✅ Availability saved successfully');
        }
      }
    } catch (error) {
      console.error('Error saving availability:', error);
    } finally {
      setSavingAvailability(false);
    }
  };

  // Update availability slot
  const updateAvailabilitySlot = (dayOfWeek: string, field: keyof AvailabilitySlot, value: any) => {
    setAvailabilitySlots(prev => 
      prev.map(slot => 
        slot.day_of_week === dayOfWeek 
          ? { ...slot, [field]: value }
          : slot
      )
    );
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100">
        <div className="container mx-auto flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500">
              <Heart className="h-5 w-5 text-white" />
            </span>
            <span className="text-2xl font-semibold text-indigo-700">
              MindMend
            </span>
            <Badge className="ml-3 bg-indigo-100 text-indigo-700 px-3 py-1">
              Therapist Portal
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-indigo-600 p-2">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-indigo-600 p-2">
              <Settings className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={therapistProfile.avatar_url} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="container mx-auto space-y-12 px-8 py-16 max-w-7xl">
        <section className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-indigo-800 leading-tight">
              {getGreeting()}, {therapistProfile.last_name ? `Dr. ${therapistProfile.last_name}` : 'Therapist'}
            </h1>
            <p className="text-lg text-slate-600">
              Here's a snapshot of your day.
            </p>
          </div>
          
          {/* Therapist Info Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={therapistProfile.avatar_url} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-indigo-800 mb-2">
                      {therapistProfile.first_name && therapistProfile.last_name 
                        ? `Dr. ${therapistProfile.first_name} ${therapistProfile.last_name}`
                        : therapistProfile.first_name 
                        ? `Dr. ${therapistProfile.first_name}`
                        : 'Therapist'
                      }
                    </h3>
                    <p className="text-slate-600 text-lg">{therapistProfile.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
                      {therapistProfile.specialization || 'General Therapy'}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm">
                      License: {therapistProfile.license_number || 'Pending'}
                    </Badge>
                  </div>
                  {therapistProfile.bio && (
                    <p className="text-slate-600 text-base leading-relaxed">{therapistProfile.bio}</p>
                  )}
                  <div className="text-sm text-slate-500">
                    Member since {new Date(therapistProfile.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-5 rounded-xl bg-white/70 backdrop-blur p-1 h-14">
            <TabsTrigger value="overview" className="rounded-lg text-base font-medium">Overview</TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-lg text-base font-medium">Appointments</TabsTrigger>
            <TabsTrigger value="patients" className="rounded-lg text-base font-medium">Patients</TabsTrigger>
            <TabsTrigger value="availability" className="rounded-lg text-base font-medium">Availability</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg text-base font-medium">Analytics</TabsTrigger>
          </TabsList>

          {/* ── Overview tab ── */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left (2 cols) */}
              <div className="space-y-8 lg:col-span-2">
                {/* Quick stats */}
                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    {
                      icon: Calendar,
                      value: 4,
                      label: "Today's Sessions",
                    },
                    {
                      icon: Users,
                      value: 23,
                      label: "Active Patients",
                    },
                    {
                      icon: Star,
                      value: "4.9",
                      label: "Avg Rating",
                    },
                  ].map(({ icon: Icon, value, label }) => (
                    <Card
                      key={label}
                      className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="flex items-center gap-5 p-8">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                          <Icon className="h-7 w-7 text-indigo-600" />
                        </span>
                        <div>
                          <p className="text-3xl font-bold text-indigo-800 mb-1">
                            {value}
                          </p>
                          <p className="text-sm text-slate-600 font-medium">{label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Schedule */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-xl">
                      <Clock className="h-6 w-6 text-indigo-600" />
                      Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments.length > 0 ? (
                      appointments.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-6 hover:bg-slate-100 transition-colors"
                        >
                          <div className="space-y-2">
                            <p className="font-semibold text-indigo-900 text-lg">
                              {new Date(a.scheduled_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-slate-600">{a.notes}</p>
                            <p className="text-sm text-slate-500">
                              Patient #{a.patient_id.slice(0, 6)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1">
                              {a.status === "completed"
                                ? "Completed"
                                : "Upcoming"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 text-lg">No appointments scheduled for today</p>
                        <p className="text-slate-500 text-sm mt-2">You're all caught up!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                <Card className="border-indigo-100 bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-indigo-800">
                      Recent Patients
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentPatients.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-lg bg-indigo-50 p-3"
                      >
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-indigo-200 text-indigo-700">
                            {p.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-indigo-800">{p.name}</p>
                          <p className="text-sm text-slate-600">
                            {p.lastSession}
                          </p>
                          <div className="mt-1 flex gap-2">
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              {p.progress}
                            </Badge>
                            {riskBadge(p.riskLevel)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick actions (optional) */}
                <Card className="border-indigo-100 bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-indigo-800">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Create Note
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Session
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Additional tabs (place-holders) */}
          <TabsContent value="appointments">
            <PlaceholderCard
              icon={Calendar}
              title="Appointment Management"
              text="Manage upcoming and past sessions."
            />
          </TabsContent>
          <TabsContent value="patients">
            <PlaceholderCard
              icon={Users}
              title="Patient Management"
              text="View and manage your patient roster."
            />
          </TabsContent>
          <TabsContent value="availability">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left (2 cols) */}
              <div className="space-y-8 lg:col-span-2">
                {/* Availability Management */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-xl">
                      <Clock className="h-6 w-6 text-indigo-600" />
                      Weekly Availability
                    </CardTitle>
                    <p className="text-slate-600 text-sm">
                      Set your available hours for each day of the week. Patients will only be able to book appointments during these times.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {availabilitySlots.map((slot) => (
                      <div
                        key={slot.day_of_week}
                        className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50"
                      >
                        {/* Day toggle */}
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <input
                            type="checkbox"
                            id={`available-${slot.day_of_week}`}
                            checked={slot.is_available}
                            onChange={(e) => updateAvailabilitySlot(slot.day_of_week, 'is_available', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <label
                            htmlFor={`available-${slot.day_of_week}`}
                            className="font-medium text-slate-700 cursor-pointer"
                          >
                            {slot.day_of_week}
                          </label>
                        </div>

                        {/* Time inputs */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-600">Start:</label>
                            <input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => updateAvailabilitySlot(slot.day_of_week, 'start_time', e.target.value)}
                              disabled={!slot.is_available}
                              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </div>
                          <span className="text-slate-400">to</span>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-600">End:</label>
                            <input
                              type="time"
                              value={slot.end_time}
                              onChange={(e) => updateAvailabilitySlot(slot.day_of_week, 'end_time', e.target.value)}
                              disabled={!slot.is_available}
                              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="min-w-[100px]">
                          {slot.is_available ? (
                            <Badge className="bg-green-100 text-green-700 px-3 py-1">
                              Available
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-600 px-3 py-1">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Save button */}
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <Button
                        onClick={saveAvailabilitySlots}
                        disabled={savingAvailability}
                        className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-6 py-2"
                      >
                        {savingAvailability ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Availability
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Quick tips */}
                <Card className="border-indigo-100 bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-indigo-800">
                      Tips for Setting Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-slate-600">
                        Set realistic hours that you can consistently maintain
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-slate-600">
                        Consider buffer time between appointments
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-slate-600">
                        Update your availability regularly as needed
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-slate-600">
                        Patients will only see available time slots
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Current availability summary */}
                <Card className="border-indigo-100 bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-indigo-800">
                      Current Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-800">
                        {availabilitySlots.filter(slot => slot.is_available).length}
                      </p>
                      <p className="text-sm text-slate-600">Days Available</p>
                    </div>
                    <div className="space-y-2">
                      {availabilitySlots
                        .filter(slot => slot.is_available)
                        .map(slot => (
                          <div key={slot.day_of_week} className="flex justify-between text-sm">
                            <span className="text-slate-700">{slot.day_of_week}</span>
                            <span className="text-slate-600">
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="analytics">
            <PlaceholderCard
              icon={TrendingUp}
              title="Practice Analytics"
              text="Insights into your practice outcomes."
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ---------- Small placeholder card ---------- */
function PlaceholderCard({
  icon: Icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <Card className="border-indigo-100 bg-white/80">
      <CardHeader>
        <CardTitle className="text-indigo-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <Icon className="h-16 w-16 text-slate-400" />
        <p className="max-w-xs text-center text-slate-600">{text}</p>
      </CardContent>
    </Card>
  );
}
