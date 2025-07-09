import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const { data: therapists, error } = await supabaseAdmin
      .from('therapists')
      .select(`
        *,
        profile:profiles!therapists_id_fkey(id, email, first_name, last_name, role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedTherapists = therapists?.map(therapist => ({
      id: therapist.id,
      specialization: therapist.specialization,
      license_number: therapist.license_number,
      created_at: therapist.created_at,
      updated_at: therapist.updated_at,
      email: therapist.profile?.email,
      first_name: therapist.profile?.first_name,
      last_name: therapist.profile?.last_name,
      full_name: therapist.profile ? `${therapist.profile.first_name} ${therapist.profile.last_name}` : 'Unknown'
    })) || [];

    return NextResponse.json(formattedTherapists);

  } catch (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch therapists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, first_name, last_name, specialization, license_number } = body;

    // Create auth user first
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'tempPassword123!', // This should be changed by user
      email_confirm: true
    });

    if (authError) throw authError;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name,
        last_name,
        role: 'therapist'
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Create therapist record
    const { data: therapistData, error: therapistError } = await supabaseAdmin
      .from('therapists')
      .insert({
        id: authData.user.id,
        specialization,
        license_number
      })
      .select()
      .single();

    if (therapistError) throw therapistError;

    return NextResponse.json(therapistData);

  } catch (error) {
    console.error('Error creating therapist:', error);
    return NextResponse.json(
      { error: 'Failed to create therapist' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, specialization, license_number, email, first_name, last_name } = body;

    // Update therapist record
    const { data: therapistData, error: therapistError } = await supabaseAdmin
      .from('therapists')
      .update({
        specialization,
        license_number
      })
      .eq('id', id)
      .select()
      .single();

    if (therapistError) throw therapistError;

    // Update profile if provided
    if (email || first_name || last_name) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          email,
          first_name,
          last_name
        })
        .eq('id', id);

      if (profileError) throw profileError;
    }

    return NextResponse.json(therapistData);

  } catch (error) {
    console.error('Error updating therapist:', error);
    return NextResponse.json(
      { error: 'Failed to update therapist' },
      { status: 500 }
    );
  }
}

// DELETE method removed - admin can only read and write, not delete 