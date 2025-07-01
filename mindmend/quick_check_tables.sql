-- Quick check to see if basic tables exist and have data
-- Run this in Supabase SQL Editor

-- 1. Check if appointments table exists and has data
SELECT 
    'Appointments table' as info,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'appointments') as table_exists,
    (SELECT COUNT(*) FROM appointments) as appointment_count;

-- 2. Check if therapists table exists and has data
SELECT 
    'Therapists table' as info,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'therapists') as table_exists,
    (SELECT COUNT(*) FROM therapists) as therapist_count;

-- 3. Show sample appointments
SELECT 
    'Sample appointments' as info,
    id,
    patient_id,
    therapist_id,
    scheduled_at,
    status,
    type
FROM appointments
LIMIT 3;

-- 4. Show sample therapists
SELECT 
    'Sample therapists' as info,
    id,
    first_name,
    last_name,
    specialization
FROM therapists
LIMIT 3;

-- 5. Check if there are any appointments for a specific user
-- (Replace 'your-user-id' with an actual user ID from your profiles table)
SELECT 
    'Appointments for user' as info,
    COUNT(*) as user_appointment_count
FROM appointments a
WHERE a.patient_id IN (SELECT id FROM profiles LIMIT 1);

-- 6. Test basic queries without relationships
SELECT 'Basic appointments query works' as test_result
WHERE EXISTS (SELECT 1 FROM appointments LIMIT 1);

SELECT 'Basic therapists query works' as test_result
WHERE EXISTS (SELECT 1 FROM therapists LIMIT 1); 