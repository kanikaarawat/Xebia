'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import AppointmentActions from './AppointmentActions';

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
}

export default function AppointmentsList({ 
  showUpcoming = true, 
  showPast = true, 
  limit,
  title = "Your Appointments",
  description = "Manage your therapy sessions",
  showCard = true,
  className = "",
  onViewAll
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
        
        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select('*')
          .eq("patient_id", user.id)
          .order("scheduled_at", { ascending: true });

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
            therapistsData = therapistsResult?.map(t => ({
              id: t.id,
              first_name: t.profiles?.first_name || 'Unknown',
              last_name: t.profiles?.last_name || 'Therapist',
              specialization: t.specialization,
              avatar_url: t.profiles?.avatar_url
            })) || [];
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
  }, [user]);

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
    } else if (statusLower === 'upcoming' || statusLower === 'scheduled') {
      return <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">Upcoming</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5">{status}</Badge>;
    }
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
        return <Calendar className="w-4 h-4" />;
      case 'phone call':
        return <Clock className="w-4 h-4" />;
      case 'in-person':
        return <User className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  // Filter appointments based on props
  const filteredAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.scheduled_at);
    const now = new Date();
    
    console.log('🔍 Filtering appointment:', {
      id: apt.id,
      scheduled_at: apt.scheduled_at,
      appointmentDate: appointmentDate.toISOString(),
      now: now.toISOString(),
      isUpcoming: appointmentDate > now,
      isPast: appointmentDate < now,
      showUpcoming,
      showPast
    });
    
    if (showUpcoming && showPast) return true;
    if (showUpcoming) return appointmentDate > now;
    if (showPast) return appointmentDate < now;
    return false;
  });

  console.log('📊 Filtering results:', {
    totalAppointments: appointments.length,
    filteredAppointments: filteredAppointments.length,
    showUpcoming,
    showPast,
    limit
  });

  // Apply limit if specified
  const displayAppointments = limit ? filteredAppointments.slice(0, limit) : filteredAppointments;

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading appointments...</p>
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
            <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No appointments found</h3>
            <p className="text-slate-600 mb-6">
              {showUpcoming && !showPast 
                ? "You don't have any upcoming appointments."
                : showPast && !showUpcoming
                ? "You haven't completed any sessions yet."
                : "You haven't booked any appointments yet."
              }
            </p>
            <Button 
              onClick={() => router.push('/dashboard/book-session')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
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
        <div className="p-6 border-b border-slate-200">
          <h3 className="flex items-center gap-3 text-indigo-800 text-xl">
            <Calendar className="h-6 w-6 text-indigo-600" />
            {title}
          </h3>
          {description && <p className="text-slate-600 mt-1">{description}</p>}
        </div>
      )}
      <div className={`${showCard ? 'p-6' : ''} w-full overflow-hidden`}>
        <div className="space-y-4 max-h-96 overflow-y-auto overflow-x-hidden custom-scrollbar max-w-full">
          {displayAppointments.map((appointment) => {
            const { date, dateShort, time } = formatDateTime(appointment.scheduled_at);
            const isUpcoming = new Date(appointment.scheduled_at) > new Date();
            
            return (
              <div
                key={appointment.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl p-3 sm:p-4 transition-colors overflow-hidden ${
                  isUpcoming 
                    ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100' 
                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
                  <Avatar className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex-shrink-0">
                    <AvatarImage src={appointment.therapist?.avatar_url} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                      {appointment.therapist?.first_name?.[0]}{appointment.therapist?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-indigo-900 text-xs sm:text-sm lg:text-base truncate break-words">
                      Dr. {appointment.therapist?.first_name} {appointment.therapist?.last_name}
                    </h3>
                    <p className="text-slate-600 text-xs truncate break-words">{appointment.therapist?.specialization}</p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-xs text-slate-500 hidden sm:inline">{date}</span>
                      <span className="text-xs text-slate-500 sm:hidden">{dateShort}</span>
                      <span>{formatUTCDateTime(appointment.scheduled_at)}</span>
                      <span className="text-xs text-slate-500">{getDurationText(appointment.duration || 30)}</span>
                    </div>
                    {appointment.notes && (
                      <p className="text-xs text-slate-500 mt-1 max-w-full truncate">
                        "{appointment.notes}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 justify-start sm:justify-end">
                  <div className="flex items-center space-x-1">
                    {getSessionTypeIcon(appointment.type)}
                    <span className="text-xs text-slate-600 hidden sm:inline">{appointment.type || 'Session'}</span>
                  </div>
                  {getStatusBadge(appointment.status || 'upcoming')}
                  {isUpcoming && (appointment.status || 'upcoming') === 'upcoming' && (
                    <AppointmentActions 
                      appointment={{
                        id: appointment.id,
                        scheduled_at: appointment.scheduled_at,
                        status: appointment.status || 'upcoming',
                        type: appointment.type,
                        duration: appointment.duration || 30,
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
                  )}
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
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              View All Appointments
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