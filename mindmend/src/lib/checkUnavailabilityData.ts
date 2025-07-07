import { supabase } from "@/lib/supabaseClient";

export interface UnavailabilityRecord {
  id: string;
  therapist_id: string;
  therapist_name?: string;
  appointment_id?: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface UnavailabilitySummary {
  totalRecords: number;
  uniqueTherapists: number;
  withAppointments: number;
  withoutAppointments: number;
  orphanedRecords: number;
  missingUnavailability: number;
}

export interface UnavailabilityByReason {
  reason: string;
  count: number;
}

export interface UnavailabilityByTherapist {
  therapist_name: string;
  count: number;
}

/**
 * Get all unavailability data with comprehensive analysis
 */
export async function getAllUnavailabilityData() {
  console.log('🔍 Fetching all unavailability data...');
  
  try {
    // 1. First try a simple query to check if table exists and is accessible
    console.log('🔍 Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from("therapist_unavailability")
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Table access error:', testError);
      console.error('❌ Error details:', {
        message: testError.message,
        details: testError.details,
        hint: testError.hint,
        code: testError.code
      });
      
      // Return empty data structure if table doesn't exist or has issues
      return {
        records: [],
        summary: {
          totalRecords: 0,
          uniqueTherapists: 0,
          withAppointments: 0,
          withoutAppointments: 0,
          orphanedRecords: 0,
          missingUnavailability: 0
        },
        byReason: [],
        byTherapist: [],
        todayUnavailability: [],
        thisWeekUnavailability: []
      };
    }

    console.log('✅ Table is accessible');

    // 2. Get all unavailability records (without join first to test)
    console.log('🔍 Fetching unavailability records...');
    const { data: unavailabilityRecords, error: unavailabilityError } = await supabase
      .from("therapist_unavailability")
      .select('*')
      .order('start_time', { ascending: false });

    if (unavailabilityError) {
      console.error('❌ Error fetching unavailability records:', unavailabilityError);
      throw unavailabilityError;
    }

    console.log('✅ Unavailability records fetched:', unavailabilityRecords?.length || 0);

    // 3. Get appointments count for comparison
    console.log('🔍 Fetching appointments...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select('id');

    if (appointmentsError) {
      console.error('❌ Error fetching appointments:', appointmentsError);
      // Continue with empty appointments rather than failing completely
    }

    // 4. Get therapist names separately to avoid join issues
    console.log('🔍 Fetching therapist profiles...');
    const therapistIds = [...new Set(unavailabilityRecords?.map(r => r.therapist_id) || [])];
    let therapistProfiles: Record<string, unknown> = {};
    
    if (therapistIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select('id, first_name, last_name')
        .in('id', therapistIds);

      if (profilesError) {
        console.error('❌ Error fetching therapist profiles:', profilesError);
      } else {
        therapistProfiles = profiles?.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, unknown>) || {};
      }
    }

    // 5. Process the data
    const records = unavailabilityRecords || [];
    const appointmentIds = new Set(appointments?.map(a => a.id) || []);
    
    // Add therapist names to records
    const processedRecords: UnavailabilityRecord[] = records.map(record => {
      const profile = therapistProfiles[record.therapist_id];
      return {
        ...record,
        therapist_name: profile 
          ? `${(profile as { first_name?: string; last_name?: string }).first_name || ''} ${(profile as { first_name?: string; last_name?: string }).last_name || ''}`.trim() || 'Unknown Therapist'
          : 'Unknown Therapist'
      };
    });

    // 6. Calculate summary statistics
    const summary: UnavailabilitySummary = {
      totalRecords: records.length,
      uniqueTherapists: new Set(records.map(r => r.therapist_id)).size,
      withAppointments: records.filter(r => r.appointment_id).length,
      withoutAppointments: records.filter(r => !r.appointment_id).length,
      orphanedRecords: records.filter(r => r.appointment_id && !appointmentIds.has(r.appointment_id)).length,
      missingUnavailability: appointmentIds.size - records.filter(r => r.appointment_id && appointmentIds.has(r.appointment_id)).length
    };

    // 7. Group by reason
    const byReason: UnavailabilityByReason[] = Object.entries(
      records.reduce((acc, record) => {
        acc[record.reason] = (acc[record.reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([reason, count]) => ({ reason, count: count as number }))
    .sort((a, b) => (b.count as number) - (a.count as number));

    // 8. Group by therapist
    const byTherapist: UnavailabilityByTherapist[] = Object.entries(
      processedRecords.reduce((acc, record) => {
        const name = record.therapist_name || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([therapist_name, count]) => ({ therapist_name, count: count as number }))
    .sort((a, b) => (b.count as number) - (a.count as number));

    // 9. Get today's unavailability
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    const todayUnavailability = processedRecords.filter(record => {
      const recordDate = new Date(record.start_time);
      return recordDate >= startOfDay && recordDate < endOfDay;
    });

    // 10. Get this week's unavailability
    const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekUnavailability = processedRecords.filter(record => {
      const recordDate = new Date(record.start_time);
      return recordDate >= startOfWeek && recordDate < endOfWeek;
    });

    console.log('✅ Unavailability data analysis complete');
    
    return {
      records: processedRecords,
      summary,
      byReason,
      byTherapist,
      todayUnavailability,
      thisWeekUnavailability
    };

  } catch (error) {
    console.error('❌ Error in getAllUnavailabilityData:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return empty data structure on any error
    return {
      records: [],
      summary: {
        totalRecords: 0,
        uniqueTherapists: 0,
        withAppointments: 0,
        withoutAppointments: 0,
        orphanedRecords: 0,
        missingUnavailability: 0
      },
      byReason: [],
      byTherapist: [],
      todayUnavailability: [],
      thisWeekUnavailability: []
    };
  }
}

/**
 * Get unavailability for a specific date range
 */
export async function getUnavailabilityForDateRange(
  startDate: string, 
  endDate: string, 
  therapistId?: string
) {
  console.log('🔍 Fetching unavailability for date range:', { startDate, endDate, therapistId });
  
  try {
    let query = supabase
      .from("therapist_unavailability")
      .select('*')
      .gte('start_time', startDate)
      .lt('start_time', endDate)
      .order('start_time', { ascending: true });

    if (therapistId) {
      query = query.eq('therapist_id', therapistId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching unavailability for date range:', error);
      return [];
    }

    // Get therapist names separately
    const therapistIds = [...new Set(data?.map(r => r.therapist_id) || [])];
    let therapistProfiles: Record<string, unknown> = {};
    
    if (therapistIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select('id, first_name, last_name')
        .in('id', therapistIds);

      if (!profilesError && profiles) {
        therapistProfiles = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, unknown>);
      }
    }

    const processedRecords: UnavailabilityRecord[] = (data || []).map(record => {
      const profile = therapistProfiles[record.therapist_id];
      return {
        ...record,
        therapist_name: profile 
          ? `${(profile as { first_name?: string; last_name?: string }).first_name || ''} ${(profile as { first_name?: string; last_name?: string }).last_name || ''}`.trim() || 'Unknown Therapist'
          : 'Unknown Therapist'
      };
    });

    console.log('✅ Date range unavailability fetched:', processedRecords.length, 'records');
    return processedRecords;

  } catch (error) {
    console.error('❌ Error in getUnavailabilityForDateRange:', error);
    return [];
  }
}

/**
 * Check for data integrity issues
 */
export async function checkUnavailabilityDataIntegrity() {
  console.log('🔍 Checking unavailability data integrity...');
  
  try {
    // Get all unavailability records
    const { data: unavailabilityRecords, error: unavailabilityError } = await supabase
      .from("therapist_unavailability")
      .select('appointment_id')
      .not('appointment_id', 'is', null);

    if (unavailabilityError) {
      console.error('❌ Table access error:', unavailabilityError);
      return {
        orphanedRecords: { count: 0, ids: [] },
        missingUnavailability: { count: 0, ids: [] }
      };
    }

    // Get all appointment IDs
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select('id');

    if (appointmentsError) {
      console.error('❌ Error fetching appointments:', appointmentsError);
      return {
        orphanedRecords: { count: 0, ids: [] },
        missingUnavailability: { count: 0, ids: [] }
      };
    }

    const unavailabilityAppointmentIds = new Set(unavailabilityRecords?.map(r => r.appointment_id) || []);
    const appointmentIds = new Set(appointments?.map(a => a.id) || []);

    // Check for orphaned records
    const orphanedRecords = Array.from(unavailabilityAppointmentIds).filter(
      id => !appointmentIds.has(id)
    );

    // Check for missing unavailability
    const missingUnavailability = Array.from(appointmentIds).filter(
      id => !unavailabilityAppointmentIds.has(id)
    );

    const issues = {
      orphanedRecords: {
        count: orphanedRecords.length,
        ids: orphanedRecords
      },
      missingUnavailability: {
        count: missingUnavailability.length,
        ids: missingUnavailability
      }
    };

    console.log('✅ Data integrity check complete:', issues);
    return issues;

  } catch (error) {
    console.error('❌ Error in checkUnavailabilityDataIntegrity:', error);
    return {
      orphanedRecords: { count: 0, ids: [] },
      missingUnavailability: { count: 0, ids: [] }
    };
  }
}

/**
 * Get unavailability statistics
 */
export async function getUnavailabilityStats() {
  console.log('🔍 Getting unavailability statistics...');
  
  try {
    const { data, error } = await supabase
      .from("therapist_unavailability")
      .select('start_time, end_time, reason, therapist_id');

    if (error) {
      console.error('❌ Table access error:', error);
      return {
        totalRecords: 0,
        uniqueTherapists: 0,
        reasons: [],
        averageDuration: 0
      };
    }

    const records = data || [];
    
    // Calculate statistics
    const stats = {
      totalRecords: records.length,
      uniqueTherapists: new Set(records.map(r => r.therapist_id)).size,
      reasons: Object.entries(
        records.reduce((acc, record) => {
          acc[record.reason] = (acc[record.reason] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
      averageDuration: records.length > 0 
        ? records.reduce((sum, record) => {
            const duration = new Date(record.end_time).getTime() - new Date(record.start_time).getTime();
            return sum + duration;
          }, 0) / records.length / (1000 * 60) // Convert to minutes
        : 0
    };

    console.log('✅ Unavailability statistics calculated');
    return stats;

  } catch (error) {
    console.error('❌ Error in getUnavailabilityStats:', error);
    return {
      totalRecords: 0,
      uniqueTherapists: 0,
      reasons: [],
      averageDuration: 0
    };
  }
} 