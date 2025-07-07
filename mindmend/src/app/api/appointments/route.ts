import { NextRequest, NextResponse } from "next/server";

// GET - List appointments for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const status = req.nextUrl.searchParams.get("status");
  const limit = req.nextUrl.searchParams.get("limit");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    let query = supabase
      .from("appointments")
      .select(`
        *,
        therapist:therapists(
          id,
          specialization,
          profiles(
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .eq("patient_id", userId)
      .order("scheduled_at", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch appointments" },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointments });
  } catch (err: unknown) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST - Create a new appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patient_id, therapist_id, scheduled_at, duration, type, notes } = body;

    // Validation
    if (!patient_id || !therapist_id || !scheduled_at || !type) {
      return NextResponse.json(
        { error: "Missing required fields: patient_id, therapist_id, scheduled_at, type" },
        { status: 400 }
      );
    }

    // Check if the time slot is available
    const appointmentDate = new Date(scheduled_at);
    const endTime = new Date(appointmentDate.getTime() + (duration || 30) * 60000);

    const { data: conflictingAppointments, error: conflictError } = await supabase
      .from("appointments")
      .select("id")
      .eq("therapist_id", therapist_id)
      .eq("status", "upcoming")
      .or(`scheduled_at.lt.${endTime.toISOString()},scheduled_at.gte.${appointmentDate.toISOString()}`);

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError);
      return NextResponse.json(
        { error: "Failed to check appointment availability" },
        { status: 500 }
      );
    }

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return NextResponse.json(
        { error: "This time slot is not available. Please select a different time." },
        { status: 409 }
      );
    }

    // Create the appointment
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        patient_id,
        therapist_id,
        scheduled_at,
        duration: duration || 30,
        type,
        notes,
        status: "upcoming"
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return NextResponse.json(
        { error: error.message || "Failed to create appointment" },
        { status: 500 }
      );
    }

    // If the appointment is a video call, create a Daily room
    if (type && type.toLowerCase() === 'video call') {
      try {
        console.log('DAILY_API_KEY:', process.env.DAILY_API_KEY);
        console.log('Creating Daily room for appointment:', appointment.id);
        const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: appointment.id,
            properties: { enable_prejoin_ui: true }
          }),
        });
        const dailyData = await dailyRes.json();
        console.log('Daily API response:', dailyRes.status, dailyData);
        if (!dailyRes.ok) {
          console.error('Error creating Daily room:', dailyData);
          // Optionally, you can delete the appointment if room creation fails
          // await supabase.from('appointments').delete().eq('id', appointment.id);
          return NextResponse.json(
            { error: 'Failed to create video call room', details: dailyData },
            { status: 500 }
          );
        }
      } catch (err: unknown) {
        console.error('Unexpected error creating Daily room:', err);
        // Optionally, you can delete the appointment if room creation fails
        // await supabase.from('appointments').delete().eq('id', appointment.id);
        return NextResponse.json(
          { error: 'Failed to create video call room', details: err instanceof Error ? err.message : err },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      appointment,
      message: "Appointment created successfully" 
    });
  } catch (err: unknown) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create appointment" },
      { status: 500 }
    );
  }
}

// PUT - Update an appointment (reschedule)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointment_id, scheduled_at, duration, type, notes, status } = body;

    if (!appointment_id) {
      return NextResponse.json(
        { error: "Missing appointment_id" },
        { status: 400 }
      );
    }

    // Get the current appointment to check permissions and conflicts
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

    // If rescheduling, check for conflicts
    if (scheduled_at && scheduled_at !== currentAppointment.scheduled_at) {
      const appointmentDate = new Date(scheduled_at);
      const endTime = new Date(appointmentDate.getTime() + (duration || currentAppointment.duration) * 60000);

      const { data: conflictingAppointments, error: conflictError } = await supabase
        .from("appointments")
        .select("id")
        .eq("therapist_id", currentAppointment.therapist_id)
        .eq("status", "upcoming")
        .neq("id", appointment_id)
        .or(`scheduled_at.lt.${endTime.toISOString()},scheduled_at.gte.${appointmentDate.toISOString()}`);

      if (conflictError) {
        console.error('Error checking conflicts:', conflictError);
        return NextResponse.json(
          { error: "Failed to check appointment availability" },
          { status: 500 }
        );
      }

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        return NextResponse.json(
          { error: "This time slot is not available. Please select a different time." },
          { status: 409 }
        );
      }
    }

    // Update the appointment
    const updateData: Record<string, unknown> = {};
    if (scheduled_at) updateData.scheduled_at = scheduled_at;
    if (duration) updateData.duration = duration;
    if (type) updateData.type = type;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    const { data: updatedAppointment, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointment_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return NextResponse.json(
        { error: error.message || "Failed to update appointment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      appointment: updatedAppointment,
      message: "Appointment updated successfully" 
    });
  } catch (err: unknown) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel an appointment
export async function DELETE(req: NextRequest) {
  try {
    const appointmentId = req.nextUrl.searchParams.get("id");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Missing appointment ID" },
        { status: 400 }
      );
    }

    // Get the current appointment to check if it can be cancelled
    const { data: currentAppointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (fetchError || !currentAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if appointment can be cancelled (not already completed/cancelled)
    if (currentAppointment.status === "completed" || currentAppointment.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot cancel an appointment that is already completed or cancelled" },
        { status: 400 }
      );
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(currentAppointment.scheduled_at);
    const now = new Date();
    if (appointmentDate < now) {
      return NextResponse.json(
        { error: "Cannot cancel an appointment that has already passed" },
        { status: 400 }
      );
    }

    // Cancel the appointment (soft delete by updating status)
    const { data: cancelledAppointment, error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling appointment:', error);
      return NextResponse.json(
        { error: error.message || "Failed to cancel appointment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      appointment: cancelledAppointment,
      message: "Appointment cancelled successfully" 
    });
  } catch (err: unknown) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to cancel appointment" },
      { status: 500 }
    );
  }
} 