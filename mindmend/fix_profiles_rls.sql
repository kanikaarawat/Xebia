-- Fix Profiles RLS Policies for Therapist Visibility
-- This ensures the profiles table allows viewing therapist profiles

-- Check current RLS status
SELECT 
    'Profiles RLS status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Show existing policies
SELECT 
    'Current profiles policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Create a policy that allows viewing therapist profiles
-- This is needed for the book session page to work
CREATE POLICY "Users can view therapist profiles" ON profiles
    FOR SELECT USING (role = 'therapist');

-- Alternative: Create a broader policy for viewing profiles
-- CREATE POLICY "Users can view all profiles" ON profiles
--     FOR SELECT USING (true);

-- Test the profiles query
SELECT 
    'Profiles query test' as info,
    COUNT(*) as therapist_profiles_count
FROM profiles 
WHERE role = 'therapist';

-- Test the combined query (therapists + profiles)
SELECT 
    'Combined query test' as info,
    COUNT(*) as total_therapists
FROM therapists t
JOIN profiles p ON t.id = p.id
WHERE p.role = 'therapist';

-- Show all therapist profiles
SELECT 
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