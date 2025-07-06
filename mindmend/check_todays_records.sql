-- Check the actual records added today for therapist: 12f138a9-cd94-4f05-9869-b6650333265c
-- Run this in Supabase SQL editor

-- Show all records added today
SELECT 
    '=== RECORDS ADDED TODAY ===' as info;

SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
  AND DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Show the appointments that were created today
SELECT 
    '=== APPOINTMENTS CREATED TODAY ===' as info;

SELECT 
    id,
    therapist_id,
    patient_id,
    scheduled_at,
    duration,
    type,
    status,
    created_at
FROM appointments 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
  AND DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Show the most recent 5 unavailability records
SELECT 
    '=== MOST RECENT 5 UNAVAILABILITY RECORDS ===' as info;

SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
ORDER BY created_at DESC
LIMIT 5;

-- Check if there are any unavailability records without appointments
SELECT 
    '=== UNAVAILABILITY WITHOUT APPOINTMENTS ===' as info;

SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
  AND appointment_id IS NULL; 