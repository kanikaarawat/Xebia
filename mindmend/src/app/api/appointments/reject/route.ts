import { NextRequest, NextResponse } from "next/server";

// POST - Therapist rejects an appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointment_id, reason, therapist_id } = body;

    // Validation
    if (!appointment_id || !reason || !therapist_id) {
      return NextResponse.json(
        { error: "Missing required fields: appointment_id, reason, therapist_id" },
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

    // Check if the user is the therapist for this appointment
    if (currentAppointment.therapist_id !== therapist_id) {
      return NextResponse.json(
        { error: "Only the assigned therapist can reject this appointment" },
        { status: 403 }
      );
    }

    // Check if appointment can be rejected
    if (currentAppointment.status === "completed") {
      return NextResponse.json(
        { error: "Cannot reject an appointment that is already completed" },
        { status: 400 }
      );
    }
    if (currentAppointment.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot reject an appointment that is already cancelled" },
        { status: 400 }
      );
    }
    if (currentAppointment.status === "rejected") {
      return NextResponse.json(
        { error: "Appointment is already rejected" },
        { status: 400 }
      );
    }

    // Reject the appointment (update status and notes)
    const updateData: Record<string, unknown> = {
      status: "rejected",
      updated_at: new Date().toISOString(),
      notes: currentAppointment.notes
        ? `${currentAppointment.notes}\n\nRejection reason: ${reason}`
        : `Rejection reason: ${reason}`
    };

    const { data: rejectedAppointment, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointment_id)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting appointment:', error);
      return NextResponse.json(
        { error: error.message || "Failed to reject appointment" },
        { status: 500 }
      );
    }

    // Remove the unavailability record for this appointment
    try {
      await supabase
        .from("therapist_unavailability")
        .delete()
        .eq("appointment_id", appointment_id);
    } catch (unavailError) {
      console.warn('Could not remove unavailability record:', unavailError);
      // Don't fail the rejection if unavailability removal fails
    }

    // --- Notification Logic ---
    // Prepare notification payloads
    const appointmentTime = new Date(currentAppointment.scheduled_at).toLocaleString();
    const meta = { appointment_id, scheduled_at: currentAppointment.scheduled_at };

    // Notify patient
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentAppointment.patient_id,
        type: 'appointment_rejected',
        title: 'Appointment Rejected',
        message: `Your appointment scheduled for ${appointmentTime} was rejected by your therapist. Reason: ${reason}`,
        meta
      })
    });

    return NextResponse.json({
      appointment: rejectedAppointment,
      message: "Appointment rejected successfully",
      rejected_at: new Date().toISOString(),
      original_time: currentAppointment.scheduled_at
    });
  } catch (err: unknown) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reject appointment" },
      { status: 500 }
    );
  }
} 