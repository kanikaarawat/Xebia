-- Test script to check unavailability table insertion
-- Run this in Supabase SQL Editor

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'therapist_unavailability'
ORDER BY ordinal_position;

-- Try a simple insert
INSERT INTO therapist_unavailability (
    therapist_id,
    start_time,
    end_time,
    reason
) VALUES (
    (SELECT id FROM therapists LIMIT 1),
    '2025-01-15T10:00:00+00:00',
    '2025-01-15T11:00:00+00:00',
    'Test session'
);

-- Check if it was inserted
SELECT * FROM therapist_unavailability WHERE reason = 'Test session';

-- Clean up
DELETE FROM therapist_unavailability WHERE reason = 'Test session'; 