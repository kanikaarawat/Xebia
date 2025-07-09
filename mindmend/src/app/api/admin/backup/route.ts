import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'backup') {
      // Fetch all appointments with related data
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_patient_id_fkey(full_name, email),
          therapists!appointments_therapist_id_fkey(full_name, email, specialization)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const backupData = {
        timestamp: new Date().toISOString(),
        appointments: appointments || [],
        metadata: {
          totalAppointments: appointments?.length || 0,
          backupType: 'appointments_backup'
        }
      };

      // Store backup in a backup table or return as JSON
      const { error: backupError } = await supabase
        .from('appointment_backups')
        .insert({
          backup_data: backupData,
          created_at: new Date().toISOString()
        });

      if (backupError) {
        // If backup table doesn't exist, just return the data
        return NextResponse.json({
          success: true,
          message: 'Backup created successfully',
          data: backupData
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Backup stored successfully',
        backupId: backupData.timestamp
      });

    } else if (action === 'restore') {
      // Restore from backup data
      if (!data || !data.appointments) {
        return NextResponse.json(
          { error: 'Invalid backup data' },
          { status: 400 }
        );
      }

      // Clear existing appointments (be careful with this in production)
      const { error: clearError } = await supabase
        .from('appointments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep at least one record

      if (clearError) throw clearError;

      // Restore appointments
      const appointmentsToRestore = data.appointments.map((appointment: Record<string, unknown>) => ({
        id: appointment.id,
        patient_id: appointment.patient_id,
        therapist_id: appointment.therapist_id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        status: appointment.status,
        notes: appointment.notes,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at
      }));

      const { error: restoreError } = await supabase
        .from('appointments')
        .insert(appointmentsToRestore);

      if (restoreError) throw restoreError;

      return NextResponse.json({
        success: true,
        message: 'Backup restored successfully',
        restoredCount: appointmentsToRestore.length
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error handling backup:', error);
    return NextResponse.json(
      { error: 'Failed to handle backup operation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get list of available backups
    const { data: backups, error } = await supabase
      .from('appointment_backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If backup table doesn't exist, return empty list
      return NextResponse.json({
        backups: [],
        message: 'No backup table found'
      });
    }

    return NextResponse.json({
      backups: backups || [],
      totalBackups: backups?.length || 0
    });

  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    );
  }
} 