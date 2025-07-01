-- Debug Therapist Query Issue
-- This will test the exact query used in the book session page

-- First, let's see what we have in each table
SELECT 
    'Profiles table count' as info,
    COUNT(*) as count
FROM profiles;

SELECT 
    'Therapists table count' as info,
    COUNT(*) as count
FROM therapists;

-- Show all profiles with role = 'therapist'
SELECT 
    'All therapist profiles' as info,
    id,
    first_name,
    last_name,
    email,
    role,
    specialization,
    license_number
FROM profiles 
WHERE role = 'therapist'
ORDER BY first_name;

-- Show all therapists
SELECT 
    'All therapists' as info,
    id,
    specialization,
    license_number
FROM therapists
ORDER BY specialization;

-- Test the EXACT query from the book session page
-- This is the query that's failing
SELECT 
    'Book session query test' as info,
    COUNT(*) as count
FROM therapists t
JOIN profiles p ON t.id = p.id
WHERE p.role = 'therapist';

-- Show the results of the book session query
SELECT 
    'Book session query results' as info,
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

-- Test without the inner join to see if that's the issue
SELECT 
    'Test without inner join' as info,
    COUNT(*) as count
FROM therapists t
LEFT JOIN profiles p ON t.id = p.id
WHERE p.role = 'therapist';

-- Check if there are any profiles without matching therapists
SELECT 
    'Profiles without therapists' as info,
    p.id,
    p.first_name,
    p.last_name,
    p.role
FROM profiles p
LEFT JOIN therapists t ON p.id = t.id
WHERE p.role = 'therapist' AND t.id IS NULL;

-- Check if there are any therapists without matching profiles
SELECT 
    'Therapists without profiles' as info,
    t.id,
    t.specialization
FROM therapists t
LEFT JOIN profiles p ON t.id = p.id
WHERE p.id IS NULL;

-- Test the query step by step
-- Step 1: Get all therapists
SELECT 
    'Step 1: All therapists' as info,
    COUNT(*) as count
FROM therapists;

-- Step 2: Get all therapist profiles
SELECT 
    'Step 2: All therapist profiles' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'therapist';

-- Step 3: Join them together
SELECT 
    'Step 3: Joined result' as info,
    COUNT(*) as count
FROM therapists t
INNER JOIN profiles p ON t.id = p.id
WHERE p.role = 'therapist';

-- Check RLS status
SELECT 
    'RLS status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('therapists', 'profiles');

-- Check if there are any policies that might be interfering
SELECT 
    'Active policies' as info,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('therapists', 'profiles'); 