import { NextRequest, NextResponse } from "next/server";

// POST - Reschedule an appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointment_id, new_scheduled_at, new_duration, new_type, notes } = body;

    // Debug log: received payload
    console.log('Reschedule API received:', {
      appointment_id,
      new_scheduled_at,
      new_duration,
      new_type,
      notes,
    });

    // Validation
    if (!appointment_id || !new_scheduled_at) {
      return NextResponse.json(
        { error: "Missing required fields: appointment_id, new_scheduled_at" },
        { status: 400 }
      );
    }

    // Get the current appointment
    const { data: currentAppointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointment_id)
      .single();

    if (fetchError || !currentAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if appointment can be rescheduled
    if (currentAppointment.status === "completed" || currentAppointment.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot reschedule an appointment that is already completed or cancelled" },
        { status: 400 }
      );
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(currentAppointment.scheduled_at);
    const now = new Date();
    if (appointmentDate < now) {
      return NextResponse.json(
        { error: "Cannot reschedule an appointment that has already passed" },
        { status: 400 }
      );
    }

    // Check if the new time slot is available
    const newAppointmentDate = new Date(new_scheduled_at);
    const newEndTime = new Date(newAppointmentDate.getTime() + (new_duration || currentAppointment.duration) * 60000);

    // Debug log: computed times
    console.log('Reschedule API computed:', {
      newAppointmentDate: newAppointmentDate.toISOString(),
      newEndTime: newEndTime.toISOString(),
    });

    // Fetch all upcoming appointments for the therapist (excluding the current one)
    const { data: allAppointments, error: conflictError } = await supabase
      .from("appointments")
      .select("id, scheduled_at, duration")
      .eq("therapist_id", currentAppointment.therapist_id)
      .eq("status", "upcoming")
      .neq("id", appointment_id);

    // Debug log: all upcoming appointments
    console.log('Reschedule API all upcoming appointments:', {
      allAppointments,
      conflictError,
    });

    // Filter for true time overlaps
    const conflicts = (allAppointments || []).filter(appt => {
      const apptStart = new Date(appt.scheduled_at);
      const apptEnd = new Date(apptStart.getTime() + (appt.duration || 30) * 60000);
      // Overlap logic: startA < endB && endA > startB
      return apptStart < newEndTime && apptEnd > newAppointmentDate;
    });

    // Debug log: filtered conflicts
    console.log('Reschedule API filtered conflicts:', {
      conflicts,
    });

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { 
          error: "This time slot is not available. Please select a different time.",
          conflicts
        },
        { status: 409 }
      );
    }

    // Check therapist availability for the new time
    const newTime = newAppointmentDate.toTimeString().split(' ')[0];
    const dayOfWeek = newAppointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

    const { data: availability, error: availError } = await supabase
      .from("therapist_availability")
      .select("*")
      .eq("therapist_id", currentAppointment.therapist_id)
      .eq("day_of_week", dayOfWeek)
      .single();

    if (availError || !availability) {
      return NextResponse.json(
        { error: "Therapist is not available on this day" },
        { status: 400 }
      );
    }

    // Check if the new time falls within therapist's availability
    if (newTime < availability.start_time || newTime >= availability.end_time) {
      return NextResponse.json(
        { error: `Therapist is only available between ${availability.start_time} and ${availability.end_time} on ${dayOfWeek}` },
        { status: 400 }
      );
    }

    // Update the appointment
    const updateData: Record<string, unknown> = {
      scheduled_at: new_scheduled_at,
      updated_at: new Date().toISOString()
    };
    if (new_duration) updateData.duration = new_duration;
    if (new_type) updateData.type = new_type;
    if (notes) updateData.notes = notes;

    const { data: rescheduledAppointment, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointment_id)
      .select()
      .single();

    if (error) {
      console.error('Error rescheduling appointment:', error);
      return NextResponse.json(
        { error: error.message || "Failed to reschedule appointment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      appointment: rescheduledAppointment,
      message: "Appointment rescheduled successfully",
      old_time: currentAppointment.scheduled_at,
      new_time: new_scheduled_at
    });
  } catch (err: unknown) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reschedule appointment" },
      { status: 500 }
    );
  }
} 