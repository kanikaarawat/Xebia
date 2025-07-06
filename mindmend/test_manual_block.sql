-- Test creating a manual unavailability record directly
-- Run this in Supabase SQL editor to test if manual blocks work

-- Insert a test manual unavailability record
INSERT INTO therapist_unavailability (
    therapist_id,
    start_time,
    end_time,
    reason
) VALUES (
    '12f138a9-cd94-4f05-9869-b6650333265c',
    '2025-01-07 10:00:00+00',
    '2025-01-07 12:00:00+00',
    'Test manual block - should have no appointment_id'
);

-- Check if the record was created correctly
SELECT 
    '=== TEST MANUAL BLOCK RESULT ===' as info;

SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at,
    CASE 
        WHEN appointment_id IS NULL THEN 'Manual Block ✓'
        ELSE 'Appointment Block ✗'
    END as block_type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
    AND reason = 'Test manual block - should have no appointment_id'
ORDER BY created_at DESC
LIMIT 1;

-- Clean up the test record
DELETE FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
    AND reason = 'Test manual block - should have no appointment_id'; 