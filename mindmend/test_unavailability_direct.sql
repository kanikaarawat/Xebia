-- Test unavailability table directly
-- Run this in Supabase SQL editor to see what data exists

-- Check all unavailability records
SELECT 
    '=== ALL UNAVAILABILITY RECORDS ===' as info;

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

-- Check for specific therapist
SELECT 
    '=== FOR SPECIFIC THERAPIST ===' as info;

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
ORDER BY start_time;

-- Check today's unavailability
SELECT 
    '=== TODAY UNAVAILABILITY ===' as info;

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
  AND DATE(start_time) = CURRENT_DATE
ORDER BY start_time;

-- Check this week's unavailability
SELECT 
    '=== THIS WEEK UNAVAILABILITY ===' as info;

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
  AND DATE(start_time) >= DATE_TRUNC('week', CURRENT_DATE)
  AND DATE(start_time) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY start_time; 