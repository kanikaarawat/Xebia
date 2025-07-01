-- Debug script to identify unavailability insertion issues
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check if the table exists and its structure
SELECT 
    'Table exists check' as info,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'therapist_unavailability'
    ) as table_exists;

-- 2. Show the actual table schema
SELECT 
    'Table schema' as info,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'therapist_unavailability'
ORDER BY ordinal_position;

-- 3. Check if there are any constraints
SELECT 
    'Table constraints' as info,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_name = 'therapist_unavailability';

-- 4. Check foreign key constraints
SELECT 
    'Foreign key constraints' as info,
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

-- 5. Check RLS policies
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
WHERE tablename = 'therapist_unavailability';

-- 6. Check if RLS is enabled
SELECT 
    'RLS status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'therapist_unavailability';

-- 7. Test a simple insert to see what happens
-- (This will help identify the exact error)
DO $$
DECLARE
    test_therapist_id uuid;
    test_appointment_id uuid;
BEGIN
    -- Get a sample therapist_id
    SELECT id INTO test_therapist_id FROM therapists LIMIT 1;
    
    -- Get a sample appointment_id
    SELECT id INTO test_appointment_id FROM appointments LIMIT 1;
    
    IF test_therapist_id IS NOT NULL THEN
        RAISE NOTICE 'Testing insert with therapist_id: %', test_therapist_id;
        
        -- Try to insert a test record
        BEGIN
            INSERT INTO therapist_unavailability (
                therapist_id,
                appointment_id,
                start_time,
                end_time,
                reason
            ) VALUES (
                test_therapist_id,
                test_appointment_id,
                '2025-01-15T10:00:00+00:00',
                '2025-01-15T11:00:00+00:00',
                'Test session'
            );
            RAISE NOTICE '✅ Test insert successful';
            
            -- Clean up
            DELETE FROM therapist_unavailability WHERE reason = 'Test session';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'No therapists found in database';
    END IF;
END $$;

-- 8. Check current data in the table
SELECT 
    'Current data count' as info,
    COUNT(*) as record_count
FROM therapist_unavailability;

-- 9. Show sample data if any exists
SELECT 
    'Sample data' as info,
    *
FROM therapist_unavailability
LIMIT 3; 