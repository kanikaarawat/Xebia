import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
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