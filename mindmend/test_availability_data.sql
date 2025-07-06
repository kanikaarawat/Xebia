-- Test script to check availability and unavailability data
-- Run this in Supabase SQL editor to see what data exists

-- Check therapist_availability table
SELECT '=== THERAPIST_AVAILABILITY TABLE ===' as info;
SELECT 
    id,
    therapist_id,
    day_of_week,
    start_time,
    end_time,
    is_available,
    created_at
FROM therapist_availability 
ORDER BY day_of_week;

-- Check therapist_unavailability table
SELECT '=== THERAPIST_UNAVAILABILITY TABLE ===' as info;
SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at
FROM therapist_unavailability 
ORDER BY start_time;

-- Check appointments table
SELECT '=== APPOINTMENTS TABLE ===' as info;
SELECT 
    id,
    therapist_id,
    patient_id,
    scheduled_at,
    duration,
    status,
    type,
    created_at
FROM appointments 
ORDER BY scheduled_at;

-- Check if triggers exist
SELECT '=== TRIGGERS ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'appointments';

-- Check if functions exist
SELECT '=== FUNCTIONS ===' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%unavailability%';

-- Test: Create a sample appointment to see if trigger works
-- (Uncomment these lines to test)
/*
INSERT INTO appointments (
    therapist_id,
    patient_id,
    scheduled_at,
    duration,
    type,
    status
) VALUES (
    'your-therapist-id-here',
    'your-patient-id-here',
    '2024-01-15T10:00:00Z',
    60,
    'therapy',
    'upcoming'
);
*/ 