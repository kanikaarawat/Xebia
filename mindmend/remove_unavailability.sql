-- Remove unavailability records from the database
-- Run this in Supabase SQL editor

-- First, let's see all unavailability records for the therapist
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

-- Show only manual blocks (can be safely removed)
SELECT 
    '=== MANUAL BLOCKS ONLY ===' as info;

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

-- Remove a specific manual block (replace 'RECORD_ID' with the actual ID)
-- DELETE FROM therapist_unavailability 
-- WHERE id = 'RECORD_ID' 
--     AND therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
--     AND appointment_id IS NULL;

-- Remove all manual blocks (BE CAREFUL!)
-- DELETE FROM therapist_unavailability 
-- WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
--     AND appointment_id IS NULL;

-- Remove manual blocks for a specific date (replace '2025-01-07' with your date)
-- DELETE FROM therapist_unavailability 
-- WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
--     AND appointment_id IS NULL
--     AND DATE(start_time) = '2025-01-07'; 