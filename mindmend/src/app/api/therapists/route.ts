import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // Return mock therapist data for now
  return NextResponse.json({
    therapists: [
      {
        id: '1',
        name: 'Dr. Jane Doe',
        specialization: 'Cognitive Behavioral Therapy',
      },
      {
        id: '2',
        name: 'Dr. John Smith',
        specialization: 'Mindfulness-Based Therapy',
      },
    ],
  });
} 