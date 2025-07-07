import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    console.log('🔍 Debug: Checking all emails in profiles table...');

    // Get all profiles with emails
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Found profiles:', profiles);

    return NextResponse.json({
      message: 'Debug: All emails in profiles table',
      count: profiles?.length || 0,
      profiles: profiles || []
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 