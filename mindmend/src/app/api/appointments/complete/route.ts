import { NextRequest, NextResponse } from "next/server";

// POST - Mark appointment as complete
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointment_id } = body;

    if (!appointment_id) {
      return NextResponse.json(
        { error: "Missing appointment_id" },
        { status: 400 }
      );
    }

    // Get the current appointment to check if it can be completed
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

    // Check if appointment can be completed
    if (currentAppointment.status === "completed") {
      return NextResponse.json(
        { error: "Appointment is already completed" },
        { status: 400 }
      );
    }

    if (currentAppointment.status === "cancelled" || currentAppointment.status === "rejected") {
      return NextResponse.json(
        { error: "Cannot complete a cancelled or rejected appointment" },
        { status: 400 }
      );
    }

    // Update the appointment status to completed
    const { data: updatedAppointment, error: updateError } = await supabase
      .from("appointments")
      .update({ 
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("id", appointment_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to complete appointment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      appointment: updatedAppointment,
      message: "Appointment marked as complete successfully" 
    });
  } catch (err: unknown) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message || "Failed to complete appointment" : "Failed to complete appointment" },
      { status: 500 }
    );
  }
} 