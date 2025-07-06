-- Check the most recent appointments for this therapist
-- Run this in Supabase SQL editor

SELECT 
    '=== MOST RECENT APPOINTMENTS ===' as info;

SELECT 
    id,
    therapist_id,
    patient_id,
    scheduled_at,
    duration,
    type,
    status,
    created_at,
    notes
FROM appointments 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
ORDER BY created_at DESC
LIMIT 10; 