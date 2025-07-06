'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, Video, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import AppointmentActions from './AppointmentActions';
import { isToday, isThisWeek, isThisMonth, addDays } from 'date-fns';

interface Appointment {
  id: string;
  therapist_id: string;
  scheduled_at: string;
  duration: number;
  type: string;
  notes: string;
  status: string;
  therapist?: {
    first_name: string;
    last_name: string;
    specialization: string;
    avatar_url?: string;
  };
}

interface AppointmentsListProps {
  showUpcoming?: boolean;
  showPast?: boolean;
  limit?: number;
  title?: string;
  description?: string;
  showCard?: boolean;
  className?: string;
  onViewAll?: () => void;
  statusFilter?: string[];
  dateFilter?: string;
  bookButton?: boolean;
}

export default function AppointmentsList({ 
  showUpcoming = true, 
  showPast = true, 
  limit,
  title = "Your Appointments",
  description = "Manage your therapy sessions",
  showCard = true,
  className = "",
  onViewAll,
  statusFilter,
  dateFilter = 'all',
  bookButton = false,
}: AppointmentsListProps) {
      const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching appointments for user:', user.id);
        
        let query = supabase
          .from("appointments")
          .select('*')
          .eq("patient_id", user.id)
          .order("scheduled_at", { ascending: true });
        
        // Apply status filter
        if (Array.isArray(statusFilter) && statusFilter.length > 0) {
          query = query.in("status", statusFilter);
        }
        
        // Apply date filter at database level for better performance
        if (dateFilter === 'today') {
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          query = query.gte('scheduled_at', startOfDay.toISOString())
                      .lt('scheduled_at', endOfDay.toISOString());
        } else if (dateFilter === 'week') {
          const now = new Date();
          const weekFromNow = new Date();
          weekFromNow.setDate(now.getDate() + 7);
          query = query.gte('scheduled_at', now.toISOString())
                      .lte('scheduled_at', weekFromNow.toISOString());
        } else if (dateFilter === 'month') {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          query = query.gte('scheduled_at', startOfMonth.toISOString())
                      .lte('scheduled_at', endOfMonth.toISOString());
        } else if (dateFilter === 'past') {
          const now = new Date();
          query = query.lt('scheduled_at', now.toISOString());
        }
        const { data: appointmentsData, error: appointmentsError } = await query;

        if (appointmentsError) {
          console.error('❌ Error fetching appointments:', appointmentsError);
          setError(`Failed to fetch appointments: ${appointmentsError.message}`);
          setAppointments([]);
          return;
        }

        console.log('✅ Appointments loaded:', appointmentsData);
        console.log('📊 Appointments count:', appointmentsData?.length || 0);
        console.log('👤 Current user ID:', user.id);
        
        // Log each appointment for debugging
        appointmentsData?.forEach((apt, index) => {
          console.log(`📅 Appointment ${index + 1}:`, {
            id: apt.id,
            patient_id: apt.patient_id,
            therapist_id: apt.therapist_id,
            scheduled_at: apt.scheduled_at,
            status: apt.status,
            type: apt.type
          });
        });

        // Fetch therapist data
        let therapistsData = null;
        try {
          const { data: therapistsResult, error: therapistsError } = await supabase
            .from("therapists")
            .select(`
              id,
              specialization,
              profiles (
                first_name,
                last_name,
                avatar_url
              )
            `);

          if (therapistsError) {
            console.log('❌ Error fetching therapists:', therapistsError);
            // Continue without therapist data
          } else {
            therapistsData = therapistsResult?.map(t => {
              const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
              return {
                id: t.id,
                first_name: profile?.first_name || 'Unknown',
                last_name: profile?.last_name || 'Therapist',
                specialization: t.specialization,
                avatar_url: profile?.avatar_url
              };
            }) || [];
            console.log('✅ Therapists loaded:', therapistsData);
          }
        } catch (therapistsErr) {
          console.warn('⚠️ Could not fetch therapist data:', therapistsErr);
        }

        // Combine appointments with therapist data
        const appointmentsWithTherapists = appointmentsData?.map(apt => ({
          ...apt,
          therapist: therapistsData?.find(t => t.id === apt.therapist_id) || {
            first_name: 'Unknown',
            last_name: 'Therapist',
            specialization: 'General Therapy'
          }
        })) || [];

        console.log('✅ Combined appointments with therapists:', appointmentsWithTherapists);
        setAppointments(appointmentsWithTherapists);
        
      } catch (err: any) {
        console.error('❌ Unexpected error fetching appointments:', err);
        setError(`Failed to fetch appointments: ${err.message || 'Unknown error'}`);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, statusFilter, dateFilter]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'upcoming':
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5">Unknown</Badge>;
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') {
      return <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5">Completed</Badge>;
    } else if (statusLower === 'cancelled') {
      return <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">Cancelled</Badge>;
    } else if (statusLower === 'rejected') {
      return <Badge className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5">Rejected</Badge>;
    } else if (statusLower === 'expired') {
      return <Badge className="bg-slate-300 text-slate-700 text-xs px-2 py-0.5">Expired</Badge>;
    } else if (statusLower === 'upcoming') {
      return <Badge className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5">Upcoming</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5">{status}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      dateShort: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getDurationText = (duration: number) => {
    if (duration === 30) return '30 min';
    if (duration === 60) return '1 hour';
    if (duration === 90) return '1.5 hours';
    if (duration === 120) return '2 hours';
    return `${duration} min`;
  };

  const getSessionTypeIcon = (type: string) => {
    if (!type) return <Calendar className="w-4 h-4" />; // Default icon for null/undefined types
    
    switch (type.toLowerCase()) {
      case 'video call':
        return <Video className="w-4 h-4" />;
      case 'phone call':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <User className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  // Filter appointments based on showUpcoming/showPast props
  const filteredAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.scheduled_at);
    const now = new Date();
    
    // Status and date filtering is already handled in the database query
    // Only apply showUpcoming/showPast filtering here
    if (showUpcoming && showPast) return true;
    if (showUpcoming) return appointmentDate > now;
    if (showPast) return appointmentDate < now;
    return false;
  });

  // Sort appointments: for upcoming, show earliest first; for past, show most recent first
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.scheduled_at);
    const dateB = new Date(b.scheduled_at);
    
    if (showUpcoming && !showPast) {
      // For upcoming appointments, sort by earliest first (ascending)
      return dateA.getTime() - dateB.getTime();
    } else if (showPast && !showUpcoming) {
      // For past appointments, sort by most recent first (descending)
      return dateB.getTime() - dateA.getTime();
    } else {
      // For mixed view, upcoming first, then past (upcoming in ascending, past in descending)
      const now = new Date();
      const isAUpcoming = dateA > now;
      const isBUpcoming = dateB > now;
      
      if (isAUpcoming && !isBUpcoming) return -1;
      if (!isAUpcoming && isBUpcoming) return 1;
      
      if (isAUpcoming && isBUpcoming) {
        return dateA.getTime() - dateB.getTime(); // Both upcoming, earliest first
      } else {
        return dateB.getTime() - dateA.getTime(); // Both past, most recent first
      }
    }
  });

  console.log('📊 Filtering results:', {
    totalAppointments: appointments.length,
    filteredAppointments: filteredAppointments.length,
    sortedAppointments: sortedAppointments.length,
    showUpcoming,
    showPast,
    limit
  });

  // Apply limit if specified
  const displayAppointments = limit ? sortedAppointments.slice(0, limit) : sortedAppointments;

  function formatTimeFromUTC(dateString: string) {
    // This will convert the UTC timestamp to the user's local time
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function formatDateTimeFromUTC(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function formatUTCDateTime(dateString: string) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        timeZone: 'UTC'
      }) +
      ', ' +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      })
    );
  }

  if (loading) {
    return (
      <div className={`${showCard ? 'border-indigo-100 bg-white/80 shadow-md rounded-lg' : ''} ${className}`}>
        <div className="p-8">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Calendar className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Loading your appointments</h3>
            <p className="text-slate-600">Please wait while we fetch your therapy sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${showCard ? 'border-red-100 bg-red-50/50 shadow-md rounded-lg' : ''} ${className}`}>
        <div className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Appointments</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (displayAppointments.length === 0) {
    return (
      <div className={`${showCard ? 'border-indigo-100 bg-white/80 shadow-md rounded-lg' : ''} ${className}`}>
        {showCard && (
          <div className="p-6 border-b border-slate-200">
            <h3 className="flex items-center gap-3 text-indigo-800 text-xl">
              <Calendar className="h-6 w-6 text-indigo-600" />
              {title}
            </h3>
            {description && <p className="text-slate-600 mt-1">{description}</p>}
          </div>
        )}
        <div className="p-8">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-10 w-10 text-indigo-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">0</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">No appointments found</h3>
            <p className="text-slate-600 mb-6 max-w-sm mx-auto">
              {showUpcoming && !showPast 
                ? "You don't have any upcoming appointments scheduled. Ready to start your therapy journey?"
                : showPast && !showUpcoming
                ? "You haven't completed any sessions yet. Your therapy progress will appear here."
                : "You haven't booked any appointments yet. Take the first step towards better mental health."
              }
            </p>
            <Button 
              onClick={() => router.push('/dashboard/book-session')}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Your First Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <>
      {showCard && (
        <div className="p-6 border-b border-slate-200 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="flex items-center gap-3 text-indigo-800 text-lg sm:text-xl">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 flex-shrink-0" />
                <span className="truncate">{title}</span>
              </h3>
              {description && <p className="text-slate-600 mt-1 text-sm sm:text-base truncate">{description}</p>}
            </div>
            {bookButton && (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 sm:px-6 py-2 rounded-lg shadow text-xs sm:text-base whitespace-nowrap flex-shrink-0"
                onClick={() => router.push('/dashboard/book-session')}
              >
                Book a Session
              </Button>
            )}
          </div>
        </div>
      )}
      <div className={`${showCard ? 'p-6' : ''} w-full overflow-hidden max-w-full`}>
        <div className="space-y-4 max-h-96 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {displayAppointments.map((appointment) => {
            const { date, dateShort, time } = formatDateTime(appointment.scheduled_at);
            const isUpcoming = new Date(appointment.scheduled_at) > new Date();
            
            return (
                              <div
                  key={appointment.id}
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
                        <AvatarImage src={appointment.therapist?.avatar_url} />
                        <AvatarFallback className={`text-sm font-semibold ${
                          isUpcoming ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {appointment.therapist?.first_name?.[0]}{appointment.therapist?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        isUpcoming ? 'bg-green-500' : 'bg-slate-400'
                      }`}></div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      {/* Therapist name with enhanced styling */}
                      <h3 className="font-bold text-indigo-900 text-sm sm:text-base truncate break-words mb-1">
                        Dr. {appointment.therapist?.first_name} {appointment.therapist?.last_name}
                      </h3>
                      
                      {/* Specialization with icon */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        <p className="text-slate-600 text-xs sm:text-sm font-medium truncate break-words">
                          {appointment.therapist?.specialization}
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
                          <span>{formatUTCDateTime(appointment.scheduled_at)}</span>
                          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                          <span>{getDurationText(appointment.duration || 30)}</span>
                        </div>
                      </div>
                      
                      {/* Notes with enhanced styling */}
                      {appointment.notes && (
                        <div className="mt-2 p-2 bg-white/60 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-600 italic max-w-full truncate">
                            &quot;{appointment.notes}&quot;
                          </p>
                          {/* Show rejection reason if present in notes */}
                          {appointment.status === 'rejected' && appointment.notes && appointment.notes.includes('Rejection reason:') && (
                            <p className="text-red-600 text-sm font-semibold">
                              {appointment.notes.split('Rejection reason:')[1].trim()}
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
                        {getSessionTypeIcon(appointment.type)}
                        <span className="text-xs text-slate-600 font-medium">
                          {appointment.type || 'Session'}
                        </span>
                      </div>
                      {/* Enhanced status badge */}
                      {getStatusBadge(appointment.status || 'upcoming')}
                      {/* Join Video Call button (inline) */}
                      {isUpcoming && (appointment.status || 'upcoming') === 'upcoming' && appointment.type?.toLowerCase() === 'video call' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="ml-2 bg-green-600 text-white hover:bg-green-700 px-3 py-1 h-8 text-xs"
                          onClick={() => window.location.href = `/video/${appointment.id}`}
                        >
                          Join Video Call
                        </Button>
                      )}
                    </div>
                    {/* Second row: reschedule/cancel actions */}
                    {isUpcoming && (appointment.status || 'upcoming') === 'upcoming' && (
                      <div className="flex flex-row flex-wrap gap-2 mt-1">
                        <AppointmentActions 
                          appointment={{
                            id: appointment.id,
                            scheduled_at: appointment.scheduled_at,
                            status: appointment.status || 'upcoming',
                            type: appointment.type,
                            duration: appointment.duration || 30,
                            therapist_id: appointment.therapist_id,
                            therapist: {
                              profiles: {
                                first_name: appointment.therapist?.first_name || 'Unknown',
                                last_name: appointment.therapist?.last_name || 'Therapist'
                              }
                            }
                          }}
                          onActionComplete={() => {
                            // Refresh appointments after action
                            window.location.reload();
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {limit && filteredAppointments.length > limit && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline"
              onClick={onViewAll || (() => router.push('/dashboard/appointments'))}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 px-6 py-2 font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              View All Appointments
              <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                {filteredAppointments.length}
              </span>
            </Button>
          </div>
        )}
      </div>
    </>
  );

  if (showCard) {
    return (
      <Card className={`border-indigo-100 bg-white/80 shadow-md ${className}`}>
        {content}
      </Card>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
} 