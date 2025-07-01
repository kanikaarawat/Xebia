-- Test the therapist unavailability trigger
-- This script will test if the trigger is working correctly with the correct schema

-- First, check current state
SELECT 
    'Current state' as info,
    (SELECT COUNT(*) FROM appointments) as appointments_count,
    (SELECT COUNT(*) FROM therapist_unavailability) as unavailability_count;

-- Check table schema
SELECT 
    'therapist_unavailability table schema' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'therapist_unavailability'
ORDER BY ordinal_position;

-- Test 1: Check if trigger exists and is enabled
SELECT 
    'Trigger status' as info,
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'appointments'
AND trigger_name = 'trigger_create_therapist_unavailability';

-- Test 2: Check function exists
SELECT 
    'Function status' as info,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'create_therapist_unavailability';

-- Test 3: Check recent appointments and their unavailability records
SELECT 
    'Recent appointments and unavailability' as info,
    a.id as appointment_id,
    a.scheduled_at,
    a.duration,
    a.type,
    CASE 
        WHEN tu.id IS NOT NULL THEN 'Has unavailability record'
        ELSE 'Missing unavailability record'
    END as unavailability_status,
    tu.date as unavailability_date,
    tu.start_time as unavailability_start,
    tu.end_time as unavailability_end,
    tu.reason
FROM appointments a
LEFT JOIN therapist_unavailability tu ON a.id = tu.appointment_id
ORDER BY a.scheduled_at DESC
LIMIT 10;

-- Test 4: Check for any appointments without unavailability records
SELECT 
    'Appointments missing unavailability records' as info,
    COUNT(*) as count
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM therapist_unavailability tu 
    WHERE tu.appointment_id = a.id
);

-- Test 5: Show sample of missing records
SELECT 
    a.id as appointment_id,
    a.therapist_id,
    a.scheduled_at,
    a.duration,
    a.type,
    a.status
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM therapist_unavailability tu 
    WHERE tu.appointment_id = a.id
)
LIMIT 5;

-- Test 6: Check table permissions
SELECT 
    'Table permissions' as info,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges
WHERE table_name IN ('appointments', 'therapist_unavailability')
AND grantee = 'authenticated';

-- Test 7: Verify RLS policies
SELECT 
    'RLS policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('appointments', 'therapist_unavailability');

-- Test 8: Show sample unavailability records
SELECT 
    'Sample unavailability records' as info,
    id,
    therapist_id,
    appointment_id,
    date,
    start_time,
    end_time,
    reason,
    created_at
FROM therapist_unavailability
ORDER BY created_at DESC
LIMIT 5; 