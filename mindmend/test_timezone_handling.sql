-- Test timezone handling for unavailability system
-- This script tests the specific timestamp format: 2025-07-02 12:30:00+00

-- 1. Check current database timezone
SELECT 
    'Database timezone' as info,
    current_setting('timezone') as timezone;

-- 2. Test timestamp parsing
SELECT 
    'Timestamp parsing test' as test_type,
    '2025-07-02 12:30:00+00'::timestamp with time zone as original_timestamp,
    '2025-07-02 12:30:00+00'::timestamp with time zone AT TIME ZONE 'UTC' as utc_time,
    '2025-07-02 12:30:00+00'::timestamp with time zone AT TIME ZONE 'UTC'::time as extracted_time;

-- 3. Test date range queries
SELECT 
    'Date range test' as test_type,
    '2025-07-02'::date as test_date,
    '2025-07-02'::date + interval '0 hours' as start_of_day,
    '2025-07-02'::date + interval '23 hours 59 minutes 59 seconds' as end_of_day;

-- 4. Test unavailability query with timezone-aware timestamps
-- First, let's see if we have any existing unavailability records
SELECT 
    'Existing unavailability records' as info,
    COUNT(*) as count
FROM therapist_unavailability;

-- 5. Show sample unavailability records with timezone info
SELECT 
    'Sample unavailability records' as info,
    id,
    therapist_id,
    start_time,
    end_time,
    start_time AT TIME ZONE 'UTC' as start_time_utc,
    end_time AT TIME ZONE 'UTC' as end_time_utc,
    reason,
    created_at
FROM therapist_unavailability
ORDER BY created_at DESC
LIMIT 5;

-- 6. Test query for a specific date with timezone handling
-- This simulates what the getFreeSlots function does
SELECT 
    'Timezone-aware query test' as test_type,
    start_time,
    end_time,
    start_time AT TIME ZONE 'UTC' as start_utc,
    end_time AT TIME ZONE 'UTC' as end_utc,
    reason
FROM therapist_unavailability
WHERE therapist_id = (
    SELECT id FROM therapists LIMIT 1
)
AND start_time >= '2025-07-02T00:00:00Z'::timestamp with time zone
AND start_time < '2025-07-02T23:59:59Z'::timestamp with time zone
ORDER BY start_time;

-- 7. Test with different timezone formats
SELECT 
    'Timezone format comparison' as test_type,
    '2025-07-02 12:30:00+00'::timestamp with time zone as format_1,
    '2025-07-02T12:30:00Z'::timestamp with time zone as format_2,
    '2025-07-02 12:30:00'::timestamp as format_3;

-- 8. Test appointment creation with timezone
-- This shows how appointments are stored
SELECT 
    'Appointment timestamp format' as info,
    scheduled_at,
    scheduled_at AT TIME ZONE 'UTC' as scheduled_utc,
    duration,
    type
FROM appointments
ORDER BY created_at DESC
LIMIT 3;

-- 9. Test trigger function with timezone-aware data
-- This simulates what happens when an appointment is created
SELECT 
    'Trigger function test' as test_type,
    create_therapist_unavailability() as trigger_function_exists;

-- 10. Manual test: Create a test unavailability with timezone
-- This helps verify the system works with your timestamp format
DO $$
DECLARE
    therapist_uuid UUID;
    test_start TIMESTAMP WITH TIME ZONE;
    test_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the first therapist
    SELECT t.id INTO therapist_uuid 
    FROM therapists t 
    LIMIT 1;
    
    IF therapist_uuid IS NOT NULL THEN
        -- Create test timestamps in the format you mentioned
        test_start := '2025-07-02 12:30:00+00'::timestamp with time zone;
        test_end := '2025-07-02 13:30:00+00'::timestamp with time zone;
        
        -- Insert test unavailability
        INSERT INTO therapist_unavailability (
            therapist_id,
            start_time,
            end_time,
            reason
        ) VALUES (
            therapist_uuid,
            test_start,
            test_end,
            'Test: Timezone handling test'
        );
        
        RAISE NOTICE 'Added test unavailability: % to % for therapist %', 
            test_start, test_end, therapist_uuid;
    ELSE
        RAISE NOTICE 'No therapists found for testing';
    END IF;
END $$;

-- 11. Verify the test data was added
SELECT 
    'Test unavailability added' as status,
    start_time,
    end_time,
    start_time AT TIME ZONE 'UTC' as start_utc,
    end_time AT TIME ZONE 'UTC' as end_utc,
    reason
FROM therapist_unavailability
WHERE reason = 'Test: Timezone handling test'
ORDER BY created_at DESC;

-- 12. Test the exact query that getFreeSlots uses
SELECT 
    'getFreeSlots query simulation' as test_type,
    start_time,
    end_time,
    reason
FROM therapist_unavailability
WHERE therapist_id = (
    SELECT t.id FROM therapists t LIMIT 1
)
AND start_time >= '2025-07-02T00:00:00.000Z'::timestamp with time zone
AND start_time < '2025-07-02T23:59:59.999Z'::timestamp with time zone
ORDER BY start_time; 