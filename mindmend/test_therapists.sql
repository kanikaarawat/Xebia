-- Test and Setup Therapists
-- Run this in your Supabase SQL editor

-- 1. Check if therapists table exists and has data
SELECT 
    'therapists table exists' as check_type,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'therapists') as result;

-- 2. Count existing therapists
SELECT 
    'therapist count' as info,
    COUNT(*) as count
FROM therapists;

-- 3. Show all existing therapists with their profile info
SELECT 
    t.id,
    p.first_name,
    p.last_name,
    p.email,
    t.specialization,
    t.license_number,
    p.role
FROM therapists t
JOIN profiles p ON t.id = p.id
ORDER BY p.first_name;

-- 4. Check if you have any profiles with role = 'therapist'
SELECT 
    'profiles with therapist role' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'therapist';

-- 5. Show profiles that should be therapists but aren't in therapists table
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.role,
    'Missing therapist data' as status
FROM profiles p
WHERE p.role = 'therapist' 
AND NOT EXISTS (SELECT 1 FROM therapists t WHERE t.id = p.id);

-- 6. Add test therapist data (uncomment and modify as needed)
-- Replace 'your-user-id' with an actual user ID from your profiles table
/*
-- First, create a test profile
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES (
    'your-user-id-here',
    'test.therapist@example.com',
    'Dr. Sarah',
    'Johnson',
    'therapist'
)
ON CONFLICT (id) DO UPDATE SET 
    role = 'therapist',
    first_name = 'Dr. Sarah',
    last_name = 'Johnson';

-- Then, add therapist data
INSERT INTO therapists (id, specialization, license_number)
VALUES (
    'your-user-id-here',
    'Cognitive Behavioral Therapy',
    'CBT123456'
)
ON CONFLICT (id) DO NOTHING;
*/

-- 7. Test the exact query that the book session page uses
SELECT 
    t.id,
    t.specialization,
    t.license_number,
    p.first_name,
    p.last_name,
    p.avatar_url
FROM therapists t
JOIN profiles p ON t.id = p.id
WHERE p.role = 'therapist'
ORDER BY p.first_name; 