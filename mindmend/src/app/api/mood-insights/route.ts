import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
export async function GET() {
  return NextResponse.json({ message: "Mood API is working ✅" });
}

export async function POST(req: NextRequest) {
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // ✅ Get user from cookie-based session
    let {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Optional: fallback to Bearer token if cookie session is missing
    if (!user) {
      const bearer = req.headers.get('authorization')?.replace('Bearer ', '');
      if (bearer) {
        ({ data: { user }, error: authError } = await supabase.auth.getUser(bearer));
      }
    }

    if (authError || !user) {
      // More helpful error for missing session
      return NextResponse.json({ error: 'Unauthorized: No Supabase session found. Please log in.' }, { status: 401 });
    }

    const { mood_score, notes } = await req.json();
    if (typeof mood_score !== 'number' || mood_score < 1 || mood_score > 5) {
      return NextResponse.json({ error: 'Invalid mood_score (1-5)' }, { status: 400 });
    }

    // Get Indian Standard Time (IST) date
    const today = new Date().toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }); // Returns 'YYYY-MM-DD' in IST
    console.log('Request started');
    console.log('user:', user);
    console.log('mood_score:', mood_score);
    console.log('notes:', notes);
    
    // ✅ Insert mood with user_id manually (RLS requires session)
    const { data, error } = await supabase
    .from("mood_logs")
    .upsert(
      [{
        user_id: user.id,  // ✅ insert directly
        mood_score,
        logged_at: today,
        notes
      }],
      { onConflict: 'user_id,logged_at' }
    );
  

    if (error) {
      // Clarify RLS/session error for the user
      if (error.message && error.message.includes('auth.uid() is null')) {
        return NextResponse.json({ error: 'No Supabase session found (auth.uid() is null). Please ensure you are logged in and your session is valid.' }, { status: 401 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Mood logged successfully!',
      mood: data,
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
