-- Add test unavailability data for testing the booking system
-- This script creates sample unavailable slots for testing

-- First, let's see what therapists we have
SELECT 
    'Available therapists' as info,
    t.id,
    p.first_name,
    p.last_name,
    t.specialization
FROM therapists t
JOIN profiles p ON t.id = p.id
LIMIT 5;

-- Add some test unavailability for the first therapist
-- This will block some time slots for testing

-- Get the first therapist ID
DO $$
DECLARE
    therapist_uuid UUID;
BEGIN
    -- Get the first therapist
    SELECT t.id INTO therapist_uuid 
    FROM therapists t 
    LIMIT 1;
    
    IF therapist_uuid IS NOT NULL THEN
        -- Add test unavailability for today and tomorrow
        INSERT INTO therapist_unavailability (
            therapist_id,
            start_time,
            end_time,
            reason
        ) VALUES 
        -- Today: Block 10:00-11:00 AM
        (
            therapist_uuid,
            CURRENT_DATE + INTERVAL '10 hours',
            CURRENT_DATE + INTERVAL '11 hours',
            'Test: Morning session'
        ),
        -- Today: Block 2:00-3:00 PM  
        (
            therapist_uuid,
            CURRENT_DATE + INTERVAL '14 hours',
            CURRENT_DATE + INTERVAL '15 hours',
            'Test: Afternoon session'
        ),
        -- Tomorrow: Block 9:00-10:00 AM
        (
            therapist_uuid,
            CURRENT_DATE + INTERVAL '1 day' + INTERVAL '9 hours',
            CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours',
            'Test: Tomorrow morning'
        ),
        -- Tomorrow: Block 3:00-4:00 PM
        (
            therapist_uuid,
            CURRENT_DATE + INTERVAL '1 day' + INTERVAL '15 hours',
            CURRENT_DATE + INTERVAL '1 day' + INTERVAL '16 hours',
            'Test: Tomorrow afternoon'
        );
        
        RAISE NOTICE 'Added test unavailability for therapist %', therapist_uuid;
    ELSE
        RAISE NOTICE 'No therapists found to add test data';
    END IF;
END $$;

-- Verify the test data was added
SELECT 
    'Test unavailability added' as status,
    COUNT(*) as count
FROM therapist_unavailability
WHERE reason LIKE 'Test:%';

-- Show the test unavailability records
SELECT 
    id,
    therapist_id,
    start_time,
    end_time,
    reason,
    created_at
FROM therapist_unavailability
WHERE reason LIKE 'Test:%'
ORDER BY start_time;

-- Test query: Get unavailability for today
SELECT 
    'Today unavailability' as test_type,
    start_time,
    end_time,
    reason
FROM therapist_unavailability
WHERE therapist_id = (
    SELECT t.id FROM therapists t LIMIT 1
)
AND start_time >= CURRENT_DATE
AND start_time < CURRENT_DATE + INTERVAL '1 day'
ORDER BY start_time; 