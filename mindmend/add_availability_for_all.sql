-- Add Availability for All Existing Therapists
-- This will add Monday-Friday availability for all therapists in your database

-- First, let's see what therapists we have
SELECT 
    'Current therapists' as info,
    COUNT(*) as count
FROM therapists;

-- Show all therapists
SELECT 
    t.id,
    p.first_name,
    p.last_name,
    t.specialization
FROM therapists t
JOIN profiles p ON t.id = p.id
ORDER BY p.first_name;

-- Check current availability
SELECT 
    'Current availability count' as info,
    COUNT(*) as count
FROM therapist_availability;

-- Add availability for ALL existing therapists
-- This will add Monday-Friday, 9 AM to 5 PM for each therapist

DO $$
DECLARE
    therapist_record RECORD;
BEGIN
    -- Loop through all therapists and add availability
    FOR therapist_record IN 
        SELECT t.id 
        FROM therapists t
        WHERE NOT EXISTS (
            SELECT 1 FROM therapist_availability ta 
            WHERE ta.therapist_id = t.id
        )
    LOOP
        -- Add Monday to Friday availability, 9 AM to 5 PM
        INSERT INTO therapist_availability (therapist_id, day_of_week, start_time, end_time)
        VALUES 
            (therapist_record.id, 'Monday', '09:00', '17:00'),
            (therapist_record.id, 'Tuesday', '09:00', '17:00'),
            (therapist_record.id, 'Wednesday', '09:00', '17:00'),
            (therapist_record.id, 'Thursday', '09:00', '17:00'),
            (therapist_record.id, 'Friday', '09:00', '17:00')
        ON CONFLICT (therapist_id, day_of_week) DO UPDATE SET
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time;
        
        RAISE NOTICE 'Added availability for therapist %', therapist_record.id;
    END LOOP;
    
    RAISE NOTICE 'Finished adding availability for all therapists';
END $$;

-- Verify the data was added
SELECT 
    'Final availability count' as info,
    COUNT(*) as count
FROM therapist_availability;

-- Show all availability records
SELECT 
    ta.therapist_id,
    p.first_name,
    p.last_name,
    ta.day_of_week,
    ta.start_time,
    ta.end_time
FROM therapist_availability ta
JOIN profiles p ON ta.therapist_id = p.id
ORDER BY p.first_name, ta.day_of_week;

-- Test the getFreeSlots function for a specific therapist and date
-- Replace 'therapist-id-here' with an actual therapist ID from above
/*
SELECT 
    'Test getFreeSlots for Monday' as info,
    ta.therapist_id,
    p.first_name,
    ta.day_of_week,
    ta.start_time,
    ta.end_time
FROM therapist_availability ta
JOIN profiles p ON ta.therapist_id = p.id
WHERE ta.day_of_week = 'Monday'
LIMIT 1;
*/ 