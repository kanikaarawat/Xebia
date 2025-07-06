-- Check and fix therapist_unavailability table structure
-- Run this in Supabase SQL editor

-- Check current table structure
SELECT 
    '=== CURRENT TABLE STRUCTURE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'therapist_unavailability'
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT 
    '=== FOREIGN KEY CONSTRAINTS ===' as info;

SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'therapist_unavailability';

-- Check if appointment_id foreign key exists
SELECT 
    '=== APPOINTMENT_ID FOREIGN KEY ===' as info;

SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'therapist_unavailability'
    AND kcu.column_name = 'appointment_id';

-- Add foreign key constraint if it doesn't exist
-- (Uncomment these lines if the foreign key is missing)
/*
ALTER TABLE therapist_unavailability 
ADD CONSTRAINT fk_therapist_unavailability_appointment 
FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;
*/

-- Test a simple query
SELECT 
    '=== TEST SIMPLE QUERY ===' as info;

SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at
FROM therapist_unavailability 
LIMIT 5;

-- Test query with joins
SELECT 
    '=== TEST QUERY WITH JOINS ===' as info;

SELECT 
    tu.id,
    tu.therapist_id,
    tu.appointment_id,
    tu.start_time,
    tu.end_time,
    tu.reason,
    a.id as appointment_id_from_join,
    a.patient_id,
    a.type,
    a.duration,
    a.status
FROM therapist_unavailability tu
LEFT JOIN appointments a ON tu.appointment_id = a.id
LIMIT 5; 