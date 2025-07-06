-- Remove manual unavailability blocks for therapist: 12f138a9-cd94-4f05-9869-b6650333265c
-- Run this in Supabase SQL editor

-- First, let's see what manual blocks exist
SELECT 
    '=== MANUAL BLOCKS TO BE REMOVED ===' as info;

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
ORDER BY start_time;

-- Count how many manual blocks will be removed
SELECT 
    '=== COUNT OF MANUAL BLOCKS ===' as info;

SELECT 
    COUNT(*) as manual_blocks_to_remove
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
  AND appointment_id IS NULL;

-- Remove manual blocks (uncomment the DELETE statement below to actually remove them)
/*
DELETE FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
  AND appointment_id IS NULL;
*/

-- Verify what remains after removal
SELECT 
    '=== REMAINING UNAVAILABILITY RECORDS ===' as info;

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
ORDER BY start_time;

-- Final summary
SELECT 
    '=== FINAL SUMMARY ===' as info;

SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN appointment_id IS NOT NULL THEN 1 END) as appointment_blocks,
    COUNT(CASE WHEN appointment_id IS NULL THEN 1 END) as manual_blocks
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'; 