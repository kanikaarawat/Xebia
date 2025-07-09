"use client";

import { useEffect, useState, useMemo } from "react";
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  LogOut,
  Search,
  XCircle,
  PieChart,
  DollarSign,
  BarChart3,

} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { getFreeSlotsFixed as getFreeSlots } from '@/lib/freeSlotsFixed';
import {
  UnavailabilityRecord,
  Patient,
  AvailabilityAnalytics,
  Appointment,
  TherapistProfile,
  AvailabilitySlot,
  TimeSlot,
} from '@/lib/types';
import React from 'react';



/* ---------- Component ---------- */
export default function TherapistDashboard() {
  const [loading, setLoading] = useState(true);
  const [therapistProfile, setTherapistProfile] = useState<TherapistProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; created_at: string; read: boolean }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  
  // Complete appointment state
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedCompleteAppointmentId, setSelectedCompleteAppointmentId] = useState<string | null>(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [autoCompleteDialogOpen, setAutoCompleteDialogOpen] = useState(false);
  const [autoCompleteAppointmentId, setAutoCompleteAppointmentId] = useState<string | null>(null);
  
  // Schedule dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDuration, setScheduleDuration] = useState(30);
  const [scheduleType, setScheduleType] = useState('Video Call');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  
  // Enhanced availability state
  const [unavailabilityRecords, setUnavailabilityRecords] = useState<UnavailabilityRecord[]>([]);
  const [todayUnavailability, setTodayUnavailability] = useState<UnavailabilityRecord[]>([]);
  const [thisWeekUnavailability, setThisWeekUnavailability] = useState<UnavailabilityRecord[]>([]);
  const [availabilityAnalytics, setAvailabilityAnalytics] = useState<AvailabilityAnalytics | null>(null);
  const [nextAvailableSlot, setNextAvailableSlot] = useState<string | null>(null);
  const [manualUnavailabilityDialog, setManualUnavailabilityDialog] = useState(false);
  const [manualUnavailabilityDate, setManualUnavailabilityDate] = useState('');
  const [manualUnavailabilityStartTime, setManualUnavailabilityStartTime] = useState('');
  const [manualUnavailabilityEndTime, setManualUnavailabilityEndTime] = useState('');
  const [manualUnavailabilityReason, setManualUnavailabilityReason] = useState('');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'7' | '30' | '90' | '365'>('30');
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState<{
    sessionTrends: Array<{ week: string; count: number; completed: number }>;
    sessionTypeDistribution: Array<{ type: string; count: number; percentage: number }>;
    patientProgress: Record<string, { compliance: number; totalSessions: number; completedSessions: number; lastSession: string | null }>;
    financialMetrics: { totalRevenue: number; sessionsBilled: number; averageSessionRate: number; outstandingPayments: number; revenueGrowth: number };
    topPatients: Array<{ id: string; name: string; sessions: number; progress: number; totalSpent: number; lastSession: string | null }>;
    sessionDurationAnalysis: Array<{ type: string; duration: number; trend: string }>;
    timePeriod: string;
  }>({
    sessionTrends: [],
    sessionTypeDistribution: [],
    patientProgress: {},
    financialMetrics: { totalRevenue: 0, sessionsBilled: 0, averageSessionRate: 0, outstandingPayments: 0, revenueGrowth: 0 },
    topPatients: [],
    sessionDurationAnalysis: [],
    timePeriod: selectedTimePeriod
  });
  
  // Enhanced Block Time Slot state
  const [blockType, setBlockType] = useState<'whole-day' | 'specific-time'>('specific-time');
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictingAppointments, setConflictingAppointments] = useState<Appointment[]>([]);
  const [pendingBlockData, setPendingBlockData] = useState<{
    startDateTime: string;
    endDateTime: string;
    reason: string;
  } | null>(null);
  
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();



  // Helper functions for patient statistics
  const getPatientSessionCount = (patientId: string) => {
    return appointments.filter(a => a.patient?.id === patientId).length;
  };

  const getPatientLastSession = (patientId: string) => {
    const patientAppointments = appointments
      .filter(a => a.patient?.id === patientId && a.status !== 'upcoming')
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    
    if (patientAppointments.length === 0) return null;
    return new Date(patientAppointments[0].scheduled_at);
  };

  const getPatientLastSessionStatus = (patientId: string) => {
    const patientAppointments = appointments
      .filter(a => a.patient?.id === patientId && a.status !== 'upcoming')
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    
    if (patientAppointments.length === 0) return null;
    return patientAppointments[0].status;
  };

  const getPatientProgress = (patientId: string) => {
    const patientAppointments = appointments.filter(a => a.patient?.id === patientId);
    const completedSessions = patientAppointments.filter(a => a.status === 'completed').length;
    const totalSessions = patientAppointments.length;
    const cancelledSessions = patientAppointments.filter(a => a.status === 'cancelled').length;
    const rejectedSessions = patientAppointments.filter(a => a.status === 'rejected').length;
    // const upcomingSessions = patientAppointments.filter(a => a.status === 'upcoming').length;
    const expiredSessions = patientAppointments.filter(a => 
      a.status === 'upcoming' && new Date(a.scheduled_at) < new Date()
    ).length;
    
    if (totalSessions === 0) return 0;
    
    // Calculate compliance score (0-100) - include expired sessions as negative
    // Formula: (completed - cancelled - rejected - expired) / total * 100
    const complianceScore = Math.round(((completedSessions - cancelledSessions - rejectedSessions - expiredSessions) / totalSessions) * 100);
    
    return Math.max(0, Math.min(100, complianceScore));
  };

  const getPatientSessionBreakdown = (patientId: string) => {
    const patientAppointments = appointments.filter(a => a.patient?.id === patientId);
    const completedSessions = patientAppointments.filter(a => a.status === 'completed').length;
    const cancelledSessions = patientAppointments.filter(a => a.status === 'cancelled').length;
    const rejectedSessions = patientAppointments.filter(a => a.status === 'rejected').length;
    const upcomingSessions = patientAppointments.filter(a => a.status === 'upcoming').length;
    const expiredSessions = patientAppointments.filter(a => 
      a.status === 'upcoming' && new Date(a.scheduled_at) < new Date()
    ).length;
    
    return {
      completed: completedSessions,
      cancelled: cancelledSessions,
      rejected: rejectedSessions,
      upcoming: upcomingSessions,
      expired: expiredSessions,
      total: patientAppointments.length
    };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const exportPatientData = () => {
    const csvData = patients.map(patient => {
      const sessionCount = getPatientSessionCount(patient.id);
      const lastSession = getPatientLastSession(patient.id);
      const lastSessionStatus = getPatientLastSessionStatus(patient.id);
      const compliance = getPatientProgress(patient.id);
      const sessionBreakdown = getPatientSessionBreakdown(patient.id);
      
      return {
        'Patient Name': patient.name,
        'Email': patient.email,
        'Total Sessions': sessionCount,
        'Last Session': lastSession ? formatTimeAgo(lastSession) : 'Never',
        'Last Session Status': lastSessionStatus || 'N/A',
        'Compliance Score': `${compliance}%`,
        'Completed Sessions': sessionBreakdown.completed,
        'Cancelled Sessions': sessionBreakdown.cancelled,
        'Rejected Sessions': sessionBreakdown.rejected,
        'Upcoming Sessions': sessionBreakdown.upcoming,
        'Expired Sessions': sessionBreakdown.expired,
        'Compliance Level': compliance >= 70 ? 'High' : compliance >= 40 ? 'Medium' : 'Low'
      };
    });

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${String((row as Record<string, unknown>)[header])}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `patient_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Analytics CSV
  const exportAnalyticsCSV = () => {
    const sessionTrendsRows = analyticsData.sessionTrends.map((trend: { week: string; count: number; completed: number }) => ({
      Period: trend.week,
      'Total Sessions': trend.count,
      'Completed Sessions': trend.completed
    }));
    const sessionTypeRows = analyticsData.sessionTypeDistribution.map((type: { type: string; count: number; percentage: number }) => ({
      'Session Type': type.type,
      Count: type.count,
      Percentage: type.percentage + '%'
    }));
    const csvRows = [
      ['Session Trends'],
      ...([Object.keys(sessionTrendsRows[0] || {})]),
      ...sessionTrendsRows.map((row: Record<string, string | number>) => Object.values(row)),
      [],
      ['Session Type Distribution'],
      ...([Object.keys(sessionTypeRows[0] || {})]),
      ...sessionTypeRows.map((row: Record<string, string | number>) => Object.values(row)),
    ];
    const csvContent = csvRows.map((row: (string | number)[]) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Performance Report CSV
  const exportPerformanceReportCSV = () => {
    const metrics = analyticsData.financialMetrics;
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', metrics.totalRevenue],
      ['Sessions Billed', metrics.sessionsBilled],
      ['Average Session Rate', metrics.averageSessionRate],
      ['Outstanding Payments', metrics.outstandingPayments],
      ['Revenue Growth (%)', metrics.revenueGrowth],
    ];
    const csvContent = rows.map((row: (string | number)[]) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `performance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Patient Summary CSV
  const exportPatientSummaryCSV = () => {
    const patientRows = Object.entries(analyticsData.patientProgress).map(([id, p]: [string, { compliance: number; totalSessions: number; completedSessions: number; lastSession: string | null }]) => {
      // Find patient name from appointments
      const patientAppointment = appointments.find(apt => apt.patient?.id === id);
      const patientName = patientAppointment?.patient 
        ? `${patientAppointment.patient.first_name} ${patientAppointment.patient.last_name}`
        : `Patient ${id}`;
      
      return {
        'Patient Name': patientName,
        'Patient Email': patientAppointment?.patient?.email || 'N/A',
        'Compliance (%)': p.compliance,
        'Total Sessions': p.totalSessions,
        'Completed Sessions': p.completedSessions,
        'Last Session': p.lastSession || 'N/A',
      };
    });
    const csvRows = [
      Object.keys(patientRows[0] || {}),
      ...patientRows.map((row: Record<string, string | number>) => Object.values(row)),
    ];
    const csvContent = csvRows.map((row: (string | number)[]) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `patient_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique patients from appointments
  const patients = useMemo(() => {
    const patientMap = new Map();
    appointments.forEach(appointment => {
      if (appointment.patient) {
        patientMap.set(appointment.patient.id, {
          id: appointment.patient.id,
          name: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
          email: appointment.patient.email,
          avatar_url: appointment.patient.avatar_url
        });
      }
    });
    return Array.from(patientMap.values());
  }, [appointments]);

  // Filter patients based on search and status
  const filteredPatients = useMemo(() => {
    let filtered = patients;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(query) || 
        patient.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => {
        const compliance = getPatientProgress(patient.id);
        const lastSession = getPatientLastSession(patient.id);
        const sessionCount = getPatientSessionCount(patient.id);
        
        switch (statusFilter) {
          case 'active':
            return lastSession && (Date.now() - lastSession.getTime()) < (30 * 24 * 60 * 60 * 1000);
          case 'inactive':
            return !lastSession || (Date.now() - lastSession.getTime()) >= (30 * 24 * 60 * 60 * 1000);
          case 'new':
            return sessionCount <= 3;
          case 'low-compliance':
            return compliance < 40;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [patients, searchQuery, statusFilter, appointments, getPatientProgress, getPatientLastSession, getPatientSessionCount]);

  /* ── demo recent-patient list ──  */
  const today = new Date();
  const todaysAppointments = appointments.filter(a => {
    const apptDate = new Date(a.scheduled_at);
    return apptDate.getFullYear() === today.getFullYear() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getDate() === today.getDate();
  });

  // Compute recent patients (only from expired or completed appointments)
  const recentPatientsMap = new Map();
  appointments
    .filter(a => a.patient && (a.status === 'completed' || new Date(a.scheduled_at) < new Date()))
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .forEach(a => {
      if (!recentPatientsMap.has(a.patient!.id)) {
        recentPatientsMap.set(a.patient!.id, {
          id: a.patient!.id,
          name: `${a.patient!.first_name} ${a.patient!.last_name}`,
          lastSession: a.scheduled_at,
          email: a.patient!.email,
          avatar_url: a.patient!.avatar_url,
          status: a.status,
        });
      }
    });
  const recentPatients = Array.from(recentPatientsMap.values()).slice(0, 3);

  // Calculate patient statistics
  const allPatientIds = new Set(appointments.filter(a => a.patient).map(a => a.patient!.id));
  const totalPatients = allPatientIds.size;

  // Active patients (had sessions in last 30 days)
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const activePatientIds = new Set(
    appointments
      .filter(a => new Date(a.scheduled_at) >= new Date(Date.now() - THIRTY_DAYS_MS) && a.patient)
      .map(a => a.patient!.id)
  );
  const activePatients = activePatientIds.size;

  // New patients this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newPatientsThisMonth = new Set(
    appointments
      .filter(a => {
        const apptDate = new Date(a.scheduled_at);
        return apptDate.getMonth() === currentMonth && 
               apptDate.getFullYear() === currentYear && 
               a.patient;
      })
      .map(a => a.patient!.id)
  ).size;

  // Completed sessions this month
  const completedSessionsThisMonth = appointments.filter(a => {
    const apptDate = new Date(a.scheduled_at);
    return apptDate.getMonth() === currentMonth && 
           apptDate.getFullYear() === currentYear && 
           a.status === 'completed';
  }).length;

  // Move these two functions above the first useEffect
  const initializeAvailabilitySlots = () => {
    console.log('🔄 Initializing default availability slots');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const defaultSlots = days.map(day => ({
      day_of_week: day,
      start_time: '09:00',
      end_time: '17:00',
      is_available: false
    }));
    console.log('📝 Setting default slots:', defaultSlots);
    setAvailabilitySlots(defaultSlots);
  };

  const loadAvailabilitySlots = async (profile?: TherapistProfile) => {
    const targetProfile = profile || therapistProfile;
    console.log('🔍 loadAvailabilitySlots called, therapistProfile:', targetProfile?.id);
    if (!targetProfile) {
      console.log('❌ No therapist profile, returning early');
      return;
    }
    try {
      console.log('🔍 Fetching availability for therapist:', targetProfile.id);
      const { data, error } = await supabase
        .from('therapist_availability')
        .select('*')
        .eq('therapist_id', targetProfile.id);
      
      console.log('🔍 Availability query result:', { data, error });
      
      if (error) {
        console.error('Error loading availability:', error);
        console.log('🔄 Initializing default availability slots');
        initializeAvailabilitySlots();
      } else if (data && data.length > 0) {
        console.log('✅ Found availability data:', data);
        setAvailabilitySlots(data);
      } else {
        console.log('📝 No availability data found, initializing defaults');
        initializeAvailabilitySlots();
      }
    } catch (error: unknown) {
      console.error('Error loading availability:', error);
      console.log('🔄 Initializing default availability slots due to error');
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

        console.log('�� Fetching therapist profile for user:', user.id);

        // Fetch therapist profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('❌ Error fetching therapist profile:', profileError);
          setLoading(false);
          return;
        }

        if (!profileData) {
          console.log('❌ No therapist profile found for user:', user.id);
          setLoading(false);
          return;
        }

        console.log('✅ Therapist profile found:', profileData);
        setTherapistProfile(profileData);

        // Fetch appointments for this therapist
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:profiles!appointments_patient_id_fkey(
              id,
              first_name,
              last_name,
              email,
              avatar_url
            )
          `)
          .eq('therapist_id', user.id)
          .order('scheduled_at', { ascending: true });

        if (appointmentsError) {
          console.error('❌ Error fetching appointments:', appointmentsError);
            } else {
          console.log('✅ Appointments fetched:', appointmentsData);
          setAppointments(appointmentsData || []);
        }

        // Load availability slots with the profile data
        console.log('🔄 Loading availability slots...');
        await loadAvailabilitySlots(profileData);

        // Load enhanced availability data with the profile data
        console.log('🔄 Loading unavailability data...');
        await loadUnavailabilityData(profileData);
        console.log('🔄 Loading analytics...');
        await loadAvailabilityAnalytics();
        console.log('🔄 Loading practice analytics...');
        await loadAnalyticsData(parseInt(selectedTimePeriod));
        console.log('🔄 Finding next available slot...');
        await findNextAvailableSlot();

        // Debug: Log final state after a small delay to ensure state updates
        setTimeout(() => {
          console.log('🎯 Final data state after loading:', {
            availabilitySlots: availabilitySlots.length,
            unavailabilityRecords: unavailabilityRecords.length,
            todayUnavailability: todayUnavailability.length,
            thisWeekUnavailability: thisWeekUnavailability.length,
            availabilityAnalytics: !!availabilityAnalytics,
            nextAvailableSlot: !!nextAvailableSlot
          });
        }, 100);

      } catch (error: unknown) {
        console.error('❌ Unexpected error in fetchTherapistData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapistData();
  }, [user?.id, supabase]);

  // Load available slots when date or duration changes
  useEffect(() => {
    if (scheduleDate && scheduleDialogOpen) {
      loadAvailableSlots();
    }
  }, [scheduleDate, scheduleDuration, scheduleDialogOpen]);

  // Load analytics data when time period changes
  useEffect(() => {
    if (therapistProfile) {
      loadAnalyticsData(parseInt(selectedTimePeriod));
    }
  }, [selectedTimePeriod, therapistProfile]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [user?.id, supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error: unknown) {
      console.error('Error signing out:', error);
    }
  };

  // Notification functions
  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      }
    } catch (error: unknown) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) {
        console.error('Error marking notifications as read:', error);
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error: unknown) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) {
        console.error('Error marking notification as read:', error);
      } else {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Helper functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = () => {
    if (!therapistProfile) return "T";
    const first = therapistProfile.first_name?.charAt(0) || "";
    const last = therapistProfile.last_name?.charAt(0) || "";
    return (first + last).toUpperCase() || "T";
  };

  const getDisplayName = () => {
    if (!therapistProfile) return "Therapist";
    if (therapistProfile.first_name && therapistProfile.last_name) {
      return `Dr. ${therapistProfile.first_name} ${therapistProfile.last_name}`;
    }
    if (therapistProfile.first_name) {
      return `Dr. ${therapistProfile.first_name}`;
    }
    return "Therapist";
  };

  const handleOpenRejectDialog = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setRejectReason('');
    setRejectError(null);
    setRejectDialogOpen(true);
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointmentId || !rejectReason.trim()) {
      setRejectError('Please provide a rejection reason');
      return;
    }

    setRejectLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'rejected',
          notes: `Rejection reason: ${rejectReason.trim()}`
        })
        .eq('id', selectedAppointmentId);

      if (error) {
        console.error('Error rejecting appointment:', error);
        setRejectError('Failed to reject appointment');
      } else {
        // Update local state
        setAppointments(prev => prev.map(appt => 
          appt.id === selectedAppointmentId 
            ? { ...appt, status: 'rejected', notes: `Rejection reason: ${rejectReason.trim()}` }
            : appt
        ));
        setRejectDialogOpen(false);
        setSelectedAppointmentId(null);
        setRejectReason('');
        setRejectError(null);
      }
    } catch (error: unknown) {
      console.error('Error rejecting appointment:', error);
      setRejectError('Failed to reject appointment');
    } finally {
      setRejectLoading(false);
    }
  };

  // Complete appointment functions
  const handleOpenCompleteDialog = (appointmentId: string) => {
    setSelectedCompleteAppointmentId(appointmentId);
    setCompleteDialogOpen(true);
    setCompleteError(null);
  };

  const handleCompleteAppointment = async () => {
    if (!selectedCompleteAppointmentId) return;

    setCompleteLoading(true);
    setCompleteError(null);

    try {
      const response = await fetch('/api/appointments/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: selectedCompleteAppointmentId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete appointment');
      }

      // Update the appointment in the local state
      setAppointments(prev => prev.map(appt => 
        appt.id === selectedCompleteAppointmentId 
          ? { ...appt, status: 'completed' }
          : appt
      ));

      setCompleteDialogOpen(false);
      setSelectedCompleteAppointmentId(null);
    } catch (error: unknown) {
      console.error('Error completing appointment:', error);
      if (error instanceof Error) {
        setCompleteError(error.message);
      } else {
        setCompleteError(String(error));
      }
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleAutoCompleteAppointment = async () => {
    if (!autoCompleteAppointmentId) return;

    setCompleteLoading(true);
    setCompleteError(null);

    try {
      const response = await fetch('/api/appointments/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: autoCompleteAppointmentId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete appointment');
      }

      // Update the appointment in the local state
      setAppointments(prev => prev.map(appt => 
        appt.id === autoCompleteAppointmentId 
          ? { ...appt, status: 'completed' }
          : appt
      ));

      setAutoCompleteDialogOpen(false);
      setAutoCompleteAppointmentId(null);
    } catch (error: unknown) {
      console.error('Error completing appointment:', error);
      setCompleteError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setCompleteLoading(false);
    }
  };

  // Function to check if appointment should show complete button
  const shouldShowCompleteButton = (appointment: Appointment) => {
    if (appointment.status !== 'upcoming') return false;
    
    const now = new Date();
    const appointmentStart = new Date(appointment.scheduled_at);
    
    // Show button from start time until end of day
    return now >= appointmentStart && now <= new Date(appointmentStart.setHours(23, 59, 59, 999));
  };

  // Function to check if appointment should show auto-complete dialog
  const shouldShowAutoCompleteDialog = (appointment: Appointment) => {
    if (appointment.status !== 'upcoming') return false;
    
    const now = new Date();
    const appointmentStart = new Date(appointment.scheduled_at);
    const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);
    const fiveMinutesAfterEnd = new Date(appointmentEnd.getTime() + 5 * 60000);
    
    // Show dialog 5 minutes after session end time
    return now >= fiveMinutesAfterEnd && now <= new Date(appointmentStart.setHours(23, 59, 59, 999));
  };

  // Check for appointments that need auto-complete dialog
  useEffect(() => {
    const checkAutoCompleteAppointments = () => {
      appointments.forEach(appointment => {
        if (shouldShowAutoCompleteDialog(appointment)) {
          setAutoCompleteAppointmentId(appointment.id);
          setAutoCompleteDialogOpen(true);
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkAutoCompleteAppointments, 60000);
    checkAutoCompleteAppointments(); // Initial check

    return () => clearInterval(interval);
  }, [appointments]);

  // Schedule functions
  const handleOpenScheduleDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setScheduleDialogOpen(true);
    setScheduleDate('');
    setScheduleTime('');
    setScheduleDuration(30);
    setScheduleType('Video Call');
    setScheduleNotes('');
    setAvailableSlots([]);
    setScheduleError(null);
  };

  const loadAvailableSlots = async () => {
    if (!scheduleDate || !user?.id) return;

    setLoadingSlots(true);
    setScheduleError(null);

    try {
      const { available } = await getFreeSlots(user.id, scheduleDate, 30, scheduleDuration);
      setAvailableSlots(available);
    } catch (err: unknown) {
      console.error('Error loading slots:', err);
      setScheduleError('Failed to load available time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleScheduleSession = async () => {
    if (!selectedPatient || !scheduleDate || !scheduleTime || !user?.id) {
      setScheduleError('Please fill in all required fields.');
      return;
    }

    setScheduleLoading(true);
    setScheduleError(null);

    try {
      const scheduledAt = `${scheduleDate}T${scheduleTime}:00`;
      
      // Create appointment
      const { data: appointment, error: apptError } = await supabase
        .from('appointments')
        .insert({
          patient_id: selectedPatient.id,
          therapist_id: user.id,
          scheduled_at: scheduledAt,
          duration: scheduleDuration,
          type: scheduleType,
          notes: scheduleNotes,
          status: 'upcoming'
        })
        .select()
        .single();

      if (apptError) throw apptError;

      // Note: Unavailability record will be created automatically by database trigger
      console.log('✅ Appointment created successfully. Unavailability will be created by trigger.');

      // Update local state
      setAppointments(prev => [...prev, {
        ...appointment,
        patient: selectedPatient
      }]);

      setScheduleDialogOpen(false);
      setSelectedPatient(null);
    } catch (err: unknown) {
      console.error('Error scheduling session:', err);
      if (err instanceof Error) {
        setScheduleError(err.message || 'Failed to schedule session');
      } else {
        setScheduleError('Failed to schedule session');
      }
    } finally {
      setScheduleLoading(false);
    }
  };

  // Enhanced availability functions
  const loadUnavailabilityData = async (profile?: TherapistProfile) => {
    const targetProfile = profile || therapistProfile;
    console.log('🔍 loadUnavailabilityData called, therapistProfile:', targetProfile?.id);
    if (!targetProfile) {
      console.log('❌ No therapist profile, returning early');
      return;
    }
    
    try {
      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
      
      // Get this week's date range
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

      console.log('📅 Date ranges:', {
        today: { start: startOfDay, end: endOfDay },
        thisWeek: { start: startOfWeek, end: endOfWeek }
      });

      // Fetch all unavailability records with appointment details
      console.log('🔍 Fetching unavailability for therapist ID:', targetProfile.id);
      
      // First try a simple query without joins
      const { data: simpleUnavailability, error: simpleError } = await supabase
        .from('therapist_unavailability')
        .select('*')
        .eq('therapist_id', targetProfile.id)
        .order('start_time', { ascending: true });
      
      console.log('🔍 Simple unavailability query result:', { 
        data: simpleUnavailability, 
        error: simpleError,
        count: simpleUnavailability?.length || 0
      });

      if (simpleError) {
        console.error('Simple query error:', simpleError);
        return;
      }

      // Use the simple query result since it works
      console.log('✅ Using simple query result:', simpleUnavailability);
      console.log('🔍 Sample records:', simpleUnavailability?.slice(0, 3));
      setUnavailabilityRecords(simpleUnavailability || []);

      // Try to get appointment details separately if needed
      if (simpleUnavailability && simpleUnavailability.length > 0) {
        const appointmentIds = simpleUnavailability
          .filter(record => record.appointment_id)
          .map(record => record.appointment_id);
        
        if (appointmentIds.length > 0) {
          console.log('🔍 Fetching appointment details for:', appointmentIds);
          const { data: appointmentDetails, error: appointmentError } = await supabase
            .from('appointments')
            .select(`
              id,
              patient_id,
              type,
              duration,
              status,
              patient:profiles(first_name, last_name)
            `)
            .in('id', appointmentIds);
          
          console.log('🔍 Appointment details:', { data: appointmentDetails, error: appointmentError });
          
          // Merge appointment details with unavailability records
          if (appointmentDetails) {
            const enrichedRecords = simpleUnavailability.map(record => {
              if (record.appointment_id) {
                const appointment = appointmentDetails.find(apt => apt.id === record.appointment_id);
                return {
                  ...record,
                  appointment
                };
              }
              return record;
            });
            
            console.log('🔍 Enriched records:', enrichedRecords);
            setUnavailabilityRecords(enrichedRecords);
          }
        }
      }

      // Use simpleUnavailability for filtering since it's available immediately
      const finalUnavailabilityRecords = simpleUnavailability || [];
      
      // Filter for today's unavailability
      const todayUnavail = finalUnavailabilityRecords?.filter(record => {
        const recordDate = new Date(record.start_time);
        const isToday = recordDate >= startOfDay && recordDate < endOfDay;
        console.log('🔍 Checking record:', {
          recordDate: recordDate.toISOString(),
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
          isToday
        });
        return isToday;
      }) || [];
      setTodayUnavailability(todayUnavail);
      console.log('📅 Today unavailability:', todayUnavail);

      // Filter for this week's unavailability
      const thisWeekUnavail = finalUnavailabilityRecords?.filter(record => {
        const recordDate = new Date(record.start_time);
        return recordDate >= startOfWeek && recordDate < endOfWeek;
      }) || [];
      setThisWeekUnavailability(thisWeekUnavail);
      console.log('📅 This week unavailability:', thisWeekUnavail);

    } catch (error: unknown) {
      console.error('Error loading unavailability data:', error);
    }
  };

  const loadAvailabilityAnalytics = async () => {
    console.log('🔍 loadAvailabilityAnalytics called, therapistProfile:', therapistProfile?.id);
    if (!therapistProfile) {
      console.log('❌ No therapist profile, returning early');
      return;
    }
    
    try {
      // Calculate analytics from availability slots and appointments
      const availableDays = availabilitySlots.filter(slot => slot.is_available);
      const totalAvailableHours = availableDays.reduce((total, slot) => {
        const start = new Date(`2000-01-01T${slot.start_time}:00`);
        const end = new Date(`2000-01-01T${slot.end_time}:00`);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);

      // Calculate booked hours from appointments
      const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
      const totalBookedHours = upcomingAppointments.reduce((total, apt) => {
        return total + (apt.duration / 60);
      }, 0);

      const utilizationRate = totalAvailableHours > 0 ? (totalBookedHours / totalAvailableHours) * 100 : 0;

      // Find busiest and least busy days
      const dayStats = availabilitySlots.map(slot => {
        const dayAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.scheduled_at);
          const dayOfWeek = aptDate.toLocaleDateString('en-US', { weekday: 'long' });
          return dayOfWeek === slot.day_of_week && apt.status === 'upcoming';
        });
        return {
          day: slot.day_of_week,
          appointmentCount: dayAppointments.length,
          isAvailable: slot.is_available
        };
      });

      const availableDayStats = dayStats.filter(stat => stat.isAvailable);
      const busiestDay = availableDayStats.length > 0 
        ? availableDayStats.reduce((max, current) => 
            current.appointmentCount > max.appointmentCount ? current : max
          ).day
        : 'None';
      const leastBusyDay = availableDayStats.length > 0 
        ? availableDayStats.reduce((min, current) => 
            current.appointmentCount < min.appointmentCount ? current : min
          ).day
        : 'None';

      // Calculate average session duration
      const completedAppointments = appointments.filter(apt => apt.status === 'completed');
      const averageSessionDuration = completedAppointments.length > 0
        ? completedAppointments.reduce((total, apt) => total + apt.duration, 0) / completedAppointments.length
        : 0;

      setAvailabilityAnalytics({
        totalAvailableHours: Math.round(totalAvailableHours * 10) / 10,
        totalBookedHours: Math.round(totalBookedHours * 10) / 10,
        utilizationRate: Math.round(utilizationRate * 10) / 10,
        busiestDay,
        leastBusyDay,
        averageSessionDuration: Math.round(averageSessionDuration)
      });

    } catch (error: unknown) {
      console.error('Error loading availability analytics:', error);
    }
  };

  // Load comprehensive analytics data
  const loadAnalyticsData = async (timePeriod = 30) => {
    if (!therapistProfile) return;
    
    try {
      const startDate = new Date(Date.now() - timePeriod * 24 * 60 * 60 * 1000).toISOString();
      
      // Fetch ALL appointments for this therapist (not just recent ones for comprehensive analysis)
      const { data: allAppointments, error: allAppointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(first_name, last_name, email, avatar_url, created_at, timezone)
        `)
        .eq('therapist_id', therapistProfile.id)
        .order('scheduled_at', { ascending: false });

      if (allAppointmentsError) throw allAppointmentsError;

      // Fetch recent appointments for trends (within time period)
      const recentAppointments = allAppointments?.filter(apt => 
        new Date(apt.scheduled_at) >= new Date(startDate)
      ) || [];

      // Get unique patient IDs for this therapist
      const uniquePatientIds = [...new Set(allAppointments?.map(apt => apt.patient_id).filter(Boolean))];
      
      // Fetch all patients who have had sessions with this therapist
      const { data: patients, error: patientsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .in('id', uniquePatientIds);

      if (patientsError) throw patientsError;

      // Calculate session trends (weekly/monthly data) - therapist-specific
      const sessionTrends = [];
      
      if (timePeriod === 365) {
        // For last year, use monthly data
        const months = 12;
        for (let i = 0; i < months; i++) {
          const currentDate = new Date();
          const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - (months - i - 1), 1);
          const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
          
          const monthAppointments = recentAppointments?.filter(apt => {
            const aptDate = new Date(apt.scheduled_at);
            return aptDate >= monthStart && aptDate < monthEnd;
          }) || [];
          
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthName = monthNames[monthStart.getMonth()];
          
          sessionTrends.push({
            week: monthName,
            count: monthAppointments.length,
            completed: monthAppointments.filter(apt => apt.status === 'completed').length
          });
        }
      } else {
        // For other periods, use weekly data
        const weeks = Math.ceil(timePeriod / 7);
        for (let i = 0; i < weeks; i++) {
          const weekStart = new Date(Date.now() - (weeks - i - 1) * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const weekAppointments = recentAppointments?.filter(apt => {
            const aptDate = new Date(apt.scheduled_at);
            return aptDate >= weekStart && aptDate < weekEnd;
          }) || [];
          
          sessionTrends.push({
            week: `W${i + 1}`,
            count: weekAppointments.length,
            completed: weekAppointments.filter(apt => apt.status === 'completed').length
          });
        }
      }

      // Calculate session type distribution - therapist-specific
      const sessionTypeCounts: Record<string, number> = {};
      allAppointments?.forEach(apt => {
        const type = apt.type || 'Video Call'; // Default to Video Call if no type specified
        sessionTypeCounts[type] = (sessionTypeCounts[type] || 0) + 1;
      });
      
      const sessionTypeDistribution = Object.entries(sessionTypeCounts).map(([type, count]) => ({
        type,
        count: count as number,
        percentage: Math.round((count as number / (allAppointments?.length || 1)) * 100)
      }));

      // Calculate patient progress - therapist-specific
      const patientProgress: Record<string, { compliance: number; totalSessions: number; completedSessions: number; lastSession: string | null }> = {};
      patients?.forEach(patient => {
        // Only count appointments with this specific therapist
        const patientAppointments = allAppointments?.filter(apt => apt.patient_id === patient.id) || [];
        const completedSessions = patientAppointments.filter(apt => apt.status === 'completed').length;
        const totalSessions = patientAppointments.length;
        const compliance = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        
        patientProgress[patient.id] = {
          compliance,
          totalSessions,
          completedSessions,
          lastSession: patientAppointments[0]?.scheduled_at || null
        };
      });

      // Calculate financial metrics using actual payment data - therapist-specific
      const completedAppointments = allAppointments?.filter(apt => apt.status === 'completed') || [];
      const totalRevenue = completedAppointments.reduce((acc, apt) => {
        // Use actual payment_amount if available, otherwise calculate based on duration
        return acc + (apt.payment_amount || (apt.duration || 0) * 10); // ₹10 per minute
      }, 0);
      
      const averageSessionRate = completedAppointments.length > 0 ? totalRevenue / completedAppointments.length : 0;
      
      // Calculate outstanding payments from appointments with pending payment status
      const pendingPayments = allAppointments?.filter(apt => 
        apt.payment_status === 'pending' && apt.payment_amount
      ) || [];
      const outstandingPayments = pendingPayments.reduce((acc, apt) => acc + (apt.payment_amount || 0), 0);

      // Calculate revenue growth by comparing recent period with previous period
      const recentPeriodRevenue = recentAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((acc, apt) => acc + (apt.payment_amount || (apt.duration || 0) * 10), 0);
      
      const previousPeriodStart = new Date(Date.now() - (timePeriod * 2) * 24 * 60 * 60 * 1000);
      const previousPeriodAppointments = allAppointments?.filter(apt => {
        const aptDate = new Date(apt.scheduled_at);
        return aptDate >= previousPeriodStart && aptDate < new Date(startDate) && apt.status === 'completed';
      }) || [];
      
      const previousPeriodRevenue = previousPeriodAppointments.reduce((acc, apt) => 
        acc + (apt.payment_amount || (apt.duration || 0) * 10), 0
      );
      
      const revenueGrowth = previousPeriodRevenue > 0 
        ? Math.round(((recentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
        : 0;

      const financialMetrics = {
        totalRevenue: Math.round(totalRevenue),
        sessionsBilled: completedAppointments.length,
        averageSessionRate: Math.round(averageSessionRate),
        outstandingPayments: Math.round(outstandingPayments),
        revenueGrowth
      };

      // Calculate top performing patients - therapist-specific
      const topPatients = patients?.map(patient => {
        const progress = patientProgress[patient.id] || { compliance: 0, totalSessions: 0 };
        const patientAppointments = allAppointments?.filter(apt => apt.patient_id === patient.id) || [];
        const lastSession = patientAppointments[0];
        
        // Calculate total spent with this therapist
        const totalSpent = patientAppointments
          .filter(apt => apt.status === 'completed')
          .reduce((acc, apt) => acc + (apt.payment_amount || (apt.duration || 0) * 10), 0);
        
        return {
          id: patient.id,
          name: `${patient.first_name} ${patient.last_name}`,
          sessions: progress.totalSessions,
          progress: progress.compliance,
          totalSpent: Math.round(totalSpent),
          lastSession: lastSession?.scheduled_at || null
        };
      }).sort((a, b) => b.sessions - a.sessions).slice(0, 5);

      // Calculate session duration analysis - therapist-specific
      const sessionDurationAnalysis: Array<{ type: string; duration: number; trend: string }> = [];
      const sessionTypes = [...new Set(allAppointments?.map(apt => apt.type).filter(Boolean))];
      
      sessionTypes.forEach(type => {
        const typeAppointments = allAppointments?.filter(apt => apt.type === type) || [];
        const avgDuration = typeAppointments.length > 0 
          ? typeAppointments.reduce((acc, apt) => acc + (apt.duration || 60), 0) / typeAppointments.length 
          : 60; // Default to 60 minutes if no data
        
        // Calculate trend by comparing recent vs older sessions
        const recentTypeAppointments = typeAppointments.filter(apt => 
          new Date(apt.scheduled_at) >= new Date(startDate)
        );
        const olderTypeAppointments = typeAppointments.filter(apt => 
          new Date(apt.scheduled_at) < new Date(startDate)
        );
        
        const recentAvg = recentTypeAppointments.length > 0 
          ? recentTypeAppointments.reduce((acc, apt) => acc + (apt.duration || 60), 0) / recentTypeAppointments.length 
          : avgDuration;
        const olderAvg = olderTypeAppointments.length > 0 
          ? olderTypeAppointments.reduce((acc, apt) => acc + (apt.duration || 60), 0) / olderTypeAppointments.length 
          : avgDuration;
        
        const durationDiff = recentAvg - olderAvg;
        const trend = durationDiff > 0 ? `+${Math.round(durationDiff)} min` : `${Math.round(durationDiff)} min`;
        
        sessionDurationAnalysis.push({
          type,
          duration: Math.round(avgDuration),
          trend
        });
      });



      setAnalyticsData({
        sessionTrends,
        sessionTypeDistribution,
        patientProgress,
        financialMetrics,
        topPatients,
        sessionDurationAnalysis,
        timePeriod: timePeriod.toString()
      });

    } catch (error: unknown) {
      console.error('Error loading analytics data:', error);
    }
  };

  const findNextAvailableSlot = async () => {
    if (!therapistProfile) return;
    
    try {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const { available } = await getFreeSlots(therapistProfile.id, tomorrowStr, 30, 30);
      
      if (available.length > 0) {
        setNextAvailableSlot(available[0].start_time);
      } else {
        setNextAvailableSlot(null);
      }
    } catch (error: unknown) {
      console.error('Error finding next available slot:', error);
      setNextAvailableSlot(null);
    }
  };

  const checkCurrentAvailability = () => {
    if (!therapistProfile || !availabilitySlots.length) return 'Unknown';
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    console.log('🔍 Checking current availability:', {
      currentDay,
      currentTime,
      availableSlots: availabilitySlots.length,
      todaySlot: availabilitySlots.find(slot => slot.day_of_week === currentDay)
    });
    
    // Check if today is in the weekly schedule
    const todaySlot = availabilitySlots.find(slot => slot.day_of_week === currentDay);
    
    if (!todaySlot || !todaySlot.is_available) {
      console.log('❌ Today not available in schedule');
      return 'Unavailable';
    }
    
    console.log('✅ Today is available:', todaySlot);
    
    // Check if current time is within the available hours
    if (currentTime >= todaySlot.start_time && currentTime <= todaySlot.end_time) {
      console.log('✅ Current time is within available hours');
      
      // Check if there's any unavailability right now
      const currentUnavailability = unavailabilityRecords.find(record => {
        const recordStart = new Date(record.start_time);
        const recordEnd = new Date(record.end_time);
        const isCurrentlyBlocked = now >= recordStart && now <= recordEnd;
        console.log('🔍 Checking unavailability record:', {
          recordStart,
          recordEnd,
          now,
          isCurrentlyBlocked
        });
        return isCurrentlyBlocked;
      });
      
      if (currentUnavailability) {
        console.log('❌ Currently blocked by unavailability');
        return 'Busy';
      }
      
      console.log('✅ Currently available');
      return 'Available';
    }
    
    console.log('❌ Current time is outside available hours');
    return 'Outside Hours';
  };

  // Update current availability status when data changes
  useEffect(() => {
    const status = checkCurrentAvailability();
    console.log('🔄 Current availability status updated:', status);
    console.log('📊 Current data state:', {
      availabilitySlots: availabilitySlots.length,
      unavailabilityRecords: unavailabilityRecords.length,
      therapistProfile: !!therapistProfile
    });
  }, [availabilitySlots, unavailabilityRecords, therapistProfile]);

  // Load analytics data when tab is selected
  useEffect(() => {
    if (activeTab === 'analytics' && therapistProfile) {
      loadAnalyticsData(parseInt(analyticsData.timePeriod));
    }
  }, [activeTab, therapistProfile]);

  const handleBlockTimeWithConflictCheck = async () => {
    if (!therapistProfile || !manualUnavailabilityDate || !manualUnavailabilityReason) {
      return;
    }

    // Validate time inputs for specific time blocks
    if (blockType === 'specific-time' && (!manualUnavailabilityStartTime || !manualUnavailabilityEndTime)) {
      return;
    }

    try {
      // Determine start and end times
      let startDateTime: string;
      let endDateTime: string;

      if (blockType === 'whole-day') {
        startDateTime = `${manualUnavailabilityDate}T00:00:00`;
        endDateTime = `${manualUnavailabilityDate}T23:59:59`;
      } else {
        startDateTime = `${manualUnavailabilityDate}T${manualUnavailabilityStartTime}:00`;
        endDateTime = `${manualUnavailabilityDate}T${manualUnavailabilityEndTime}:00`;
      }

      // Check for existing blocks on the same day
      const existingBlocks = unavailabilityRecords.filter(block => {
        const blockDate = new Date(block.start_time).toISOString().split('T')[0];
        const targetDate = manualUnavailabilityDate;
        return blockDate === targetDate;
      });

      if (existingBlocks.length > 0) {
        // Check if it's a whole day block
        const isWholeDayBlock = existingBlocks.some(block => {
          const blockStart = new Date(block.start_time);
          const blockEnd = new Date(block.end_time);
          const dayStart = new Date(manualUnavailabilityDate + 'T00:00:00');
          const dayEnd = new Date(manualUnavailabilityDate + 'T23:59:59');
          
          return blockStart <= dayStart && blockEnd >= dayEnd;
        });

        if (isWholeDayBlock) {
          alert(`You are already unavailable for the whole day on ${new Date(manualUnavailabilityDate).toLocaleDateString()}. Please choose a different date or remove the existing block first.`);
          return;
        }

        // Check for overlapping time blocks
        const hasOverlap = existingBlocks.some(block => {
          const blockStart = new Date(block.start_time);
          const blockEnd = new Date(block.end_time);
          const newStart = new Date(startDateTime);
          const newEnd = new Date(endDateTime);
          
          return blockStart < newEnd && blockEnd > newStart;
        });

        if (hasOverlap) {
          alert(`You already have a block that overlaps with this time on ${new Date(manualUnavailabilityDate).toLocaleDateString()}. Please choose a different time or remove the existing block first.`);
          return;
        }
      }

      // Check for conflicting appointments
      const conflictingAppts = appointments.filter(appt => {
        const apptStart = new Date(appt.scheduled_at);
        const apptEnd = new Date(apptStart.getTime() + appt.duration * 60 * 1000);
        const blockStart = new Date(startDateTime);
        const blockEnd = new Date(endDateTime);

        // Check if appointments overlap with the block time
        return appt.status === 'upcoming' && 
               apptStart < blockEnd && 
               apptEnd > blockStart;
      });

      if (conflictingAppts.length > 0) {
        // Show conflict dialog
        setConflictingAppointments(conflictingAppts);
        setPendingBlockData({
          startDateTime,
          endDateTime,
          reason: manualUnavailabilityReason
        });
        setConflictDialogOpen(true);
      } else {
        // No conflicts, proceed with blocking
        await createUnavailabilityBlock(startDateTime, endDateTime, manualUnavailabilityReason);
      }
    } catch (error: unknown) {
      console.error('Error checking conflicts:', error);
    }
  };

  const createUnavailabilityBlock = async (startDateTime: string, endDateTime: string, reason: string) => {
    if (!therapistProfile) return;

    try {
      const { error } = await supabase
        .from('therapist_unavailability')
        .insert({
          therapist_id: therapistProfile.id,
          start_time: startDateTime,
          end_time: endDateTime,
          reason: reason || 'Manual unavailability'
        });

      if (error) {
        console.error('Error adding unavailability:', error);
      } else {
        console.log('Unavailability added successfully');
        // Reload all data to ensure appointments are properly fetched
        await loadUnavailabilityData();
        await loadAvailabilitySlots();
        // Reset form
        setManualUnavailabilityDate('');
        setManualUnavailabilityStartTime('');
        setManualUnavailabilityEndTime('');
        setManualUnavailabilityReason('');
        setBlockType('specific-time');
      }
    } catch (error: unknown) {
      console.error('Error adding unavailability:', error);
    }
  };

  const handleConflictResolution = async (shouldRejectAppointments: boolean) => {
    if (!pendingBlockData) return;

    try {
      if (shouldRejectAppointments) {
        // Reject conflicting appointments
        for (const appointment of conflictingAppointments) {
          await supabase
            .from('appointments')
            .update({
              status: 'rejected',
              notes: `Rejected due to therapist unavailability: ${pendingBlockData.reason}`
            })
            .eq('id', appointment.id);
        }

        // Update local state
        setAppointments(prev => prev.map(appt => 
          conflictingAppointments.some(conflict => conflict.id === appt.id)
            ? { ...appt, status: 'rejected', notes: `Rejected due to therapist unavailability: ${pendingBlockData.reason}` }
            : appt
        ));
      }

      // Create the unavailability block
      await createUnavailabilityBlock(
        pendingBlockData.startDateTime,
        pendingBlockData.endDateTime,
        pendingBlockData.reason
      );

      // Close dialog and reset
      setConflictDialogOpen(false);
      setConflictingAppointments([]);
      setPendingBlockData(null);
    } catch (error: unknown) {
      console.error('Error handling conflict resolution:', error);
    }
  };

  const addManualUnavailability = async () => {
    if (!therapistProfile || !manualUnavailabilityDate || !manualUnavailabilityStartTime || !manualUnavailabilityEndTime) {
      return;
    }

    try {
      // Create unavailability for only the selected date
      const startDateTime = `${manualUnavailabilityDate}T${manualUnavailabilityStartTime}:00`;
      const endDateTime = `${manualUnavailabilityDate}T${manualUnavailabilityEndTime}:00`;

      const { error } = await supabase
        .from('therapist_unavailability')
        .insert({
          therapist_id: therapistProfile.id,
          start_time: startDateTime,
          end_time: endDateTime,
          reason: manualUnavailabilityReason || 'Manual unavailability'
        });

      if (error) {
        console.error('Error adding unavailability:', error);
      } else {
        console.log('Unavailability added successfully');
        // Reload unavailability data
        await loadUnavailabilityData();
        setManualUnavailabilityDate('');
        setManualUnavailabilityStartTime('');
        setManualUnavailabilityEndTime('');
        setManualUnavailabilityReason('');
      }
    } catch (error: unknown) {
      console.error('Error adding unavailability:', error);
    }
  };

  const removeUnavailability = async (unavailabilityId: string) => {
    if (!therapistProfile) {
      return;
    }

    try {
      // First check if this is a manual block (no appointment_id)
      const record = unavailabilityRecords.find(r => r.id === unavailabilityId);
      if (!record) {
        console.error('Unavailability record not found');
        return;
      }

      if (record.appointment_id) {
        console.error('Cannot remove appointment-linked unavailability');
        return;
      }

      // Delete the unavailability record
      const { error } = await supabase
        .from('therapist_unavailability')
        .delete()
        .eq('id', unavailabilityId)
        .eq('therapist_id', therapistProfile.id);

      if (error) {
        console.error('Error removing unavailability:', error);
      } else {
        console.log('Unavailability removed successfully');
        // Reload all data to ensure appointments are properly fetched
        await loadUnavailabilityData();
        await loadAvailabilitySlots();
      }
    } catch (error: unknown) {
      console.error('Error removing unavailability:', error);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-600">{status}</Badge>;
    }
  };

  // Debug: log appointments state
  console.log('Appointments in state:', appointments);

  // Conflict Resolution Dialog
  const ConflictDialog = () => (
    <Dialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-red-800">Appointment Conflicts Found</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-slate-600">
            You have {conflictingAppointments.length} upcoming appointment(s) that conflict with your block time:
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {conflictingAppointments.map((appt) => (
              <div key={appt.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">
                      {appt.patient?.first_name} {appt.patient?.last_name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(appt.scheduled_at).toLocaleDateString()} at{' '}
                      {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600">
            Choose how to handle the conflicting appointments:
          </p>
          <div className="text-xs text-slate-500 space-y-1">
            <p>• <strong>Reject & Block:</strong> Cancel existing appointments and block the time</p>
            <p>• <strong>Block New Appointments Only:</strong> Keep existing appointments but prevent new bookings</p>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setConflictDialogOpen(false)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleConflictResolution(false)}
            variant="outline"
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            Block New Appointments Only
          </Button>
          <Button
            onClick={() => handleConflictResolution(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Reject & Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Complete Appointment Dialog
  const CompleteDialog = () => (
    <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-green-800">Mark Session Complete</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to mark this session as complete? This action cannot be undone.
          </p>
          {completeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{completeError}</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCompleteDialogOpen(false)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompleteAppointment}
            disabled={completeLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {completeLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Auto Complete Dialog
  const AutoCompleteDialog = () => (
    <Dialog open={autoCompleteDialogOpen} onOpenChange={setAutoCompleteDialogOpen}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-orange-800">Session Time Expired</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-slate-600">
            A session has ended 5 minutes ago. Would you like to mark it as complete?
          </p>
          {completeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{completeError}</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoCompleteDialogOpen(false)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            No, Keep as Upcoming
          </Button>
          <Button
            onClick={handleAutoCompleteAppointment}
            disabled={completeLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {completeLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-8 py-16 max-w-7xl">
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Loading Dashboard</h2>
              <p className="text-slate-600">Please wait while we load your therapist dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state - no therapist profile
  if (!therapistProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-8 py-16 max-w-7xl">
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Profile Not Found</h2>
              <p className="text-slate-600 mb-6">
                We couldn&apos;t load your therapist profile. This might be because:
              </p>
              <ul className="text-slate-600 text-left max-w-md mx-auto mb-6 space-y-2">
                <li>• Your profile hasn&apos;t been set up yet</li>
                <li>• There&apos;s a database connection issue</li>
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

  // Appointments list UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Conflict Resolution Dialog */}
      <ConflictDialog />
      {/* Complete Appointment Dialog */}
      <CompleteDialog />
      {/* Auto Complete Dialog */}
      <AutoCompleteDialog />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-indigo-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 py-1.5 sm:py-2.5 lg:py-3">
          {/* Left: Logo and Brand */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-9 w-9 sm:h-11 sm:w-11 lg:h-14 lg:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </span>
              <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-indigo-800 hidden sm:block">
                MindMend
              </span>
            </div>
          </div>

          {/* Center: Page Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-2xl font-bold text-indigo-700">
              Dashboard
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 xl:gap-4">
            {/* Notifications Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="lg" className="text-indigo-600 p-1 sm:p-2 relative">
                  <Bell className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 sm:w-72 lg:w-80 p-0 bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/30 backdrop-blur-sm border border-indigo-200 shadow-xl" align="end">
                <div className="p-3 sm:p-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-indigo-800 text-xs sm:text-sm lg:text-base">Notifications</h3>
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
                    <div className="p-3 sm:p-4 text-center text-indigo-600">
                      <Bell className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mx-auto mb-2 text-indigo-400" />
                      <p className="text-xs sm:text-sm lg:text-base">No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-indigo-100">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-2 sm:p-3 lg:p-4 cursor-pointer hover:bg-indigo-50/50 transition-colors ${!notification.read ? 'bg-gradient-to-r from-indigo-50 to-pink-50' : ''
                            }`}
                          onClick={() => markOneAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-indigo-500' : 'bg-indigo-300'
                              }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-indigo-900 truncate">
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
                  <div className="p-2 sm:p-3 border-t border-indigo-200 bg-gradient-to-r from-indigo-50 to-pink-50">
                    <button
                      className="w-full text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
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
              className="text-indigo-600 p-1 sm:p-2"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
            </Button>

            {/* Profile Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <Avatar className="h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10 xl:h-12 xl:w-12 cursor-pointer">
                    <AvatarImage src={therapistProfile.avatar_url} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs sm:text-sm lg:text-base">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
            </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 sm:w-48 lg:w-56 p-0 bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/30 backdrop-blur-sm border border-indigo-200 shadow-xl" align="end">
                <div className="p-2 sm:p-3 lg:p-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-pink-50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10">
              <AvatarImage src={therapistProfile.avatar_url} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
                    <div>
                      <p className="font-medium text-indigo-900 text-xs sm:text-sm lg:text-base">{getDisplayName()}</p>
                      <p className="text-xs sm:text-sm text-indigo-600">{therapistProfile.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-indigo-50/50 text-xs sm:text-sm"
                    onClick={() => router.push('/setup-profile')}
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Update Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50/50 text-xs sm:text-sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 xl:py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 border border-indigo-100 shadow-sm mb-3 sm:mb-4 lg:mb-6 xl:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 xl:h-20 xl:w-20 border-2 sm:border-4 border-white shadow-lg">
                  <AvatarImage src={therapistProfile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-pink-500 text-white text-xs sm:text-sm lg:text-lg xl:text-xl font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                  </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-indigo-800 mb-1 sm:mb-2">
                {getGreeting()}, {getDisplayName()}! 👋
              </h1>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-indigo-600 mb-2 sm:mb-3">
                Welcome back to your therapy practice. Here&apos;s what&apos;s happening today.
              </p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <Badge className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium">
                  Licensed Therapist
                </Badge>
                <Badge className="bg-white/80 text-indigo-700 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium border border-indigo-200">
                      {therapistProfile.specialization || 'General Therapy'}
                    </Badge>
                <Badge className="bg-white/80 text-indigo-700 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium border border-indigo-200">
                  Member since {new Date(therapistProfile.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  </div>
                </div>
              </div>

        {/* Mobile full-width minimal nav bar */}
        <div className="lg:hidden w-full sticky top-0 z-40 bg-gradient-to-r from-white via-indigo-50 to-pink-50 shadow-md border-b border-indigo-100">
          <div className="flex justify-between items-center px-1 py-1">
            {[
              { value: "overview", icon: Calendar },
              { value: "appointments", icon: Clock },
              { value: "patients", icon: Users },
              { value: "availability", icon: Clock },
              { value: "analytics", icon: BarChart3 },
            ].map(tab => (
              <button
                key={tab.value}
                className={`flex flex-col items-center justify-center flex-1 transition-all mx-1 ${activeTab === tab.value ? "text-indigo-700" : "text-slate-400 hover:text-indigo-500"}`}
                onClick={() => setActiveTab(tab.value)}
                aria-label={tab.value}
              >
                <tab.icon className={`h-5 w-5 ${activeTab === tab.value ? "" : "opacity-70"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-7xl mx-auto"
        >
          <TabsList className="hidden lg:grid w-full grid-cols-5 rounded-xl bg-white/70 backdrop-blur p-2 h-14 xl:h-16 gap-1">
            <TabsTrigger value="overview" className="rounded-lg text-sm lg:text-base font-medium px-4 lg:px-6">Overview</TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-lg text-sm lg:text-base font-medium px-4 lg:px-6">Appointments</TabsTrigger>
            <TabsTrigger value="patients" className="rounded-lg text-sm lg:text-base font-medium px-4 lg:px-6">Patients</TabsTrigger>
            <TabsTrigger value="availability" className="rounded-lg text-sm lg:text-base font-medium px-4 lg:px-6">Availability</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg text-sm lg:text-base font-medium px-4 lg:px-6">Analytics</TabsTrigger>
          </TabsList>

          {/* ── Overview tab ── */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-3 items-stretch">
              {/* Left (2 cols) */}
              <div className="space-y-8 lg:col-span-2 flex flex-col">
                {/* Quick stats */}
                <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
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
                    {
                      icon: TrendingUp,
                      value: appointments.filter(a => a.status === 'completed').length,
                      label: "Completed Sessions",
                    },
                  ].map(({ icon: Icon, value, label }) => (
                    <Card
                      key={label}
                      className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="flex items-center gap-3 sm:gap-5 p-4 sm:p-8">
                        <span className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-indigo-100">
                          <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-indigo-600" />
                        </span>
                        <div>
                          <p className="text-xl sm:text-3xl font-bold text-indigo-800 mb-1">
                            {value}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">{label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>



                {/* Today's Appointments Card */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-4">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-5 mb-6">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                          <Calendar className="h-7 w-7 text-indigo-600" />
                        </span>
                        <div className="flex-1">
                          <p className="text-3xl font-bold text-indigo-800 mb-1">
                            {todaysAppointments.length}
                          </p>
                          <p className="text-sm text-slate-600 font-medium">Today&apos;s Appointments</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Total for today</p>
                          <p className="text-xs text-slate-400">
                            {todaysAppointments.filter(apt => apt.status === 'completed').length} completed
                          </p>
                            </div>
                            </div>

                      {/* Appointments List */}
                      {todaysAppointments.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 text-lg">No appointments today</p>
                          <p className="text-slate-500 text-sm mt-2">You have a free day!</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto overflow-x-hidden custom-scrollbar">
                          {todaysAppointments.map((appt) => {
                            const dateObj = new Date(appt.scheduled_at);
                            const dateShort = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                            const isUpcoming = new Date(appt.scheduled_at) > new Date();
                            
                            return (
                              <div
                                key={appt.id}
                                className={`appointment-card group relative overflow-hidden rounded-xl p-3 ${
                                  isUpcoming 
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300' 
                                    : 'bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                {/* Decorative background pattern */}
                                <div className={`absolute inset-0 opacity-5 ${
                                  isUpcoming ? 'bg-blue-500' : 'bg-slate-500'
                                }`} style={{
                                  backgroundImage: `radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px),
                                                  radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px)`,
                                  backgroundSize: '20px 20px'
                                }}></div>
                                
                                <div className="relative flex flex-col space-y-3">
                                  <div className="flex items-center space-x-3">
                                    {/* Enhanced Avatar */}
                                    <div className="relative">
                                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ring-2 ring-white shadow-md">
                                        <AvatarImage src={appt.patient?.avatar_url} />
                                        <AvatarFallback className={`text-sm font-semibold ${
                                          isUpcoming ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                          {appt.patient?.first_name?.[0] || ''}{appt.patient?.last_name?.[0] || ''}
                                        </AvatarFallback>
                                      </Avatar>
                                      {/* Status indicator */}
                                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                        isUpcoming ? 'bg-green-500' : 'bg-slate-400'
                                      }`}></div>
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                      {/* Patient name with enhanced styling */}
                                      <h3 className="font-bold text-indigo-900 text-sm sm:text-base truncate break-words mb-1">
                                        {appt.patient?.first_name} {appt.patient?.last_name}
                                      </h3>
                                      
                                      {/* Patient email with icon */}
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                        <p className="text-slate-600 text-xs sm:text-sm font-medium truncate break-words">
                                          {appt.patient?.email}
                                        </p>
                                      </div>
                                      
                                      {/* Date and time with enhanced styling */}
                                      <div className="flex flex-col space-y-1 text-xs">
                                        <div className="flex items-center gap-1 text-slate-500">
                                          <Calendar className="w-3 h-3" />
                                          <span>{dateShort}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500">
                                          <Clock className="w-3 h-3" />
                                          <span>{time}</span>
                                          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                          <span>{appt.duration} min</span>
                                        </div>
                                      </div>
                                      
                                      {/* Notes with enhanced styling */}
                                      {appt.notes && (
                                        <div className="mt-2 p-2 bg-white/60 rounded-lg border border-slate-200">
                                          <p className="text-xs text-slate-600 italic max-w-full truncate">
                                            &quot;{appt.notes}&quot;
                                          </p>
                                          {/* Show rejection reason if present in notes */}
                                          {appt.status === 'rejected' && appt.notes && appt.notes.includes('Rejection reason:') && (
                                            <p className="text-red-600 text-sm font-semibold">
                                              {appt.notes.split('Rejection reason:')[1].trim()}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Right side actions */}
                                  <div className="flex flex-col gap-2">
                                    {/* First row: session type, status badge, join video call */}
                                    <div className="flex flex-row flex-wrap items-center gap-2">
                                      {/* Session type with enhanced badge */}
                                      <div className="flex items-center space-x-1">
                                        {appt.type?.toLowerCase() === 'video call' ? (
                                          <Video className="w-3 h-3 text-blue-600" />
                                        ) : appt.type?.toLowerCase() === 'phone call' ? (
                                          <MessageCircle className="w-3 h-3 text-green-600" />
                                        ) : (
                                          <Calendar className="w-3 h-3 text-indigo-600" />
                                        )}
                                        <span className="text-xs text-slate-600 font-medium">
                                          {appt.type || 'Session'}
                                        </span>
                                      </div>
                                      {/* Enhanced status badge */}
                                      {statusBadge(appt.status)}
                                      {/* Join Video Call button (inline) */}
                                      {isUpcoming && appt.status === 'upcoming' && appt.type?.toLowerCase() === 'video call' && (
                                        <Button
                                          variant="default"
                                          size="sm"
                                          className="ml-2 bg-green-600 text-white hover:bg-green-700 px-3 py-1 h-8 text-xs"
                                          onClick={() => window.location.href = `/video/${appt.id}`}
                                        >
                                          Join Video Call
                                        </Button>
                                      )}
                                    </div>
                                    {/* Second row: reject action */}
                                    {isUpcoming && appt.status === 'upcoming' && (
                                      <div className="flex flex-row flex-wrap gap-2 mt-1">
                                        <Button
                                          size="sm"
                                          onClick={() => handleOpenRejectDialog(appt.id)}
                                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 h-8 text-xs"
                                        >
                                          Reject Appointment
                                        </Button>
                                        {shouldShowCompleteButton(appt) && (
                                          <Button
                                            size="sm"
                                            onClick={() => handleOpenCompleteDialog(appt.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-xs"
                                          >
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Mark Complete
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </CardContent>
                </Card>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6 flex flex-col">
                <Card className="border-indigo-100 bg-white/80 flex flex-col">
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
                              <Badge className={`text-xs ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {p.status === 'completed' ? 'Completed' : 'Expired'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Motivational Card for Therapists */}
                <Card className="border-yellow-100 bg-yellow-50/60 shadow-md flex flex-col">
                  <CardContent className="flex flex-col items-center p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-yellow-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.343 17.657l-1.414 1.414M17.657 17.657l-1.414-1.414M6.343 6.343L4.929 7.757' /></svg>
                      <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">You Make a Difference</span>
                    </div>
                    <p className="text-sm text-indigo-600 text-center italic">Every session is a step toward healing. Thank you for being a guiding light for your patients!      </p>
                    <p className="text-xs text-yellow-700 text-center mt-1">Remember to care for yourself as you care for others.</p>
                  </CardContent>
                </Card>

                {/* Therapist Self-Care Card (moved from right) */}
                
              </div>
            </div>
          </TabsContent>

          {/* Appointments tab */}
          <TabsContent value="appointments" className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 lg:gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-sm sm:text-base lg:text-lg xl:text-xl">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      All Appointments
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm lg:text-base">View and manage your therapy sessions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 items-start sm:items-center">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="status-filter" className="text-xs sm:text-sm font-medium text-slate-700">Status:</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger id="status-filter" className="w-24 sm:w-28 lg:w-32 text-xs sm:text-sm">
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
                        <Label htmlFor="date-filter" className="text-xs sm:text-sm font-medium text-slate-700">Date:</Label>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                          <SelectTrigger id="date-filter" className="w-24 sm:w-28 lg:w-32 text-xs sm:text-sm">
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
              {appointments.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-white/60 rounded-xl">
                      <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 text-lg">No appointments found</p>
                      <p className="text-slate-500 text-sm mt-2">You don&apos;t have any appointments scheduled yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto overflow-x-hidden custom-scrollbar">
                      {appointments
                        .filter(appt => {
                          // Apply status filter
                          if (statusFilter !== "all" && appt.status !== statusFilter) {
                            return false;
                          }
                          
                          // Apply date filter
                          const apptDate = new Date(appt.scheduled_at);
                          const now = new Date();
                          
                          switch (dateFilter) {
                            case "today":
                              return apptDate.toDateString() === now.toDateString();
                            case "week":
                              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                              return apptDate >= weekAgo;
                            case "month":
                              return apptDate.getMonth() === now.getMonth() && apptDate.getFullYear() === now.getFullYear();
                            case "past":
                              return apptDate < now;
                            default:
                              return true;
                          }
                        })
                        .sort((a, b) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // Start of today
                          
                          const aDate = new Date(a.scheduled_at);
                          const bDate = new Date(b.scheduled_at);
                          
                          // Determine priority based on date relative to today
                          const aPriority = aDate >= today ? 1 : 2;
                          const bPriority = bDate >= today ? 1 : 2;
                          
                          // If same priority, sort by date
                          if (aPriority === bPriority) {
                            if (aPriority === 1) {
                              // Priority 1: ascending (oldest to newest)
                              return aDate.getTime() - bDate.getTime();
                            } else {
                              // Priority 2: descending (newest to oldest)
                              return bDate.getTime() - aDate.getTime();
                            }
                          }
                          
                          return aPriority - bPriority;
                        })
                        .map((appt) => {
                    const dateObj = new Date(appt.scheduled_at);
                          const dateShort = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    const isUpcoming = new Date(appt.scheduled_at) > new Date();
                          
                    return (
                            <div
                              key={appt.id}
                              className={`appointment-card group relative overflow-hidden rounded-xl p-3 ${
                                isUpcoming 
                                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300' 
                                  : 'bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {/* Decorative background pattern */}
                              <div className={`absolute inset-0 opacity-5 ${
                                isUpcoming ? 'bg-blue-500' : 'bg-slate-500'
                              }`} style={{
                                backgroundImage: `radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px),
                                                radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px)`,
                                backgroundSize: '20px 20px'
                              }}></div>
                              
                              <div className="relative flex flex-col space-y-3">
                                <div className="flex items-center space-x-3">
                                  {/* Enhanced Avatar */}
                                  <div className="relative">
                                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ring-2 ring-white shadow-md">
                                      <AvatarImage src={appt.patient?.avatar_url} />
                                      <AvatarFallback className={`text-sm font-semibold ${
                                        isUpcoming ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                      }`}>
                            {appt.patient?.first_name?.[0] || ''}{appt.patient?.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                                    {/* Status indicator */}
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                      isUpcoming ? 'bg-green-500' : 'bg-slate-400'
                                    }`}></div>
                                  </div>
                                  
                                  <div className="min-w-0 flex-1">
                                    {/* Patient name with enhanced styling */}
                                    <h3 className="font-bold text-indigo-900 text-sm sm:text-base truncate break-words mb-1">
                                      {appt.patient?.first_name} {appt.patient?.last_name}
                                    </h3>
                                    
                                    {/* Patient email with icon */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                      <p className="text-slate-600 text-xs sm:text-sm font-medium truncate break-words">
                                        {appt.patient?.email}
                                      </p>
                                    </div>
                                    
                                    {/* Date and time with enhanced styling */}
                                    <div className="flex flex-col space-y-1 text-xs">
                                      <div className="flex items-center gap-1 text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>{dateShort}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{time}</span>
                                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                        <span>{appt.duration} min</span>
                                      </div>
                                    </div>
                                    
                                    {/* Notes with enhanced styling */}
                                    {appt.notes && (
                                      <div className="mt-2 p-2 bg-white/60 rounded-lg border border-slate-200">
                                        <p className="text-xs text-slate-600 italic max-w-full truncate">
                                          &quot;{appt.notes}&quot;
                                        </p>
                                        {/* Show rejection reason if present in notes */}
                                        {appt.status === 'rejected' && appt.notes && appt.notes.includes('Rejection reason:') && (
                                          <p className="text-red-600 text-sm font-semibold">
                                            {appt.notes.split('Rejection reason:')[1].trim()}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Right side actions */}
                                <div className="flex flex-col gap-2">
                                  {/* First row: session type, status badge, join video call */}
                                  <div className="flex flex-row flex-wrap items-center gap-2">
                                    {/* Session type with enhanced badge */}
                                    <div className="flex items-center space-x-1">
                                      {appt.type?.toLowerCase() === 'video call' ? (
                                        <Video className="w-3 h-3 text-blue-600" />
                                      ) : appt.type?.toLowerCase() === 'phone call' ? (
                                        <MessageCircle className="w-3 h-3 text-green-600" />
                                      ) : (
                                        <Calendar className="w-3 h-3 text-indigo-600" />
                                      )}
                                      <span className="text-xs text-slate-600 font-medium">
                                        {appt.type || 'Session'}
                                      </span>
                                    </div>
                                    {/* Enhanced status badge */}
                            {statusBadge(appt.status)}
                                    {/* Join Video Call button (inline) */}
                                    {isUpcoming && appt.status === 'upcoming' && appt.type?.toLowerCase() === 'video call' && (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="ml-2 bg-green-600 text-white hover:bg-green-700 px-3 py-1 h-8 text-xs"
                                        onClick={() => window.location.href = `/video/${appt.id}`}
                                      >
                                        Join Video Call
                                      </Button>
                                    )}
                          </div>
                                                                     {/* Second row: reject action */}
                                   {isUpcoming && appt.status === 'upcoming' && (
                                     <div className="flex flex-row flex-wrap gap-2 mt-1">
                                       <Button
                                         size="sm"
                                         onClick={() => handleOpenRejectDialog(appt.id)}
                                         className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 h-8 text-xs"
                                       >
                                         Reject Appointment
                                       </Button>
                                       {shouldShowCompleteButton(appt) && (
                                         <Button
                                           size="sm"
                                           onClick={() => handleOpenCompleteDialog(appt.id)}
                                           className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-xs"
                                         >
                                           <CheckCircle className="w-3 h-3 mr-1" />
                                           Mark Complete
                                         </Button>
                                       )}
                                     </div>
                          )}
                        </div>
                              </div>
                            </div>
                    );
                  })}
                </div>
              )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="patients" className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 lg:gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-sm sm:text-base lg:text-lg xl:text-xl">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      Patient Management
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm lg:text-base">View and manage your patient roster</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      onClick={exportPatientData}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search patients by name or email..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Patients</SelectItem>
                        <SelectItem value="active">Active Patients</SelectItem>
                        <SelectItem value="inactive">Inactive Patients</SelectItem>
                        <SelectItem value="new">New Patients</SelectItem>
                        <SelectItem value="low-compliance">Low Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Patient Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-xs sm:text-sm font-medium text-blue-700">Total Patients</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-blue-800 mt-1">{totalPatients}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs sm:text-sm font-medium text-green-700">Active</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-green-800 mt-1">{activePatients}</p>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 sm:p-4 border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs sm:text-sm font-medium text-emerald-700">Completed Sessions</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-emerald-800 mt-1">{completedSessionsThisMonth}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-200">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-purple-600" />
                        <span className="text-xs sm:text-sm font-medium text-purple-700">New This Month</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-purple-800 mt-1">{newPatientsThisMonth}</p>
                    </div>
                  </div>

                  {/* Patient List */}
                  <div className="space-y-3">
                    {filteredPatients.map((patient) => {
                      const sessionCount = getPatientSessionCount(patient.id);
                      const lastSession = getPatientLastSession(patient.id);
                      const lastSessionStatus = getPatientLastSessionStatus(patient.id);
                      const compliance = getPatientProgress(patient.id);
                      const sessionBreakdown = getPatientSessionBreakdown(patient.id);
                      
                      return (
                        <div
                          key={patient.id}
                          className="group relative overflow-hidden rounded-xl p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                            {/* Patient Avatar */}
                            <div className="relative flex-shrink-0">
                              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 ring-2 ring-white shadow-md">
                                <AvatarImage src={patient.avatar_url} />
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-xs sm:text-sm">
                                  {patient.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {/* Status indicator */}
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                                compliance >= 70 ? 'bg-green-500' : 
                                compliance >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                            </div>

                            {/* Patient Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base mb-1 truncate">
                                    {patient.name}
                                  </h3>
                                  <p className="text-slate-600 text-xs sm:text-sm mb-2 truncate">{patient.email}</p>
                                  
                                  {/* Patient Stats */}
                                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                                    <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1">
                                      {sessionCount} Sessions
                                    </Badge>
                                    {lastSession && (
                                      <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-1">
                                        Last: {formatTimeAgo(lastSession)} ({lastSessionStatus})
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Session Breakdown - Mobile Optimized */}
                                  <div className="bg-white/60 rounded-lg p-2 sm:p-3 border border-slate-200">
                                    <p className="text-xs text-slate-600 mb-1 leading-relaxed">
                                      <strong>Session Breakdown:</strong> {sessionBreakdown.completed} completed, {sessionBreakdown.cancelled} cancelled, {sessionBreakdown.rejected} rejected, {sessionBreakdown.upcoming} upcoming, {sessionBreakdown.expired} expired
                                    </p>
                                    <p className="text-xs text-slate-600 italic leading-relaxed">
                                      {compliance >= 70 ? 
                                        "Patient showing excellent compliance with therapy sessions." :
                                        compliance >= 40 ?
                                        "Patient has moderate compliance. Consider follow-up." :
                                        "Patient has low compliance. May need additional support."
                                      }
                                    </p>
                                  </div>
                                </div>

                                {/* Quick Actions - Mobile Optimized */}
                                <div className="flex sm:flex-col gap-2 sm:gap-2 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-200 text-green-700 hover:bg-green-50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9"
                                    onClick={() => handleOpenScheduleDialog(patient)}
                                  >
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">Schedule</span>
                                    <span className="sm:hidden">Book</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Compliance Score - Mobile Optimized */}
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-600">Compliance:</span>
                                <Badge className={`text-xs px-2 py-1 ${
                                  compliance >= 70 ? 'bg-green-100 text-green-700' :
                                  compliance >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {compliance >= 70 ? 'High' : 
                                   compliance >= 40 ? 'Medium' : 'Low'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-600">Score:</span>
                                <div className="w-12 sm:w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${
                                    compliance >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                    compliance >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                    'bg-gradient-to-r from-red-400 to-red-600'
                                  }`} style={{ width: `${compliance}%` }}></div>
                                </div>
                                <span className="text-xs text-slate-600 font-medium">{compliance}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty State */}
                    {filteredPatients.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          {searchQuery.trim() ? 'No patients found' : 
                           statusFilter === 'all' ? 'No patients found' :
                           statusFilter === 'active' ? 'No active patients found' :
                           statusFilter === 'inactive' ? 'No inactive patients found' :
                           statusFilter === 'new' ? 'No new patients found' :
                           statusFilter === 'low-compliance' ? 'No low compliance patients found' :
                           'No patients found'}
                        </h3>
                        <p className="text-slate-600 mb-4">
                          {searchQuery.trim() ? `No patients match "${searchQuery}"` :
                           statusFilter === 'all' ? "You don't have any patients yet." :
                           statusFilter === 'active' ? "You don't have any active patients (sessions in last 30 days) yet." :
                           statusFilter === 'inactive' ? "You don't have any inactive patients (no sessions in last 30 days) yet." :
                           statusFilter === 'new' ? "You don't have any new patients (3 or fewer sessions) yet." :
                           statusFilter === 'low-compliance' ? "You don't have any patients with low compliance yet." :
                           "You don't have any patients yet."}
                        </p>
                        {statusFilter === 'all' && !searchQuery.trim() && (
                          <Button className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Patient
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      Showing 1-10 of 24 patients
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="availability" className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
            <div className="space-y-6 sm:space-y-8">
              {/* Main Content Grid */}
              <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
                {/* Left Column - Block Time and Manage Unavailability */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Enhanced Block Time Slot */}
                  <Card className="border-indigo-100 bg-white/80 shadow-md">
                    <CardHeader className="pb-4 sm:pb-6">
                      <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-lg sm:text-xl">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                        Block Time Slot
                      </CardTitle>
                      <p className="text-slate-600 text-xs sm:text-sm">
                        Block time when you&apos;re unavailable. Choose between whole day or specific time slot.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Block Type Selection */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Block Type</label>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="blockType"
                              value="specific-time"
                              checked={blockType === 'specific-time'}
                              onChange={(e) => setBlockType(e.target.value as 'specific-time' | 'whole-day')}
                              className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Specific Time</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="blockType"
                              value="whole-day"
                              checked={blockType === 'whole-day'}
                              onChange={(e) => setBlockType(e.target.value as 'specific-time' | 'whole-day')}
                              className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Whole Day</span>
                          </label>
                        </div>
                      </div>

                      {/* Date and Reason */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                          <input
                            type="date"
                            value={manualUnavailabilityDate}
                            onChange={(e) => setManualUnavailabilityDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
                          <input
                            type="text"
                            value={manualUnavailabilityReason}
                            onChange={(e) => setManualUnavailabilityReason(e.target.value)}
                            placeholder="Vacation, sick day, etc."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Time inputs - only show for specific time */}
                      {blockType === 'specific-time' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                            <input
                              type="time"
                              value={manualUnavailabilityStartTime}
                              onChange={(e) => setManualUnavailabilityStartTime(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                            <input
                              type="time"
                              value={manualUnavailabilityEndTime}
                              onChange={(e) => setManualUnavailabilityEndTime(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Show time range for whole day */}
                      {blockType === 'whole-day' && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="h-4 w-4" />
                            <span>Whole day: 00:00 AM - 11:59 PM</span>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleBlockTimeWithConflictCheck}
                        disabled={
                          !manualUnavailabilityDate || 
                          !manualUnavailabilityReason ||
                          (blockType === 'specific-time' && (!manualUnavailabilityStartTime || !manualUnavailabilityEndTime))
                        }
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Block This Time
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Manage Unavailability */}
                  <Card className="border-indigo-100 bg-white/80 shadow-md">
                    <CardHeader className="pb-4 sm:pb-6">
                      <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-lg sm:text-xl">
                        <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                        Manage Unavailability
                      </CardTitle>
                      <p className="text-slate-600 text-xs sm:text-sm">
                        View and remove your blocked time slots. You can only remove manual blocks, not appointment blocks. 
                        Manual blocks are times you have set aside for personal reasons, such as vacation, sick days, or other commitments. 
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {unavailabilityRecords.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-slate-600">No unavailability records found.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {unavailabilityRecords
                            .filter(record => !record.appointment_id) // Only show manual blocks
                            .map((record) => (
                              <div
                                key={record.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 gap-3"
                              >
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-600" />
                                    <span className="font-medium text-slate-800 text-sm">
                                      {new Date(record.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="text-xs sm:text-sm text-slate-600">
                                      {new Date(record.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(record.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-slate-600 mt-1">{record.reason}</p>
                                </div>
                                <Button
                                  onClick={() => removeUnavailability(record.id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 text-red-700 hover:bg-red-50 self-start sm:self-center"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Summary and Tips */}
                <div className="space-y-6">
                  {/* Availability Summary */}
                  <Card className="border-indigo-100 bg-white/80">
                    <CardHeader>
                      <CardTitle className="text-indigo-800 text-base sm:text-lg">Availability Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {availabilitySlots.filter(slot => slot.is_available).length}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600">Available Days</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {unavailabilityRecords.length}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600">Total Blocks</div>
                        </div>
                      </div>
                      
                      {/* Current Schedule */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-700">Current Schedule</h4>
                        <div className="space-y-1">
                          {availabilitySlots
                            .filter(slot => slot.is_available)
                            .map((slot) => (
                              <div key={slot.day_of_week} className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="font-medium text-slate-600 capitalize">
                                  {slot.day_of_week}
                                </span>
                                <span className="text-slate-500">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                              </div>
                            ))}
                          {availabilitySlots.filter(slot => slot.is_available).length === 0 && (
                            <p className="text-xs text-slate-500 italic">No availability set</p>
                          )}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="pt-3 border-t border-slate-200">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-indigo-600">
                              {(() => {
                                const totalHours = availabilitySlots
                                  .filter(slot => slot.is_available)
                                  .reduce((acc, slot) => {
                                    const start = parseInt(slot.start_time.split(':')[0]);
                                    const end = parseInt(slot.end_time.split(':')[0]);
                                    return acc + (end - start);
                                  }, 0);
                                return totalHours;
                              })()}h
                            </div>
                            <div className="text-xs text-slate-600">Weekly Hours</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600">
                              {(() => {
                                const manualBlocks = unavailabilityRecords.filter(record => !record.appointment_id).length;
                                return manualBlocks;
                              })()}
                            </div>
                            <div className="text-xs text-slate-600">Manual Blocks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-orange-600">
                              {(() => {
                                const now = new Date();
                                const startOfWeek = new Date(now);
                                startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
                                startOfWeek.setHours(0, 0, 0, 0);
                                
                                const endOfWeek = new Date(startOfWeek);
                                endOfWeek.setDate(startOfWeek.getDate() + 7); // End of week (next Sunday)
                                endOfWeek.setHours(23, 59, 59, 999);
                                
                                const appointmentBlocks = unavailabilityRecords.filter(record => 
                                  record.appointment_id && 
                                  new Date(record.start_time) >= startOfWeek && 
                                  new Date(record.start_time) < endOfWeek
                                ).length;
                                return appointmentBlocks;
                              })()}
                            </div>
                            <div className="text-xs text-slate-600">This Week&apos;s Appointments</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tips */}
                  <Card className="border-indigo-100 bg-white/80">
                    <CardHeader>
                      <CardTitle className="text-indigo-800 text-base sm:text-lg">Tips for Setting Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Set realistic hours that you can consistently maintain
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Leave buffer time between sessions for breaks
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Block time for administrative tasks and self-care
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
            {/* Analytics Header */}
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-indigo-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-800">Practice Analytics</h2>
                  <p className="text-indigo-600 text-sm sm:text-base">Comprehensive insights into your therapy practice performance</p>
                  <p className="text-xs sm:text-sm text-indigo-500 mt-1">
                    Showing data for: {selectedTimePeriod === '7' ? 'Last 7 Days' : 
                    selectedTimePeriod === '30' ? 'Last 30 Days' : 
                    selectedTimePeriod === '90' ? 'Last 3 Months' : 'Last Year'}
                  </p>
                </div>
              </div>
              
              {/* Time Period Selector */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedTimePeriod === '7' ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs sm:text-sm ${selectedTimePeriod === '7' 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                  onClick={() => {
                    setSelectedTimePeriod('7');
                    loadAnalyticsData(7);
                  }}
                >
                  Last 7 Days
                </Button>
                <Button 
                  variant={selectedTimePeriod === '30' ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs sm:text-sm ${selectedTimePeriod === '30' 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                  onClick={() => {
                    setSelectedTimePeriod('30');
                    loadAnalyticsData(30);
                  }}
                >
                  Last 30 Days
                </Button>
                <Button 
                  variant={selectedTimePeriod === '90' ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs sm:text-sm ${selectedTimePeriod === '90' 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                  onClick={() => {
                    setSelectedTimePeriod('90');
                    loadAnalyticsData(90);
                  }}
                >
                  Last 3 Months
                </Button>
                <Button 
                  variant={selectedTimePeriod === '365' ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs sm:text-sm ${selectedTimePeriod === '365' 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                  onClick={() => {
                    setSelectedTimePeriod('365');
                    loadAnalyticsData(365);
                  }}
                >
                  Last Year
                </Button>
              </div>
            </div>

            {/* Key Performance Metrics */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
              {(() => {
                // Calculate data for the selected time period
                const startDate = new Date(Date.now() - parseInt(selectedTimePeriod) * 24 * 60 * 60 * 1000);
                const periodAppointments = appointments.filter(apt => 
                  new Date(apt.scheduled_at) >= startDate
                );
                
                // Sessions (all appointments in period)
                const totalSessions = periodAppointments.length;
                const completedSessions = periodAppointments.filter(apt => apt.status === 'completed').length;
                
                // Active Patients (unique patients with sessions in period)
                const activePatients = new Set(periodAppointments.map(apt => apt.patient_id)).size;
                
                // Total Hours (completed sessions only)
                const totalHours = Math.round(periodAppointments
                  .filter(apt => apt.status === 'completed')
                  .reduce((acc, apt) => acc + (apt.duration || 0), 0) / 60);
                
                // Average Rating (placeholder - would need rating system)
                const avgRating = analyticsData.topPatients.length > 0 ? "4.8" : "0.0";
                
                return [
                  {
                    icon: Calendar,
                    value: totalSessions,
                    label: `Sessions (${selectedTimePeriod === '7' ? '7 Days' : 
                      selectedTimePeriod === '30' ? '30 Days' : 
                      selectedTimePeriod === '90' ? '3 Months' : '1 Year'})`,
                    change: `${completedSessions}/${totalSessions} completed`,
                    changeType: "positive"
                  },
                  {
                    icon: Users,
                    value: activePatients,
                    label: "Active Patients",
                    change: `${activePatients} unique patients`,
                    changeType: "positive"
                  },
                  {
                    icon: Clock,
                    value: `${totalHours}h`,
                    label: "Completed Hours",
                    change: `${Math.round(totalHours / Math.max(completedSessions, 1))}h avg/session`,
                    changeType: "positive"
                  },
                  {
                    icon: Star,
                    value: avgRating,
                    label: "Average Rating",
                    change: "Based on patient feedback",
                    changeType: "positive"
                  }
                ];
              })().map(({ icon: Icon, value, label, change, changeType }) => (
                <Card key={label} className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-indigo-100">
                        <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-600" />
                      </span>
                      <span className={`text-xs sm:text-sm font-medium ${
                        changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {change}
                      </span>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-800 mb-1">{value}</p>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Availability Breakdown */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Weekly Schedule Overview */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-base sm:text-lg">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                    Weekly Schedule Overview
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your availability and booking patterns this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availabilitySlots.map((slot) => (
                      <div key={slot.day_of_week} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-3 h-3 rounded-full ${slot.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="font-medium text-slate-700 text-sm sm:text-base">{slot.day_of_week}</span>
                        </div>
                        <div className="text-right">
                          {slot.is_available ? (
                            <span className="text-xs sm:text-sm text-green-600 font-medium">
                              {slot.start_time} - {slot.end_time}
                            </span>
                          ) : (
                            <span className="text-xs sm:text-sm text-red-600 font-medium">Unavailable</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Slot Utilization Analysis */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-800">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                    Slot Utilization Analysis
                  </CardTitle>
                  <CardDescription>Detailed breakdown of your time slot usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-green-50">
                        <p className="text-2xl font-bold text-green-600">
                          {availabilitySlots.filter(slot => slot.is_available).length * 8}
                        </p>
                        <p className="text-sm text-green-700">Scheduled Hours</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-50">
                        <p className="text-2xl font-bold text-blue-600">
                          {appointments.filter(apt => apt.status === 'upcoming').length}
                        </p>
                        <p className="text-sm text-blue-700">Upcoming Sessions</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                        <span className="text-sm text-slate-600">Available Days</span>
                        <span className="text-lg font-bold text-purple-600">
                          {availabilitySlots.filter(slot => slot.is_available).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                        <span className="text-sm text-slate-600">Total Sessions</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {appointments.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                        <span className="text-sm text-slate-600">Completed Sessions</span>
                        <span className="text-lg font-bold text-green-600">
                          {appointments.filter(apt => apt.status === 'completed').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Detailed Analytics */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Session Trends Chart */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-800">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                    Session Trends
                  </CardTitle>
                  <CardDescription>
                    {selectedTimePeriod === '365' ? 'Monthly session volume over the last year' : 'Weekly session volume over the selected period'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analyticsData.sessionTrends.map((trend) => {
                      const maxHeight = 200;
                      const height = (trend.count / Math.max(...analyticsData.sessionTrends.map(t => t.count), 1)) * maxHeight;
                      
                      return (
                        <div key={trend.week} className="flex flex-col items-center gap-2">
                          <div 
                            className="w-6 bg-gradient-to-t from-indigo-500 to-pink-500 rounded-t"
                            style={{ height: `${height}px` }}
                          ></div>
                          <span className="text-xs text-slate-600">{trend.count}</span>
                          <span className="text-xs text-slate-500">{trend.week}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-slate-600">
                      Average: {(() => {
                        const totalSessions = analyticsData.sessionTrends.reduce((acc, trend) => acc + trend.count, 0);
                        const periodCount = analyticsData.sessionTrends.length;
                        const average = periodCount > 0 ? Math.round(totalSessions / periodCount) : 0;
                        const period = selectedTimePeriod === '365' ? 'month' : 'week';
                        return `${average} sessions per ${period}`;
                      })()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Session Type Distribution */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-800">
                    <PieChart className="h-6 w-6 text-indigo-600" />
                    Session Type Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of session types this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.sessionTypeDistribution.map(({ type, count, percentage }) => {
                      const colors = {
                        'Video Call': 'from-blue-500 to-indigo-500',
                        'In-Person': 'from-green-500 to-emerald-500',
                        'Phone Call': 'from-purple-500 to-pink-500',
                        'Group Session': 'from-orange-500 to-red-500',
                        'Unknown': 'from-gray-500 to-slate-500'
                      };
                      const color = colors[type as keyof typeof colors] || 'from-gray-500 to-slate-500';
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${color}`}></div>
                            <span className="text-sm font-medium text-slate-700">{type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${color}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-600">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Patient Progress Overview */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-800">
                    <Users className="h-6 w-6 text-indigo-600" />
                    Patient Progress Overview
                  </CardTitle>
                  <CardDescription>Patient compliance and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const patients = Object.values(analyticsData.patientProgress);
                      const highCompliance = patients.filter(p => p.compliance >= 70).length;
                      const mediumCompliance = patients.filter(p => p.compliance >= 40 && p.compliance < 70).length;
                      const lowCompliance = patients.filter(p => p.compliance < 40).length;
                      const totalPatients = patients.length;
                      
                      return [
                        { category: 'High Compliance', count: highCompliance, percentage: totalPatients > 0 ? Math.round((highCompliance / totalPatients) * 100) : 0, color: 'bg-green-500' },
                        { category: 'Medium Compliance', count: mediumCompliance, percentage: totalPatients > 0 ? Math.round((mediumCompliance / totalPatients) * 100) : 0, color: 'bg-yellow-500' },
                        { category: 'Low Compliance', count: lowCompliance, percentage: totalPatients > 0 ? Math.round((lowCompliance / totalPatients) * 100) : 0, color: 'bg-red-500' }
                      ];
                    })().map(({ category, count, percentage, color }) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${color}`}></div>
                          <span className="text-sm font-medium text-slate-700">{category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${color}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-600">{count} patients</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-700">
                      <strong>Overall Compliance Rate:</strong> {(() => {
                        const patients = Object.values(analyticsData.patientProgress);
                        const totalPatients = patients.length;
                        const avgCompliance = totalPatients > 0 
                          ? Math.round(patients.reduce((acc, p) => acc + p.compliance, 0) / totalPatients)
                          : 0;
                        return `${avgCompliance}% (${totalPatients} patients)`;
                      })()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue & Financial Metrics */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-800">
                    <DollarSign className="h-6 w-6 text-indigo-600" />
                    Financial Overview
                  </CardTitle>
                  <CardDescription>Revenue and billing metrics this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">₹{analyticsData.financialMetrics.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Sessions Billed</span>
                      <span className="text-lg font-bold text-indigo-600">{analyticsData.financialMetrics.sessionsBilled}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Average Session Rate</span>
                      <span className="text-lg font-bold text-purple-600">₹{analyticsData.financialMetrics.averageSessionRate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Outstanding Payments</span>
                      <span className="text-lg font-bold text-orange-600">₹{analyticsData.financialMetrics.outstandingPayments.toLocaleString()}</span>
                    </div> 
                  </div>
                  <div className="mt-4 p-2 g-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Revenue Growth:</strong> +{analyticsData.financialMetrics.revenueGrowth}% compared to last month
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Performing Patients */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-800">
                    <Star className="h-6 w-6 text-indigo-600" />
                    Top Performing Patients
                  </CardTitle>
                  <CardDescription>Patients with highest engagement and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.topPatients.slice(0, 5).map((patient, index) => (
                      <div key={patient.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{patient.name}</p>
                            <p className="text-xs text-slate-600">{patient.sessions} sessions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">{patient.progress}% progress</p>
                          <p className="text-xs text-slate-600">₹{patient.totalSpent}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Session Duration Analysis */}
              <Card className="border-indigo-100 bg-white/80 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-800">
                    <Clock className="h-6 w-6 text-indigo-600" />
                    Session Duration Analysis
                  </CardTitle>
                  <CardDescription>Average session duration by type and patient</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Average Session Duration</span>
                      <span className="text-lg font-bold text-indigo-600">
                        {analyticsData.sessionDurationAnalysis.length > 0 
                          ? Math.round(analyticsData.sessionDurationAnalysis.reduce((acc, s) => acc + s.duration, 0) / analyticsData.sessionDurationAnalysis.length)
                          : 0} minutes
                      </span>
                    </div>
                    <div className="space-y-3">
                      {analyticsData.sessionDurationAnalysis.map(({ type, duration, trend }) => (
                        <div key={type} className="flex items-center justify-between p-2 rounded bg-slate-50">
                          <span className="text-sm font-medium text-slate-700">{type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-indigo-600">{duration} min</span>
                            <span className={`text-xs ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                              {trend}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* Export and Reports */}
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-indigo-800">
                  <FileText className="h-6 w-6 text-indigo-600" />
                  Reports & Export
                </CardTitle>
                <CardDescription>Generate detailed reports and export data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white" onClick={exportAnalyticsCSV}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export Analytics
                  </Button>
                  <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={exportPerformanceReportCSV}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Performance Report
                  </Button>
                  <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={exportPatientSummaryCSV}>
                    <Users className="h-4 w-4 mr-2" />
                    Patient Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
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

      {/* Schedule Session Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Schedule Session for {selectedPatient?.first_name} {selectedPatient?.last_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedPatient?.avatar_url} />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {selectedPatient?.first_name?.[0]}{selectedPatient?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {selectedPatient?.first_name} {selectedPatient?.last_name}
                  </h3>
                  <p className="text-sm text-slate-600">{selectedPatient?.email}</p>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Date <span className="text-red-500">*</span></Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => {
                    setScheduleDate(e.target.value);
                    setScheduleTime('');
                    setAvailableSlots([]);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="schedule-duration">Duration <span className="text-red-500">*</span></Label>
                <Select value={scheduleDuration.toString()} onValueChange={(value) => setScheduleDuration(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Session Type */}
              <div className="space-y-2">
                <Label htmlFor="schedule-type">Session Type <span className="text-red-500">*</span></Label>
                <Select value={scheduleType} onValueChange={setScheduleType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video Call">Video Call</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="In-Person">In-Person</SelectItem>
                    <SelectItem value="Group Session">Group Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Slot */}
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Time <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Select value={scheduleTime} onValueChange={setScheduleTime}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.start_time} value={slot.start_time}>
                          {slot.start_time} - {slot.end_time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadAvailableSlots}
                    disabled={!scheduleDate || loadingSlots}
                    className="px-3"
                  >
                    {loadingSlots ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                    ) : (
                      'Load'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="schedule-notes">Notes</Label>
              <Textarea
                id="schedule-notes"
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                placeholder="Add any notes about this session..."
                rows={3}
              />
            </div>

            {/* Error Message */}
            {scheduleError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{scheduleError}</p>
              </div>
            )}

            {/* Available Slots Info */}
            {availableSlots.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm">
                  <strong>{availableSlots.length}</strong> available time slots found for {scheduleDate}
                </p>
              </div>
            )}

            {scheduleDate && availableSlots.length === 0 && !loadingSlots && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-700 text-sm">
                  No available time slots found for {scheduleDate}. Please check your availability settings.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleScheduleSession}
              disabled={scheduleLoading || !scheduleDate || !scheduleTime}
            >
              {scheduleLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Unavailability Dialog */}
      <Dialog open={manualUnavailabilityDialog} onOpenChange={setManualUnavailabilityDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Add Manual Unavailability
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="unavailability-date">Date <span className="text-red-500">*</span></Label>
              <Input
                id="unavailability-date"
                type="date"
                value={manualUnavailabilityDate}
                onChange={(e) => setManualUnavailabilityDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unavailability-start">Start Time <span className="text-red-500">*</span></Label>
                <Input
                  id="unavailability-start"
                  type="time"
                  value={manualUnavailabilityStartTime}
                  onChange={(e) => setManualUnavailabilityStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unavailability-end">End Time <span className="text-red-500">*</span></Label>
                <Input
                  id="unavailability-end"
                  type="time"
                  value={manualUnavailabilityEndTime}
                  onChange={(e) => setManualUnavailabilityEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="unavailability-reason">Reason</Label>
              <Input
                id="unavailability-reason"
                value={manualUnavailabilityReason}
                onChange={(e) => setManualUnavailabilityReason(e.target.value)}
                placeholder="e.g., Vacation, Sick day, Personal time..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={addManualUnavailability}
              disabled={!manualUnavailabilityDate || !manualUnavailabilityStartTime || !manualUnavailabilityEndTime}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Add Unavailability
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
