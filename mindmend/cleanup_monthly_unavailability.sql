-- Clean up unavailability records that were created for the whole month
-- Run this in Supabase SQL editor

-- First, let's see what unavailability records exist
SELECT 
    '=== ALL UNAVAILABILITY RECORDS ===' as info;

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
ORDER BY created_at DESC;

-- Show records that were created by the old system (full day blocks)
SELECT 
    '=== FULL DAY BLOCKS (OLD SYSTEM) ===' as info;

SELECT 
    id,
    start_time,
    end_time,
    reason,
    created_at
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
    AND appointment_id IS NULL
    AND (end_time::time = '23:59:59' OR end_time::time = '23:59:59.999999')
    AND reason LIKE 'Unavailable - %'
ORDER BY created_at DESC;

-- Remove the full day blocks created by the old system
-- DELETE FROM therapist_unavailability 
-- WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
--     AND appointment_id IS NULL
--     AND (end_time::time = '23:59:59' OR end_time::time = '23:59:59.999999')
--     AND reason LIKE 'Unavailable - %';

-- Show remaining manual blocks after cleanup
SELECT 
    '=== REMAINING MANUAL BLOCKS ===' as info;

SELECT 
    id,
    start_time,
    end_time,
    reason,
    created_at
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
    AND appointment_id IS NULL
ORDER BY created_at DESC; 