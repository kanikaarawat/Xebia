import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const therapistId = req.nextUrl?.searchParams?.get('therapist_id');
  if (therapistId) {
    // Fetch appointments for this therapist
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey (
          id, first_name, last_name, email, avatar_url
        )
      `)
      .eq('therapist_id', therapistId)
      .order('scheduled_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ appointments });
  }
  try {
    const { data: therapists, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        bio,
        avatar_url,
        role,
        therapists (
          specialization,
          license_number,
          created_at,
          updated_at
        )
      `)
      .eq('role', 'therapist');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ therapists });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 