// types.ts - shared type definitions for dashboard and related components

export interface Appointment {
  id: string;
  patient_id: string;
  scheduled_at: string;
  notes: string;
  status: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  type: string;
  duration: number;
  created_at: string;
  payment_id?: string;
  payment_status?: string;
  payment_amount?: number;
  payment_currency?: string;
}

export interface TherapistProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  avatar_url?: string;
  specialization: string;
  license_number: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  id?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface UnavailabilityRecord {
  id: string;
  therapist_id: string;
  appointment_id?: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_at: string;
  appointment?: {
    id: string;
    patient_id: string;
    type: string;
    duration: number;
    status: string;
    patient?: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface AvailabilityAnalytics {
  totalAvailableHours: number;
  totalBookedHours: number;
  utilizationRate: number;
  busiestDay: string;
  leastBusyDay: string;
  averageSessionDuration: number;
} 