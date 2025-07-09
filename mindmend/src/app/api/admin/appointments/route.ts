import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET - Fetch all appointments with patient and therapist details
export async function GET() {
  try {
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(id, first_name, last_name, email),
        therapist:profiles!appointments_therapist_id_fkey(id, first_name, last_name, email)
      `)
      .order('scheduled_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient_id, therapist_id, scheduled_at, duration = 60, type = 'session', notes } = body;

    if (!patient_id || !therapist_id || !scheduled_at) {
      return NextResponse.json(
        { error: 'Patient ID, therapist ID, and scheduled time are required' },
        { status: 400 }
      );
    }

    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        patient_id,
        therapist_id,
        scheduled_at,
        duration,
        type,
        notes,
        status: 'upcoming',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

// PUT - Update appointment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, patient_id, therapist_id, scheduled_at, duration, type, status, notes, payment_status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (patient_id) updateData.patient_id = patient_id;
    if (therapist_id) updateData.therapist_id = therapist_id;
    if (scheduled_at) updateData.scheduled_at = scheduled_at;
    if (duration) updateData.duration = duration;
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (payment_status) updateData.payment_status = payment_status;

    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete appointment
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
} 