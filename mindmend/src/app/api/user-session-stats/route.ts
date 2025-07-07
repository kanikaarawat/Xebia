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
  // Return mock stats for now
  return NextResponse.json({
    userId: user.id,
    stats: {
      sessions: 5,
      lastSession: '2024-06-01T12:00:00Z',
    },
  });
} 