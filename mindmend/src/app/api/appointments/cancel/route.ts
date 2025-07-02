import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Cancel an appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointment_id, reason } = body;

    // Validation
    if (!appointment_id) {
      return NextResponse.json(
        { error: "Missing required field: appointment_id" },
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

    // Check if appointment can be cancelled
    if (currentAppointment.status === "completed") {
      return NextResponse.json(
        { error: "Cannot cancel an appointment that is already completed" },
        { status: 400 }
      );
    }

    if (currentAppointment.status === "cancelled") {
      return NextResponse.json(
        { error: "Appointment is already cancelled" },
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

    // Check cancellation policy (e.g., must cancel at least 24 hours in advance)
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilAppointment < 24) {
      return NextResponse.json(
        { 
          error: "Appointments must be cancelled at least 24 hours in advance",
          hoursUntilAppointment: Math.round(hoursUntilAppointment)
        },
        { status: 400 }
      );
    }

    // Cancel the appointment (soft delete by updating status)
    const updateData: any = {
      status: "cancelled",
      updated_at: new Date().toISOString()
    };

    if (reason) {
      updateData.notes = currentAppointment.notes 
        ? `${currentAppointment.notes}\n\nCancellation reason: ${reason}`
        : `Cancellation reason: ${reason}`;
    }

    const { data: cancelledAppointment, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointment_id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling appointment:', error);
      return NextResponse.json(
        { error: error.message || "Failed to cancel appointment" },
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
      // Don't fail the cancellation if unavailability removal fails
    }

    return NextResponse.json({ 
      appointment: cancelledAppointment,
      message: "Appointment cancelled successfully",
      cancelled_at: new Date().toISOString(),
      original_time: currentAppointment.scheduled_at
    });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}

// GET - Get cancellation policy information
export async function GET(req: NextRequest) {
  const appointmentId = req.nextUrl.searchParams.get("id");

  if (!appointmentId) {
    return NextResponse.json(
      { error: "Missing appointment ID" },
      { status: 400 }
    );
  }

  try {
    // Get the appointment
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if appointment can be cancelled
    const appointmentDate = new Date(appointment.scheduled_at);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    const canCancel = appointment.status === "upcoming" && 
                     appointmentDate > now && 
                     hoursUntilAppointment >= 24;

    return NextResponse.json({
      appointment_id: appointmentId,
      scheduled_at: appointment.scheduled_at,
      status: appointment.status,
      can_cancel: canCancel,
      hours_until_appointment: Math.round(hoursUntilAppointment),
      cancellation_policy: {
        min_hours_advance: 24,
        message: "Appointments must be cancelled at least 24 hours in advance"
      }
    });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err.message || "Failed to get cancellation info" },
      { status: 500 }
    );
  }
} 