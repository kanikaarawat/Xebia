import { NextRequest, NextResponse } from 'next/server';

// GET /api/therapists/appointments?therapist_id=xxx
export async function GET(req: NextRequest) {
  const therapistId = req.nextUrl?.searchParams?.get('therapist_id');
  if (!therapistId) {
    return NextResponse.json({ error: 'Missing therapist_id' }, { status: 400 });
  }
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