// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from Functions!")

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const now = new Date()
  const nowISO = now.toISOString()

  // 1. 1-day reminders (run at midnight)
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(tomorrow.getDate() + 1)

  // Appointments for tomorrow
  const { data: tomorrowAppointments } = await supabase
    .from('appointments')
    .select('*')
    .gte('scheduled_at', tomorrow.toISOString())
    .lt('scheduled_at', dayAfter.toISOString())
    .in('status', ['upcoming', 'scheduled'])

  // Patients: 1-day reminders
  if (tomorrowAppointments) {
    // Fetch patient names for tomorrow's appointments
    const patientIds = [...new Set(tomorrowAppointments.map(a => a.patient_id))]
    let patientNameMap: Record<string, string> = {}
    if (patientIds.length > 0) {
      const { data: patientProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', patientIds)
      if (patientProfiles) {
        for (const p of patientProfiles) {
          patientNameMap[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown'
        }
      }
    }
    for (const apt of tomorrowAppointments) {
      await supabase.from('notifications').insert([
        {
          user_id: apt.patient_id,
          type: 'reminder_1day',
          title: 'Appointment Reminder',
          message: `You have an appointment tomorrow at ${new Date(apt.scheduled_at).toLocaleTimeString()}.`,
          meta: { appointment_id: apt.id, scheduled_at: apt.scheduled_at }
        }
      ])
    }
    // Therapists: daily summary
    const therapistMap: Record<string, any[]> = {}
    for (const apt of tomorrowAppointments) {
      if (!therapistMap[apt.therapist_id]) therapistMap[apt.therapist_id] = []
      therapistMap[apt.therapist_id].push(apt)
    }
    for (const [therapist_id, apts] of Object.entries(therapistMap)) {
      const summary = apts.map(a => {
        const name = patientNameMap[a.patient_id] || a.patient_id
        return `• ${new Date(a.scheduled_at).toLocaleTimeString()} with patient ${name}`
      }).join('\n')
      await supabase.from('notifications').insert([
        {
          user_id: therapist_id,
          type: 'reminder_1day_summary',
          title: 'Tomorrow\'s Appointments',
          message: `You have the following appointments tomorrow:\n${summary}`,
          meta: { date: tomorrow.toISOString() }
        }
      ])
    }
  }

  // 2. 1-hour reminders (run every hour)
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
  const { data: hourAppointments } = await supabase
    .from('appointments')
    .select('*')
    .gte('scheduled_at', nowISO)
    .lt('scheduled_at', oneHourFromNow.toISOString())
    .in('status', ['upcoming', 'scheduled'])
  if (hourAppointments) {
    // Fetch patient names for hour appointments
    const patientIds = [...new Set(hourAppointments.map(a => a.patient_id))]
    let patientNameMap: Record<string, string> = {}
    if (patientIds.length > 0) {
      const { data: patientProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', patientIds)
      if (patientProfiles) {
        for (const p of patientProfiles) {
          patientNameMap[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown'
        }
      }
    }
    for (const apt of hourAppointments) {
      const patientName = patientNameMap[apt.patient_id] || apt.patient_id
      await supabase.from('notifications').insert([
        {
          user_id: apt.patient_id,
          type: 'reminder_1hr',
          title: 'Appointment Reminder',
          message: `You have an appointment in 1 hour at ${new Date(apt.scheduled_at).toLocaleTimeString()}.`,
          meta: { appointment_id: apt.id, scheduled_at: apt.scheduled_at }
        },
        {
          user_id: apt.therapist_id,
          type: 'reminder_1hr',
          title: 'Appointment Reminder',
          message: `You have an appointment in 1 hour at ${new Date(apt.scheduled_at).toLocaleTimeString()} with patient ${patientName}.`,
          meta: { appointment_id: apt.id, scheduled_at: apt.scheduled_at }
        }
      ])
    }
  }

  // 3. 10-min reminders (run every 10 min)
  const tenMinFromNow = new Date(now.getTime() + 10 * 60 * 1000)
  const { data: tenMinAppointments } = await supabase
    .from('appointments')
    .select('*')
    .gte('scheduled_at', nowISO)
    .lt('scheduled_at', tenMinFromNow.toISOString())
    .in('status', ['upcoming', 'scheduled'])
  if (tenMinAppointments) {
    // Fetch patient names for 10-min appointments
    const patientIds = [...new Set(tenMinAppointments.map(a => a.patient_id))]
    let patientNameMap: Record<string, string> = {}
    if (patientIds.length > 0) {
      const { data: patientProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', patientIds)
      if (patientProfiles) {
        for (const p of patientProfiles) {
          patientNameMap[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown'
        }
      }
    }
    for (const apt of tenMinAppointments) {
      const patientName = patientNameMap[apt.patient_id] || apt.patient_id
      await supabase.from('notifications').insert([
        {
          user_id: apt.therapist_id,
          type: 'reminder_10min',
          title: 'Appointment Reminder',
          message: `You have an appointment in 10 minutes at ${new Date(apt.scheduled_at).toLocaleTimeString()} with patient ${patientName}.`,
          meta: { appointment_id: apt.id, scheduled_at: apt.scheduled_at }
        }
      ])
    }
  }

  // 4. End-of-day therapist summary (run at 11:59pm)
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select('*')
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())
    .in('status', ['completed', 'cancelled', 'rejected'])
  if (todayAppointments) {
    // Fetch patient names for today's appointments
    const patientIds = [...new Set(todayAppointments.map(a => a.patient_id))]
    let patientNameMap: Record<string, string> = {}
    if (patientIds.length > 0) {
      const { data: patientProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', patientIds)
      if (patientProfiles) {
        for (const p of patientProfiles) {
          patientNameMap[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown'
        }
      }
    }
    const therapistMap: Record<string, any[]> = {}
    for (const apt of todayAppointments) {
      if (!therapistMap[apt.therapist_id]) therapistMap[apt.therapist_id] = []
      therapistMap[apt.therapist_id].push(apt)
    }
    for (const [therapist_id, apts] of Object.entries(therapistMap)) {
      const summary = apts.map(a => {
        const name = patientNameMap[a.patient_id] || a.patient_id
        return `• ${a.status.toUpperCase()} at ${new Date(a.scheduled_at).toLocaleTimeString()} with patient ${name}`
      }).join('\n')
      await supabase.from('notifications').insert([
        {
          user_id: therapist_id,
          type: 'daily_summary',
          title: 'Today\'s Appointment Summary',
          message: `Summary of your completed, cancelled, and rejected appointments today:\n${summary}`,
          meta: { date: startOfDay.toISOString() }
        }
      ])
    }
  }

  return new Response('Reminders and summaries processed', { status: 200 })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/appointment-reminders' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
