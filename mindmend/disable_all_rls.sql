-- Disable RLS on both tables to ensure all data is visible
-- This is a temporary fix to get the booking system working

-- Disable RLS on therapists table
ALTER TABLE therapists DISABLE ROW LEVEL SECURITY;

-- Disable RLS on profiles table  
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    'RLS status after disabling' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('therapists', 'profiles');

-- Test the book session query now
SELECT 
    'Book session query after RLS disabled' as info,
    COUNT(*) as count
FROM therapists t
JOIN profiles p ON t.id = p.id
WHERE p.role = 'therapist';

-- Show all therapists that should now be visible
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
WHERE p.role = 'therapist'
ORDER BY p.first_name; 