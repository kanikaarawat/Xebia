import { supabase } from '@/lib/supabaseClient';
import { format, getDay } from 'date-fns';

const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function generateSlots(start: string, end: string, interval = 30) {
  const slots = [];
  let [hour, minute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);

  while (hour < endHour || (hour === endHour && minute < endMinute)) {
    const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    minute += interval;
    if (minute >= 60) {
      hour += 1;
      minute -= 60;
    }
    const endTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    slots.push({ start_time: startTime, end_time: endTime });
  }

  return slots;
}

export async function getFreeSlots(therapistId: string, date: string) {
  const weekday = dayMap[getDay(new Date(date))];

  // 1. Get availability for the therapist on that weekday
  const { data: availability, error: availError } = await supabase
    .from('therapist_availability')
    .select('*')
    .eq('therapist_id', therapistId)
    .eq('day_of_week', weekday)
    .single();

  if (availError || !availability) return [];

  // 2. Get already booked appointments for that day
  const { data: appointments } = await supabase
    .from('appointments')
    .select('scheduled_at, duration')
    .eq('therapist_id', therapistId)
    .gte('scheduled_at', `${date}T00:00:00`)
    .lt('scheduled_at', `${date}T23:59:59`);

  const bookedTimes = new Set(
    appointments?.map(a => format(new Date(a.scheduled_at), 'HH:mm')) || []
  );

  // 3. Generate slots
  const allSlots = generateSlots(availability.start_time, availability.end_time);

  // 4. Filter out slots that are already booked
  const freeSlots = allSlots.filter(slot => !bookedTimes.has(slot.start_time));

  return freeSlots;
}
