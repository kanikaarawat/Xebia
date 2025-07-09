import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // Get total users count (profiles with role 'user')
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'user');

    if (usersError) throw usersError;

    // Get total therapists count (profiles with role 'therapist')
    const { data: therapists, error: therapistsError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'therapist');

    if (therapistsError) throw therapistsError;

    // Get appointments counts with correct status values
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select('status, type, payment_status');

    if (appointmentsError) throw appointmentsError;

    const totalAppointments = appointments?.length || 0;
    const upcomingAppointments = appointments?.filter(a => a.status === 'upcoming').length || 0;
    const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
    const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
    const rejectedAppointments = appointments?.filter(a => a.status === 'rejected').length || 0;
    const expiredAppointments = appointments?.filter(a => a.status === 'expired').length || 0;

    // Get call type counts - handle both 'Video Call' and 'Phone Call' types
    const phoneCallAppointments = appointments?.filter(a => a.type === 'Phone Call') || [];
    const videoCallAppointments = appointments?.filter(a => a.type === 'Video Call') || [];
    const totalPhoneCalls = phoneCallAppointments.length;
    const totalVideoCalls = videoCallAppointments.length;

    // Get payment statistics - handle both 'pending' and 'paid' status
    const pendingPayments = appointments?.filter(a => a.payment_status === 'pending').length || 0;
    const paidPayments = appointments?.filter(a => a.payment_status === 'paid').length || 0;

    return NextResponse.json({
      totalUsers: users?.length || 0,
      totalTherapists: therapists?.length || 0,
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
      rejectedAppointments,
      expiredAppointments,
      totalPhoneCalls,
      totalVideoCalls,
      pendingPayments,
      paidPayments
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 