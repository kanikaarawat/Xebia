"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useUser, useSession } from '@supabase/auth-helpers-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

/* ---------- Types ---------- */
interface Appointment {
  id: string;
  patient_id: string;
  scheduled_at: string;
  notes: string;
  status: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  type: string;
  duration: number;
  created_at: string;
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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingAppointmentId, setRejectingAppointmentId] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = useSupabaseClient();
  const user = useUser();
  const session = useSession();

  /* ── demo recent-patient list ──  */
  const today = new Date();
  const todaysAppointments = appointments.filter(a => {
    const apptDate = new Date(a.scheduled_at);
    return apptDate.getFullYear() === today.getFullYear() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getDate() === today.getDate();
  });

  // Define what counts as an 'active' patient (e.g., seen in last 30 days)
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const activePatientIds = new Set(
    appointments
      .filter(a => new Date(a.scheduled_at) >= new Date(Date.now() - THIRTY_DAYS_MS) && a.patient)
      .map(a => a.patient!.id)
  );

  // Compute recent patients (most recent unique patients by appointment date)
  const recentPatientsMap = new Map();
  appointments
    .filter(a => a.patient)
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .forEach(a => {
      if (!recentPatientsMap.has(a.patient!.id)) {
        recentPatientsMap.set(a.patient!.id, {
          id: a.patient!.id,
          name: `${a.patient!.first_name} ${a.patient!.last_name}`,
          lastSession: a.scheduled_at,
          email: a.patient!.email,
          avatar_url: a.patient!.avatar_url,
        });
      }
    });
  const recentPatients = Array.from(recentPatientsMap.values()).slice(0, 3);

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
        if (!user?.id) {
          console.log('❌ No authenticated user found');
          setLoading(false);
          return;
        }

        console.log('🔍 Fetching therapist data for user:', user.id);

        // First, fetch the basic profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select('*')
          .eq("id", user.id)
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
          .eq("id", user.id)
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
                id: user.id,
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

        // Fetch appointments ONLY from the therapist appointments API (absolute URL for clarity)
        try {
          const res = await fetch(`/api/therapists/appointments?therapist_id=${user.id}`);
          if (res.ok) {
            const { appointments: appointmentsData } = await res.json();
            if (appointmentsData) {
              console.log('✅ Appointments loaded:', appointmentsData.length);
              setAppointments(appointmentsData);
            }
          } else {
            console.error('❌ Failed to fetch appointments from therapist appointments API');
          }
        } catch (err) {
          console.error('❌ Error fetching appointments:', err);
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

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const notifRes = await fetch(`/api/notifications?user_id=${user.id}`);
      if (notifRes.ok) {
        const { notifications } = await notifRes.json();
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

  // Handler to open dialog
  const handleOpenRejectDialog = (appointmentId: string) => {
    setRejectingAppointmentId(appointmentId);
    setRejectReason('');
    setRejectError(null);
    setShowRejectDialog(true);
  };

  // Handler to submit rejection
  const handleRejectAppointment = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Reason is required.');
      return;
    }
    setRejectLoading(true);
    setRejectError(null);
    try {
      const res = await fetch('/api/appointments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: rejectingAppointmentId,
          reason: rejectReason,
          therapist_id: therapistProfile?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRejectError(data.error || 'Failed to reject appointment.');
        setRejectLoading(false);
        return;
      }
      // Refresh appointments
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === rejectingAppointmentId
            ? { ...a, status: 'rejected', notes: a.notes ? `${a.notes}\n\nRejection reason: ${rejectReason}` : `Rejection reason: ${rejectReason}` }
            : a
        )
      );
      setShowRejectDialog(false);
    } catch (err: any) {
      setRejectError(err.message || 'Failed to reject appointment.');
    } finally {
      setRejectLoading(false);
    }
  };

  // Helper to format date/time
  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  // Status badge color
  const statusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-600">{status}</Badge>;
    }
  };

  // Debug: log appointments state
  console.log('Appointments in state:', appointments);

  // Appointments list UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Notification Bell */}
      <div className="fixed top-6 right-8 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 rounded-full bg-white shadow hover:bg-slate-100">
              <Bell className="h-6 w-6 text-indigo-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold text-indigo-800">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:underline">Mark all as read</button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y">
              {notifications.length === 0 ? (
                <div className="p-4 text-slate-500 text-center">No notifications</div>
              ) : notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 cursor-pointer ${n.read ? 'bg-white' : 'bg-indigo-50'} hover:bg-indigo-100`}
                  onClick={() => markOneAsRead(n.id)}
                >
                  <div className="font-medium text-slate-800 text-sm">{n.title}</div>
                  <div className="text-slate-600 text-xs mt-1">{n.message}</div>
                  <div className="text-slate-400 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

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
          className="w-full max-w-7xl mx-auto pt-4 lg:pt-8"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 rounded-xl bg-white/70 backdrop-blur p-1 h-12 lg:h-14">
            <TabsTrigger value="overview" className="rounded-lg text-sm lg:text-base font-medium">Overview</TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-lg text-sm lg:text-base font-medium">Appointments</TabsTrigger>
            <TabsTrigger value="patients" className="rounded-lg text-sm lg:text-base font-medium">Patients</TabsTrigger>
            <TabsTrigger value="availability" className="rounded-lg text-sm lg:text-base font-medium">Availability</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg text-sm lg:text-base font-medium">Analytics</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg text-sm lg:text-base font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg text-sm lg:text-base font-medium">Settings</TabsTrigger>
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
                      value: todaysAppointments.length,
                      label: "Today's Sessions",
                    },
                    {
                      icon: Users,
                      value: activePatientIds.size,
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

                {/* Schedule - only show today's appointments */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-xl">
                      <Clock className="h-6 w-6 text-indigo-600" />
                      Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const today = new Date();
                      const todaysAppointments = appointments.filter(a => {
                        const apptDate = new Date(a.scheduled_at);
                        return apptDate.getFullYear() === today.getFullYear() &&
                          apptDate.getMonth() === today.getMonth() &&
                          apptDate.getDate() === today.getDate();
                      });
                      return todaysAppointments.length > 0 ? (
                        todaysAppointments.map((a) => (
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
                              <p className="text-slate-800 font-medium">
                                {a.patient?.first_name} {a.patient?.last_name}
                              </p>
                              <p className="text-slate-500 text-xs">{a.patient?.email}</p>
                              <p className="text-slate-600 whitespace-pre-line">{a.notes}</p>
                              {/* Show rejection reason if present in notes */}
                              {a.status === 'rejected' && a.notes && a.notes.includes('Rejection reason:') && (
                                <p className="text-red-600 text-sm font-semibold">
                                  {a.notes.split('Rejection reason:')[1].trim()}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <Badge className={`px-3 py-1 ${a.status === 'completed' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                {a.status === 'completed' ? 'Completed' : a.status === 'rejected' ? 'Rejected' : 'Upcoming'}
                              </Badge>
                              {/* VC Button for upcoming video calls */}
                              {a.status === 'upcoming' && a.type?.toLowerCase() === 'video call' && (
                                <Button
                                  className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition-all"
                                  onClick={() => alert('Joining video call for appointment ' + a.id)}
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  Join Video Call
                                </Button>
                              )}
                              {/* Show Reject button for upcoming appointments only */}
                              {a.status === 'upcoming' && (
                                <Button
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleOpenRejectDialog(a.id)}
                                >
                                  Reject
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 text-lg">No appointments scheduled for today</p>
                          <p className="text-slate-500 text-sm mt-2">You're all caught up!</p>
                        </div>
                      );
                    })()}
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
                    {recentPatients.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">No recent patients found.</div>
                    ) : (
                      recentPatients.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 rounded-lg bg-indigo-50 p-3"
                        >
                          <Avatar>
                            <AvatarImage src={p.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-indigo-200 text-indigo-700">
                              {p.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-indigo-800">{p.name}</p>
                            <p className="text-sm text-slate-600">
                              {new Date(p.lastSession).toLocaleDateString()} {new Date(p.lastSession).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <div className="mt-1 flex gap-2">
                              {/* Optionally, add more patient info here */}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
            <section className="mt-4">
              <h2 className="text-xl font-bold mb-4 text-indigo-700">All Appointments</h2>
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white/60 rounded-xl shadow">No appointments found.</div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {appointments.map((appt) => {
                    const dateObj = new Date(appt.scheduled_at);
                    const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    const isUpcoming = new Date(appt.scheduled_at) > new Date();
                    return (
                      <Card key={appt.id} className={`flex items-center gap-4 p-4 ${isUpcoming ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200'} border shadow`}>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={appt.patient?.avatar_url || undefined} />
                          <AvatarFallback className="bg-indigo-200 text-indigo-800 font-bold">
                            {appt.patient?.first_name?.[0] || ''}{appt.patient?.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base text-indigo-900 truncate">{appt.patient?.first_name} {appt.patient?.last_name}</div>
                          <div className="text-slate-500 text-xs truncate">{appt.patient?.email}</div>
                          <div className="flex flex-wrap gap-2 mt-1 items-center text-xs">
                            <span className="text-slate-500">{date} {time}</span>
                            <Badge className="bg-pink-100 text-pink-700">{appt.type}</Badge>
                            <Badge className="bg-blue-50 text-blue-600">{appt.duration} min</Badge>
                            {statusBadge(appt.status)}
                          </div>
                          {appt.status === 'cancelled' && appt.notes && (
                            <div className="text-red-500 text-xs mt-1">{appt.notes}</div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
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
          <TabsContent value="notifications" className="space-y-6 lg:space-y-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-indigo-800 flex items-center gap-2">
                  <Bell className="h-5 w-5" /> Notifications
                </h2>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:underline">Mark all as read</button>
                )}
              </div>
              <div className="divide-y">
                {notifications.length === 0 ? (
                  <div className="p-4 text-slate-500 text-center">No notifications</div>
                ) : notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`py-4 px-2 cursor-pointer ${n.read ? 'bg-white' : 'bg-indigo-50'} hover:bg-indigo-100 rounded`}
                    onClick={() => markOneAsRead(n.id)}
                  >
                    <div className="font-medium text-slate-800 text-sm">{n.title}</div>
                    <div className="text-slate-600 text-xs mt-1">{n.message}</div>
                    <div className="text-slate-400 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                ))}
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
          <TabsContent value="settings">
            <PlaceholderCard
              icon={Settings}
              title="Settings"
              text="Manage your account settings."
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Reject Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label htmlFor="reject-reason" className="block text-sm font-medium text-slate-700">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
              autoFocus
            />
            {rejectError && <p className="text-red-600 text-sm">{rejectError}</p>}
          </div>
          <DialogFooter>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleRejectAppointment}
              disabled={rejectLoading}
            >
              {rejectLoading ? 'Rejecting...' : 'Reject Appointment'}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
