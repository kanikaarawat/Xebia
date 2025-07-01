-- Seed Therapist Availability Data
-- Run this in your Supabase SQL editor to add test availability

-- First, let's check if we have any therapists
SELECT 
    'Current therapists' as info,
    COUNT(*) as count
FROM therapists;

-- Show existing therapists
SELECT 
    t.id,
    p.first_name,
    p.last_name,
    p.email
FROM therapists t
JOIN profiles p ON t.id = p.id;

-- Add availability for existing therapists (replace 'therapist-id-here' with actual IDs)
-- This adds availability for Monday through Friday, 9 AM to 5 PM

-- Example: Add availability for a therapist (uncomment and modify as needed)
/*
INSERT INTO therapist_availability (therapist_id, day_of_week, start_time, end_time)
VALUES 
    ('therapist-id-here', 'Monday', '09:00', '17:00'),
    ('therapist-id-here', 'Tuesday', '09:00', '17:00'),
    ('therapist-id-here', 'Wednesday', '09:00', '17:00'),
    ('therapist-id-here', 'Thursday', '09:00', '17:00'),
    ('therapist-id-here', 'Friday', '09:00', '17:00')
ON CONFLICT (therapist_id, day_of_week) DO UPDATE SET
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time;
*/

-- Function to add availability for all therapists
CREATE OR REPLACE FUNCTION seed_therapist_availability()
RETURNS void AS $$
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
        ON CONFLICT (therapist_id, day_of_week) DO NOTHING;
        
        RAISE NOTICE 'Added availability for therapist %', therapist_record.id;
    END LOOP;
    
    RAISE NOTICE 'Finished seeding therapist availability';
END;
$$ LANGUAGE plpgsql;

-- Execute the seed function
SELECT seed_therapist_availability();

-- Verify the data was added
SELECT 
    'Availability count' as info,
    COUNT(*) as count
FROM therapist_availability;

-- Show all availability
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

-- Test the availability for a specific date (replace with actual therapist ID and date)
/*
SELECT 
    'Test availability for 2025-01-06 (Monday)' as test_info,
    ta.day_of_week,
    ta.start_time,
    ta.end_time
FROM therapist_availability ta
WHERE ta.therapist_id = 'your-therapist-id-here'
AND ta.day_of_week = 'Monday';
*/ 