'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';
import { getFreeSlotsFixed as getFreeSlots } from '@/lib/freeSlotsFixed';
import { debugTimeConversion } from '@/lib/timeTest';
import { Calendar, Clock, User, MessageSquare, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Therapist {
  id: string;
  name: string;
  specialization: string;
  license_number: string;
  avatar_url?: string;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
}

export default function BookSessionPage() {
  const user = useUser();
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<{ start_time: string; end_time: string; reason: string }[]>([]);

  const [therapistId, setTherapistId] = useState('');
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [type, setType] = useState('');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');

  const [loadingTherapists, setLoadingTherapists] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [therapistSearch, setTherapistSearch] = useState('');

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all therapists with their details
  useEffect(() => {
    if (!mounted) return;
    
    const fetchTherapists = async () => {
      console.log('🔍 Starting to fetch therapists...');
      
      const { data, error } = await supabase
  .from('therapists')
  .select(`
    id,
    specialization,
    license_number,
    profile:profiles (
      first_name,
      last_name,
      avatar_url
    )
  `);

      

      console.log('🔍 Raw therapist data:', data);

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('Error fetching therapists:', error);
        setError('Failed to load therapists');
      } else {
        console.log("Fetched therapists:", data);  // 🔍 See what Supabase returned
    
        const therapistsWithAvatars = data?.map(t => {
          const profile = Array.isArray(t.profile) ? t.profile[0] : t.profile;
          return {
            id: t.id,
            name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '',
            specialization: t.specialization,
            license_number: t.license_number,
            avatar_url: profile?.avatar_url || null
          };
        }) || [];
          
        console.log('🎯 Processed therapists:', therapistsWithAvatars);
        console.log('Therapists:', therapistsWithAvatars);

        setTherapists(therapistsWithAvatars);
      }
      setLoadingTherapists(false);
    };

    fetchTherapists();
  }, [mounted]);

  // Fetch free slots when therapist, date, or duration changes
  useEffect(() => {
    if (!mounted || !therapistId || !date) {
      setSlots([]);
      setSelectedSlot('');
      return;
    }

    setLoadingSlots(true);
    const fetchSlots = async () => {
      try {
        console.log('🕐 Fetching slots for therapist:', therapistId, 'date:', date, 'duration:', duration);
        const { available, unavailable } = await getFreeSlots(therapistId, date, 30, duration);
        console.log("✅ Available slots for", date, "with", duration, "min duration:", available);
        console.log("❌ Unavailable slots:", unavailable);
        
        // Debug: Check for any overlap between available and unavailable slots
        const availableTimes = available.map(slot => slot.start_time);
        const unavailableTimes = unavailable.map(slot => slot.start_time);
        const overlap = availableTimes.filter(time => unavailableTimes.includes(time));
        
        console.log("🔍 Debug - Slot overlap check:", {
          availableTimes,
          unavailableTimes,
          overlap,
          hasOverlap: overlap.length > 0
        });
        
        // Filter out any slots that appear in both arrays (this shouldn't happen but just in case)
        const filteredAvailable = available.filter(slot => !unavailableTimes.includes(slot.start_time));
        const filteredUnavailable = unavailable.filter(slot => !availableTimes.includes(slot.start_time));
        
        console.log("🔧 After filtering:", {
          filteredAvailable: filteredAvailable.map(s => s.start_time),
          filteredUnavailable: filteredUnavailable.map(s => s.start_time)
        });
        
        setSlots(filteredAvailable);
        setUnavailableSlots(filteredUnavailable);
      } catch (err) {
        console.error('❌ Error fetching slots:', err);
        setError('Failed to load available slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [mounted, therapistId, date, duration]);

  // Update selected therapist when therapistId changes
  useEffect(() => {
    if (therapistId) {
      const therapist = therapists.find(t => t.id === therapistId);
      setSelectedTherapist(therapist || null);
    } else {
      setSelectedTherapist(null);
    }
  }, [therapistId, therapists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBooking(true);

    try {
      if (!user) throw new Error('Please log in first');
      if (!therapistId || !date || !selectedSlot || !type) {
        throw new Error('Please fill every required field');
      }

      // Additional validation: Check if the slot is still available
      console.log('🔍 Double-checking slot availability before booking...');
      const { available: currentSlots } = await getFreeSlots(therapistId, date, 30, duration);
      const isSlotStillAvailable = currentSlots.some((slot: TimeSlot) => slot.start_time === selectedSlot);
      
      if (!isSlotStillAvailable) {
        throw new Error('This time slot is no longer available. Please select a different time.');
      }

      const appointmentData = {
        patient_id: user.id,
        therapist_id: therapistId,
        scheduled_at: `${date}T${selectedSlot}:00`,
        duration,
        type,
        notes,
        status: 'upcoming',
      };

      console.log('📅 Booking appointment:', appointmentData);
      console.log('⏰ This will block therapist time from', selectedSlot, 'to', getSessionEndTime(selectedSlot, duration));

      // Insert appointment
      const { data: appointment, error: apptErr } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();
      
      console.log('📊 Appointment creation result:', { appointment, error: apptErr });
      
      if (apptErr) {
        console.error('❌ Appointment creation error:', apptErr);
        throw new Error(`Appointment creation failed: ${apptErr.message || 'Unknown error'}`);
      }

      console.log('✅ Appointment created successfully:', appointment);
      console.log('🚫 Therapist is now blocked from', selectedSlot, 'to', getSessionEndTime(selectedSlot, duration));

      // Manual fallback: Create unavailability record if trigger didn't work
      console.log('🔧 Creating unavailability record manually...');
      
      // Try to create unavailability record with detailed error logging
      const unavailabilityData = {
        therapist_id: therapistId,
        appointment_id: appointment.id,
        start_time: `${date}T${selectedSlot}:00`,
        end_time: `${date}T${getSessionEndTime(selectedSlot, duration)}:00`,
        reason: `Booked session - ${type}`
      };
      
      console.log('📝 Attempting to insert unavailability data:', unavailabilityData);
      
      const { data: unavailData, error: unavailErr } = await supabase
        .from('therapist_unavailability')
        .insert(unavailabilityData)
        .select();

      if (unavailErr) {
        console.error('⚠️ Manual unavailability creation failed:', {
          message: unavailErr.message,
          details: unavailErr.details,
          hint: unavailErr.hint,
          code: unavailErr.code,
          error: unavailErr
        });
        
        // Try alternative schema if the first one fails
        console.log('🔄 Trying alternative schema...');
        const alternativeData = {
          therapist_id: therapistId,
          appointment_id: appointment.id,
          date: date,
          start_time: selectedSlot,
          end_time: getSessionEndTime(selectedSlot, duration),
          reason: `Booked session - ${type}`
        };
        
        console.log('📝 Attempting alternative unavailability data:', alternativeData);
        
        const { error: altUnavailErr } = await supabase
          .from('therapist_unavailability')
          .insert(alternativeData);
          
        if (altUnavailErr) {
          console.error('⚠️ Alternative unavailability creation also failed:', {
            message: altUnavailErr.message,
            details: altUnavailErr.details,
            hint: altUnavailErr.hint,
            code: altUnavailErr.code,
            error: altUnavailErr
          });
          
          // Try without appointment_id as it might not exist in the table
          console.log('🔄 Trying without appointment_id...');
          const simpleData = {
            therapist_id: therapistId,
            start_time: `${date}T${selectedSlot}:00`,
            end_time: `${date}T${getSessionEndTime(selectedSlot, duration)}:00`,
            reason: `Booked session - ${type}`
          };
          
          const { error: simpleUnavailErr } = await supabase
            .from('therapist_unavailability')
            .insert(simpleData);
            
          if (simpleUnavailErr) {
            console.error('⚠️ Simple unavailability creation also failed:', {
              message: simpleUnavailErr.message,
              details: simpleUnavailErr.details,
              hint: simpleUnavailErr.hint,
              code: simpleUnavailErr.code,
              error: simpleUnavailErr
            });
          } else {
            console.log('✅ Unavailability record created with simple schema');
          }
        } else {
          console.log('✅ Unavailability record created with alternative schema');
        }
      } else {
        console.log('✅ Unavailability record created manually:', unavailData);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('❌ Booking error:', err);
      setError(err.message ?? 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  // Get day of week for display
  const getDayOfWeek = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Calculate time duration between start and end times
  const getTimeDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    return `${diffMinutes} min`;
  };

  // Get session end time based on start time and duration
  const getSessionEndTime = (startTime: string, duration: number) => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    const hours = String(end.getHours()).padStart(2, '0');
    const minutes = String(end.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Book a Session</h1>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter therapists based on search term
  const filteredTherapists = therapists.filter(therapist =>
    therapist.name.toLowerCase().includes(therapistSearch.toLowerCase()) ||
    therapist.specialization.toLowerCase().includes(therapistSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-4 sm:p-6 relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="w-full text-center mt-8 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-pink-500 to-blue-500 bg-clip-text text-transparent tracking-tight" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
            Book a Session
          </h1>
        </header>
        {/* Show selected therapist only once, as a card below the header */}
        {selectedTherapist && (
          <div className="mx-auto mb-8 max-w-lg p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-xl border border-indigo-200 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                <AvatarImage src={selectedTherapist.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-indigo-400 text-white text-lg sm:text-xl">
                  {selectedTherapist.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-indigo-700">{selectedTherapist.name}</h2>
                <p className="text-base sm:text-lg text-indigo-600 font-medium">{selectedTherapist.specialization}</p>
                <p className="text-xs sm:text-sm text-slate-500">Licensed Professional</p>
              </div>
              <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                Available
              </Badge>
            </div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/70 backdrop-blur-xl shadow-2xl border-2 border-transparent bg-clip-padding relative z-20 rounded-3xl p-1"
            style={{ borderImage: 'linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%) 1' }}
          >
            <CardHeader className="pb-4 sm:pb-6 mt-4 sm:mt-6">
              <CardTitle className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-pink-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
                <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-pink-400 drop-shadow" />
                Schedule Your Session
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {success ? (
                <div className="py-12 text-center">
                  <div className="mb-4 text-6xl">🎉</div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">
                    Session Booked Successfully!
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Your appointment has been scheduled. You'll receive a confirmation email shortly.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-8 py-3"
                    onClick={() => router.push('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Therapist Selection */}
                  <div className="space-y-3 sm:space-y-4">
                    <Label className="text-base sm:text-lg font-semibold text-slate-700 flex items-center gap-2 mt-2 sm:mt-4">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      Select Your Therapist
                    </Label>
                    {/* Therapist Search Bar - enhanced UI */}
                    <div className="w-full flex justify-center mb-4">
                      <div className="relative w-full max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-4.65a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </span>
                        <Input
                          type="text"
                          placeholder="Search by name or specialization..."
                          value={therapistSearch}
                          onChange={e => setTherapistSearch(e.target.value)}
                          className="pl-12 pr-4 py-3 rounded-2xl border border-slate-200 shadow focus:ring-2 focus:ring-pink-200 focus:border-pink-300 bg-white/70 backdrop-blur placeholder:text-slate-400 text-base transition-all"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="flex gap-6 px-2 overflow-x-auto scrollbar-hide pb-2 -mx-2 p-8">
                      {filteredTherapists.length === 0 && !loadingTherapists && (
                        <div className="px-3 py-4 text-center text-slate-500">No therapists found</div>
                      )}
                      {filteredTherapists.map((therapist, idx) => {
                        const isSelected = therapistId === therapist.id;
                        return (
                          <motion.button
                            key={therapist.id}
                            type="button"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.07, type: 'spring', stiffness: 80 }}
                            onClick={() => setTherapistId(therapist.id)}
                            className={`relative min-w-[260px] max-w-sm flex-shrink-0 rounded-3xl p-7 flex flex-col items-center gap-4 cursor-pointer group
                              bg-white/60 backdrop-blur-xl border transition-all duration-200
                              shadow-xl hover:shadow-2xl hover:-translate-y-1
                              ${isSelected ? 'border-2 border-gradient-to-r from-indigo-400 via-pink-300 to-blue-300 ring-2 ring-indigo-200 scale-105' : 'border-slate-200'}
                              before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-indigo-100/40 before:to-pink-100/30 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-300
                              overflow-hidden
                              focus:outline-none focus:ring-2 focus:ring-indigo-300
                            `}
                            style={{ fontFamily: 'Inter, Poppins, sans-serif' }}
                          >
                            {/* Animated border for selected */}
                            {isSelected && (
                              <span className="absolute inset-0 rounded-3xl pointer-events-none border-2 border-transparent bg-gradient-to-r from-indigo-300 via-pink-200 to-blue-200 animate-borderGlow" />
                            )}
                            {/* Floating Available badge */}
                            <Badge variant="secondary" className="absolute top-4 right-4 text-xs px-2 py-1 shadow-lg bg-green-100 text-green-700 border-green-200 z-10 animate-bounce-slow">
                              Available
                            </Badge>
                            <div className={`relative mb-2 z-10 ${isSelected ? 'drop-shadow-xl' : ''}`}>
                              {therapist.avatar_url ? (
                                <Avatar className={`w-24 h-24 shadow-lg ${isSelected ? 'ring-4 ring-indigo-200/80' : 'ring-2 ring-indigo-100/60'} transition-all duration-200`}>
                                  <AvatarImage src={therapist.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-indigo-400 text-white text-3xl">
                                    {therapist.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-indigo-200 text-indigo-800 text-4xl font-bold shadow-lg ${isSelected ? 'ring-4 ring-indigo-200/80' : 'ring-2 ring-indigo-100/60'} transition-all duration-200`}>
                                  {therapist.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              )}
                            </div>
                            <div className="font-semibold text-indigo-900 text-xl truncate w-full text-center drop-shadow-sm z-10" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>{therapist.name}</div>
                            <div className="flex flex-wrap gap-2 justify-center mb-1 z-10">
                              <Badge className="bg-gradient-to-r from-blue-100 via-pink-100 to-indigo-100 text-blue-700 text-xs px-3 py-1 rounded-full shadow-sm border-0">
                                {therapist.specialization}
                              </Badge>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-3 sm:space-y-4">
                    <Label className="text-base sm:text-lg font-semibold text-slate-700 flex items-center gap-2 mt-6 sm:mt-8">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      Select Date
                    </Label>
                    
                    <div className="relative w-full max-w-xs">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 2v2m8-2v2m-9 4h10M5 10h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z"/></svg>
                      </span>
                      <Input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="pl-12 h-12 text-base sm:text-lg bg-white/70 border border-slate-200 rounded-2xl shadow focus:border-pink-300 focus:ring-2 focus:ring-pink-200 backdrop-blur placeholder:text-slate-400 transition-all"
                      />
                    </div>
                    {date && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-pink-50 to-blue-50 border border-pink-100 shadow flex items-center justify-between"
                      >
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-indigo-700" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </div>
                          <div className="text-sm sm:text-base text-indigo-500">
                            {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-indigo-200">
                          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 2v2m8-2v2m-9 4h10M5 10h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z"/></svg>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Session Duration */}
                  <div className="space-y-3 sm:space-y-4">
                    <Label className="text-base sm:text-lg font-semibold text-slate-700 flex items-center gap-2 mt-6 sm:mt-8">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Session Duration
                    </Label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-2 mb-4 text-sm sm:text-base">
                      {[
                        { value: 30, label: '30 min', description: 'Quick session' },
                        { value: 60, label: '1 hour', description: 'Standard session' },
                        { value: 90, label: '1.5 hours', description: 'Extended session' },
                        { value: 120, label: '2 hours', description: 'Comprehensive session' }
                      ].map((option) => {
                        const isSelected = duration === option.value;
                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDuration(option.value)}
                            className={`relative px-6 py-4 rounded-full border-2 transition-all duration-200 text-center group font-medium shadow-md
                              bg-gradient-to-br from-pink-50 via-indigo-50 to-blue-50
                              ${isSelected ? 'border-pink-400 shadow-pink-100 scale-105 ring-2 ring-pink-200 font-bold text-indigo-700' : 'border-slate-200 text-slate-700 hover:border-pink-300 hover:ring-1 hover:ring-pink-100'}
                            `}
                            style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
                          >
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <div className="space-y-1">
                              <div className={`text-sm sm:text-base ${isSelected ? 'font-bold' : 'font-medium'}`}>{option.label}</div>
                              <div className={`text-xs sm:text-sm ${isSelected ? 'text-pink-500' : 'text-slate-500'}`}>{option.description}</div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  <div className="space-y-3 sm:space-y-4">
                    <Label className="text-base sm:text-lg font-semibold text-slate-700 flex items-center gap-2 mt-6 sm:mt-8">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Select Start Time
                    </Label>
                    
                    {duration > 30 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-blue-700">
                          <strong>Note:</strong> You've selected a {duration}-minute session. 
                          The system will automatically block the required time slots to accommodate your session.
                        </p>
                      </div>
                    )}
                    
                    {loadingSlots ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    ) : (slots.length > 0 || unavailableSlots.length > 0) ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                          {/* Available Slots */}
                          {slots.map((slot, index) => {
                            const isSelected = selectedSlot === slot.start_time;
                            return (
                              <button
                                key={`available-${index}`}
                                type="button"
                                onClick={() => setSelectedSlot(slot.start_time)}
                                className={`
                                  relative p-4 rounded-lg border-2 transition-all duration-200 text-center group
                                  ${isSelected 
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md scale-105' 
                                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-25 hover:shadow-sm'
                                  }
                                `}
                              >
                                {isSelected && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <div className={`font-semibold text-lg ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                    {slot.start_time}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {getSessionEndTime(slot.start_time, duration)}
                                  </div>
                                  <div className={`text-xs font-medium ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {duration} min session
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                          
                          {/* Unavailable Slots */}
                          {unavailableSlots.map((slot, index) => (
                            <div
                              key={`unavailable-${index}`}
                              className="relative p-4 rounded-lg border-2 border-red-300 bg-red-50 text-center cursor-not-allowed"
                            >
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="space-y-1">
                                <div className="font-semibold text-lg text-red-700 line-through">
                                  {slot.start_time}
                                </div>
                                <div className="text-xs text-red-500">
                                  {slot.end_time}
                                </div>
                                <div className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                                  {slot.reason}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Summary */}
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-green-600 font-medium">
                            ✓ {slots.length} available time slot{slots.length !== 1 ? 's' : ''} found
                          </p>
                          {unavailableSlots.length > 0 && (
                            <p className="text-red-600 font-medium">
                              ✗ {unavailableSlots.length} unavailable slot{unavailableSlots.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : date ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-8 h-8 text-amber-600" />
                        </div>
                        <p className="text-amber-700 font-medium">
                          No available slots for {getDayOfWeek(date)}
                        </p>
                        <p className="text-slate-500 text-sm mt-1">
                          Try selecting a different date
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500">
                          Please select a date to see available time slots
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Session Type */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-slate-700">Session Type</Label>
                    <Select value={type} onValueChange={setType} required>
                      <SelectTrigger className="h-12 text-lg bg-white border-slate-200 hover:bg-slate-50">
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                        <SelectItem value="Video Call" className="hover:bg-slate-100">Video Call</SelectItem>
                        <SelectItem value="Phone Call" className="hover:bg-slate-100">Phone Call</SelectItem>
                        <SelectItem value="In-Person" className="hover:bg-slate-100">In-Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything you'd like your therapist to know before the session?"
                      className="min-h-[100px] text-lg"
                    />
                  </div>

                  {/* Debug Info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-700 mb-2">Debug Info</h4>
                      <div className="text-xs text-yellow-600 space-y-1">
                        <p>Loading therapists: {loadingTherapists ? 'Yes' : 'No'}</p>
                        <p>Therapists count: {therapists.length}</p>
                        <p>Selected therapist ID: {therapistId || 'None'}</p>
                        <p>Selected therapist: {selectedTherapist ? JSON.stringify(selectedTherapist) : 'None'}</p>
                        {therapists.length > 0 && (
                          <div>
                            <p>Available therapists:</p>
                            <ul className="ml-4">
                              {therapists.map((t, i) => (
                                <li key={i}>- {t.name} ({t.specialization}) - ID: {t.id}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={() => debugTimeConversion()}
                        className="mt-2 text-xs"
                        variant="outline"
                      >
                        Test Time Conversion
                      </Button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-6 text-lg font-semibold hover:from-indigo-600 hover:to-pink-600"
                    disabled={booking || !therapistId || !date || !selectedSlot || !type}
                  >
                    {booking ? 'Booking Your Session...' : 'Book Session'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}