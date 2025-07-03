// lib/freeSlotsFixed.ts - Fixed version with proper timezone handling
import { supabase } from "@/lib/supabaseClient";
import { generateTimeSlots } from "@/utils/slotgenerator";

export async function getFreeSlotsFixed(therapist_id: string, date: string, interval = 30, sessionDuration = 30) {
  console.log('🔍 getFreeSlotsFixed called with:', { therapist_id, date, interval, sessionDuration });
  
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" }); // e.g., 'Monday'
  console.log('📅 Day of week:', dayOfWeek);

  // 1. Fetch availability for that day
  console.log('🔍 Fetching availability for therapist:', therapist_id, 'day:', dayOfWeek);
  const { data: availability, error: availabilityError } = await supabase
    .from("therapist_availability")
    .select("*")
    .eq("therapist_id", therapist_id)
    .eq("day_of_week", dayOfWeek)
    .single();

  console.log('📊 Availability result:', { availability, error: availabilityError });

  if (availabilityError) {
    console.error('❌ Availability error:', availabilityError);
    return { available: [], unavailable: [] };
  }

  if (!availability) {
    console.log('⚠️ No availability found for this day');
    return { available: [], unavailable: [] };
  }

  console.log('✅ Found availability:', availability);

  // 2. Generate full slots
  const possibleSlots = generateTimeSlots(availability.start_time, availability.end_time, sessionDuration);
  console.log('⏰ Generated slots:', possibleSlots);

  // 3. Fetch unavailability for that date from therapist_unavailability table
  console.log('📅 Fetching unavailability for date:', date);
  
  // Create date range for the entire day - FIXED: Use proper timezone handling
  // Create the date in the user's local timezone and convert to UTC properly
  const localDate = new Date(date + 'T00:00:00');
  const utcStartOfDay = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
  const utcEndOfDay = new Date(utcStartOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
  
  console.log('📅 Date range (local):', { 
    startOfDay: utcStartOfDay.toISOString(), 
    endOfDay: utcEndOfDay.toISOString(),
    localStart: utcStartOfDay.toLocaleString(),
    localEnd: utcEndOfDay.toLocaleString()
  });
  
  // Debug: Let's also check what unavailability data exists for this therapist
  const { data: allUnavailability, error: allUnavailError } = await supabase
    .from("therapist_unavailability")
    .select("start_time, end_time, reason, appointment_id, therapist_id")
    .eq("therapist_id", therapist_id);
  
  console.log('🔍 All unavailability for this therapist:', {
    therapist_id: therapist_id,
    allUnavailability,
    error: allUnavailError,
    count: allUnavailability?.length || 0
  });
  
  const { data: unavailability, error: unavailabilityError } = await supabase
    .from("therapist_unavailability")
    .select("start_time, end_time, reason, appointment_id")
    .eq("therapist_id", therapist_id)
    .gte("start_time", utcStartOfDay.toISOString())
    .lt("start_time", utcEndOfDay.toISOString());

  console.log('📊 Unavailability query result:', { 
    unavailability, 
    error: unavailabilityError,
    count: unavailability?.length || 0 
  });

  if (unavailabilityError) {
    console.error('❌ Error fetching unavailability:', unavailabilityError);
    // Continue with empty unavailability rather than failing completely
  }

  const bookedSlots = new Set();
  const unavailableSlots: { start_time: string; end_time: string; reason: string }[] = [];

  // Convert to date strings for comparison and account for unavailability duration
  const processedSlots = new Set(); // Track processed slots to avoid duplicates
  
  unavailability?.forEach((unavail, index) => {
    console.log(`🚫 Processing unavailability ${index + 1}:`, unavail);
    
    // FIXED: Handle timezone-aware timestamps properly
    let startTime, endTime;
    
    try {
      // Parse the timestamp - FIXED: Use local timezone conversion
      const startDate = new Date(unavail.start_time);
      const endDate = new Date(unavail.end_time);
      
      console.log('🕐 Raw timestamps:', {
        start_time: unavail.start_time,
        end_time: unavail.end_time,
        startDateLocal: startDate.toLocaleString(),
        endDateLocal: endDate.toLocaleString()
      });
      
      // FIXED: Extract time in UTC to get the original intended time
      startTime = startDate.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC' // Use UTC to get the original time
      });
      endTime = endDate.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC' // Use UTC to get the original time
      });
      
      console.log('🕐 Extracted times (local):', { startTime, endTime });
      
    } catch (error) {
      console.error('❌ Error parsing timestamps:', error);
      console.error('❌ Problematic data:', unavail);
      return;
    }
    
    console.log('🚫 Processing unavailability:', startTime, 'to', endTime, 'reason:', unavail.reason);
    
    // Validate that we have valid times
    if (!startTime || !endTime || startTime === 'Invalid Date' || endTime === 'Invalid Date') {
      console.warn('⚠️ Invalid time format in unavailability:', unavail);
      return;
    }
    
    // FIXED: Add all time slots that are blocked by this unavailability
    let current = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    if (isNaN(current.getTime()) || isNaN(end.getTime())) {
      console.warn('⚠️ Invalid date conversion for unavailability:', { startTime, endTime });
      return;
    }
    
    while (current < end) {
      const hour = String(current.getHours()).padStart(2, "0");
      const min = String(current.getMinutes()).padStart(2, "0");
      const slotKey = `${hour}:${min}`;
      bookedSlots.add(slotKey);
      
      // Add to unavailable slots if it's a 30-minute slot and not already processed
      if (current.getMinutes() % 30 === 0) {
        const slotEnd = new Date(current.getTime() + 30 * 60 * 1000);
        const endHour = String(slotEnd.getHours()).padStart(2, "0");
        const endMin = String(slotEnd.getMinutes()).padStart(2, "0");
        const slotId = `${slotKey}-${endHour}:${endMin}`;
        
        if (!processedSlots.has(slotId)) {
          processedSlots.add(slotId);
          unavailableSlots.push({
            start_time: slotKey,
            end_time: `${endHour}:${endMin}`,
            reason: unavail.reason || 'Booked'
          });
        }
      }
      
      current.setMinutes(current.getMinutes() + interval);
    }
    console.log('🚫 Unavailable slots for:', startTime, 'to', endTime, 'reason:', unavail.reason);
  });

  // 4. Filter out slots that don't have enough consecutive free time
  const availableSlots = possibleSlots.filter((slot) => {
    // Check if the starting slot is available
    if (bookedSlots.has(slot.start_time)) {
      return false;
    }

    // Check if we have enough consecutive free time for the session duration
    const startTime = new Date(`2000-01-01T${slot.start_time}:00`);
    const endTime = new Date(startTime.getTime() + sessionDuration * 60 * 1000);
    
    let current = new Date(startTime);
    while (current < endTime) {
      const hour = String(current.getHours()).padStart(2, "0");
      const min = String(current.getMinutes()).padStart(2, "0");
      const slotKey = `${hour}:${min}`;
      
      if (bookedSlots.has(slotKey)) {
        return false;
      }
      
      current.setMinutes(current.getMinutes() + interval);
    }
    
    return true;
  });

  // Add slots that don't have enough consecutive time to unavailable
  possibleSlots.forEach((slot) => {
    if (!availableSlots.some(available => available.start_time === slot.start_time)) {
      const isBooked = bookedSlots.has(slot.start_time);
      if (!isBooked) {
        const slotId = `${slot.start_time}-${slot.end_time}-insufficient`;
        if (!processedSlots.has(slotId)) {
          processedSlots.add(slotId);
          unavailableSlots.push({
            start_time: slot.start_time,
            end_time: slot.end_time,
            reason: 'Insufficient time'
          });
        }
      }
    }
  });

  console.log('✅ Final available slots for', sessionDuration, 'min session:', availableSlots);
  console.log('❌ Unavailable slots:', unavailableSlots);
  
  return { available: availableSlots, unavailable: unavailableSlots };
}

// Helper function to test time conversion
export function testTimeConversion() {
  console.log('🧪 Testing time conversion...');
  
  // Test with your unavailability data
  const testCases = [
    '2025-07-09T15:30:00.000Z', // 3:30 PM UTC
    '2025-07-09T16:00:00.000Z', // 4:00 PM UTC
    '2025-07-02T14:30:00.000Z', // 2:30 PM UTC
    '2025-07-02T15:00:00.000Z', // 3:00 PM UTC
    '2025-01-15T15:30:00.000Z', // 3:30 PM UTC
    '2025-01-15T16:30:00.000Z', // 4:30 PM UTC
  ];
  
  testCases.forEach((timestamp, index) => {
    const date = new Date(timestamp);
    const localTime = date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit'
    });
    const utcTime = date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'UTC'
    });
    
    console.log(`Test ${index + 1}:`, {
      original: timestamp,
      local: localTime,
      utc: utcTime,
      difference: `Local: ${localTime}, UTC: ${utcTime}`
    });
  });
} 