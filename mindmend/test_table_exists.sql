-- Test if therapist_unavailability table exists and is accessible
-- Run this in Supabase SQL Editor

-- 1. Check if table exists
SELECT 
    'Table exists' as check_type,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'therapist_unavailability'
    ) as result;

-- 2. If table exists, try to query it
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'therapist_unavailability'
    ) THEN
        RAISE NOTICE 'Table exists - testing query...';
        
        -- Test a simple query
        PERFORM COUNT(*) FROM therapist_unavailability;
        RAISE NOTICE 'Query successful - table is accessible';
        
    ELSE
        RAISE NOTICE 'Table does not exist';
    END IF;
END $$;

-- 3. Show table structure if it exists
SELECT 
    'Table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'therapist_unavailability'
ORDER BY ordinal_position;

-- 4. Show RLS status
SELECT 
    'RLS status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'therapist_unavailability'; 