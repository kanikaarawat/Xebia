-- Quick Setup for Time Slots
-- Run this in your Supabase SQL Editor to set up therapist availability

-- Step 1: Check current therapists
SELECT 
    'Current therapists' as info,
    COUNT(*) as count
FROM therapists;

-- Step 2: Show existing therapists with their IDs
SELECT 
    t.id as therapist_id,
    p.first_name,
    p.last_name,
    p.email
FROM therapists t
JOIN profiles p ON t.id = p.id
ORDER BY p.first_name;

-- Step 3: Add availability for all therapists (Monday-Friday, 9 AM - 5 PM)
INSERT INTO therapist_availability (therapist_id, day_of_week, start_time, end_time)
SELECT 
    t.id,
    day.day_of_week,
    '09:00' as start_time,
    '17:00' as end_time
FROM therapists t
CROSS JOIN (
    VALUES ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday')
) AS day(day_of_week)
WHERE NOT EXISTS (
    SELECT 1 FROM therapist_availability ta 
    WHERE ta.therapist_id = t.id AND ta.day_of_week = day.day_of_week
);

-- Step 4: Verify the setup
SELECT 
    'Availability added' as info,
    COUNT(*) as count
FROM therapist_availability;

-- Step 5: Show all availability
SELECT 
    p.first_name,
    p.last_name,
    ta.day_of_week,
    ta.start_time,
    ta.end_time
FROM therapist_availability ta
JOIN profiles p ON ta.therapist_id = p.id
ORDER BY p.first_name, ta.day_of_week;

-- Step 6: Test time slot generation for next Monday
SELECT 
    'Test slots for next Monday' as test_info,
    ta.day_of_week,
    ta.start_time,
    ta.end_time,
    'Will generate 30-min slots from ' || ta.start_time || ' to ' || ta.end_time as slot_info
FROM therapist_availability ta
JOIN profiles p ON ta.therapist_id = p.id
WHERE ta.day_of_week = 'Monday'
ORDER BY p.first_name; 