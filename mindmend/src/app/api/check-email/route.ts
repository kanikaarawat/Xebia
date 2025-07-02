import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      console.log('❌ No email provided');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking email existence for:', email);

    const supabase = createRouteHandlerClient({ cookies });

    // Check profiles table first
    console.log('📊 Querying profiles table...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    console.log('📊 Profiles query result:', { profile, error: profileError });

    if (profile) {
      console.log('✅ Email found in profiles table:', profile.email);
      return NextResponse.json(
        { exists: true, message: 'Email already registered' },
        { status: 200 }
      );
    }

    // Check auth.users table using RPC function
    console.log('📊 Querying auth.users table via RPC...');
    const { data: authResult, error: authError } = await supabase
      .rpc('check_email_exists', { email_to_check: email });

    console.log('📊 Auth users RPC result:', { authResult, error: authError });

    if (authError) {
      console.log('❌ RPC function error:', authError);
      // If RPC fails, we'll fall back to just checking profiles
      console.log('⚠️ Falling back to profiles-only check');
    } else if (authResult && authResult.length > 0 && authResult[0].email_exists) {
      console.log('✅ Email found in auth.users table');
      return NextResponse.json(
        { exists: true, message: 'Email already registered' },
        { status: 200 }
      );
    }

    // If we get here, email doesn't exist in either table
    console.log('✅ Email not found in either table');
    return NextResponse.json(
      { exists: false, message: 'Email is available' },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 