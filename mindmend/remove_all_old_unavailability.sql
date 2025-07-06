-- Remove all old unavailability records created by the old system
-- Run this in Supabase SQL editor

-- First, let's see what we're about to delete
SELECT 
    '=== RECORDS TO BE DELETED ===' as info;

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

-- Count how many records will be deleted
SELECT 
    '=== COUNT OF RECORDS TO DELETE ===' as info;

SELECT 
    COUNT(*) as records_to_delete
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
    AND appointment_id IS NULL
    AND (end_time::time = '23:59:59' OR end_time::time = '23:59:59.999999')
    AND reason LIKE 'Unavailable - %';

-- DELETE ALL OLD UNAVAILABILITY RECORDS
-- Uncomment the line below to actually delete the records
DELETE FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
    AND appointment_id IS NULL
    AND (end_time::time = '23:59:59' OR end_time::time = '23:59:59.999999')
    AND reason LIKE 'Unavailable - %';

-- Verify deletion - show remaining manual blocks
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

-- Show all remaining unavailability records
SELECT 
    '=== ALL REMAINING UNAVAILABILITY RECORDS ===' as info;

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