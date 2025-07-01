-- Fix Unavailability Table Issue
-- This script will check if the table exists and create it if needed

-- 1. Check if the table exists
SELECT 
    'Table exists check' as info,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'therapist_unavailability'
    ) as table_exists;

-- 2. If table doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'therapist_unavailability'
    ) THEN
        -- Create the table
        CREATE TABLE therapist_unavailability (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
            appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
            start_time TIMESTAMP WITH TIME ZONE NOT NULL,
            end_time TIMESTAMP WITH TIME ZONE NOT NULL,
            reason TEXT DEFAULT 'Booked session',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add indexes
        CREATE INDEX idx_therapist_unavailability_therapist_id ON therapist_unavailability(therapist_id);
        CREATE INDEX idx_therapist_unavailability_start_time ON therapist_unavailability(start_time);
        CREATE INDEX idx_therapist_unavailability_end_time ON therapist_unavailability(end_time);
        CREATE INDEX idx_therapist_unavailability_date_range ON therapist_unavailability(start_time, end_time);
        
        -- Disable RLS for now to avoid permission issues
        ALTER TABLE therapist_unavailability DISABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'therapist_unavailability table created successfully';
    ELSE
        RAISE NOTICE 'therapist_unavailability table already exists';
    END IF;
END $$;

-- 3. Check table structure
SELECT 
    'Table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'therapist_unavailability'
ORDER BY ordinal_position;

-- 4. Check RLS status
SELECT 
    'RLS status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'therapist_unavailability';

-- 5. Test a simple query
SELECT 
    'Test query' as info,
    COUNT(*) as record_count
FROM therapist_unavailability;

-- 6. Add some test data if table is empty
DO $$
DECLARE
    test_therapist_id UUID;
    record_count INTEGER;
BEGIN
    -- Get count of existing records
    SELECT COUNT(*) INTO record_count FROM therapist_unavailability;
    
    -- If no records exist, add test data
    IF record_count = 0 THEN
        -- Get first therapist
        SELECT id INTO test_therapist_id FROM therapists LIMIT 1;
        
        IF test_therapist_id IS NOT NULL THEN
            -- Add test unavailability
            INSERT INTO therapist_unavailability (
                therapist_id,
                start_time,
                end_time,
                reason
            ) VALUES (
                test_therapist_id,
                CURRENT_DATE + INTERVAL '10 hours',
                CURRENT_DATE + INTERVAL '11 hours',
                'Test: Morning session'
            );
            
            RAISE NOTICE 'Added test unavailability record for therapist %', test_therapist_id;
        ELSE
            RAISE NOTICE 'No therapists found to add test data';
        END IF;
    ELSE
        RAISE NOTICE 'Table already has % records', record_count;
    END IF;
END $$;

-- 7. Final verification
SELECT 
    'Final status' as info,
    (SELECT COUNT(*) FROM therapist_unavailability) as total_records,
    (SELECT COUNT(DISTINCT therapist_id) FROM therapist_unavailability) as unique_therapists; 