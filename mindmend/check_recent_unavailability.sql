-- Check recent unavailability records for therapist: 12f138a9-cd94-4f05-9869-b6650333265c
-- Run this in Supabase SQL editor

-- Show the most recent unavailability records (last 10)
SELECT 
    '=== MOST RECENT UNAVAILABILITY RECORDS ===' as info;

SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at,
    CASE 
        WHEN appointment_id IS NOT NULL THEN 'Appointment'
        ELSE 'Manual Block'
    END as type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
ORDER BY created_at DESC
LIMIT 10;

-- Show today's unavailability records
SELECT 
    '=== TODAY UNAVAILABILITY ===' as info;

SELECT 
    id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at,
    CASE 
        WHEN appointment_id IS NOT NULL THEN 'Appointment'
        ELSE 'Manual Block'
    END as type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
  AND DATE(start_time) = CURRENT_DATE
ORDER BY start_time;

-- Show this week's unavailability records
SELECT 
    '=== THIS WEEK UNAVAILABILITY ===' as info;

SELECT 
    id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at,
    CASE 
        WHEN appointment_id IS NOT NULL THEN 'Appointment'
        ELSE 'Manual Block'
    END as type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
  AND DATE(start_time) >= DATE_TRUNC('week', CURRENT_DATE)
  AND DATE(start_time) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY start_time;

-- Count summary
SELECT 
    '=== SUMMARY ===' as info;

SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN appointment_id IS NOT NULL THEN 1 END) as appointment_blocks,
    COUNT(CASE WHEN appointment_id IS NULL THEN 1 END) as manual_blocks,
    COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as added_today
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c';

-- Check recent unavailability records to see if they're manual or appointment-linked
-- Run this in Supabase SQL editor

-- Check unavailability records created today
SELECT 
    '=== TODAY\'S UNAVAILABILITY RECORDS ===' as info;

SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at,
    CASE 
        WHEN appointment_id IS NULL THEN 'Manual Block'
        ELSE 'Appointment Block'
    END as block_type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
    AND DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Check unavailability records from the last 7 days
SELECT 
    '=== LAST 7 DAYS UNAVAILABILITY RECORDS ===' as info;

SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at,
    CASE 
        WHEN appointment_id IS NULL THEN 'Manual Block'
        ELSE 'Appointment Block'
    END as block_type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
    AND created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Check if there are any manual blocks at all
SELECT 
    '=== ALL MANUAL BLOCKS ===' as info;

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
    AND appointment_id IS NULL
ORDER BY created_at DESC;

-- Check the most recent unavailability records (last 10)
SELECT 
    '=== MOST RECENT 10 UNAVAILABILITY RECORDS ===' as info;

SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at,
    CASE 
        WHEN appointment_id IS NULL THEN 'Manual Block'
        ELSE 'Appointment Block'
    END as block_type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
ORDER BY created_at DESC
LIMIT 10; 