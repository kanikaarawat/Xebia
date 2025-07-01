-- Fix Therapist RLS Policies
-- This script will ensure all therapists are visible to all users

-- First, let's check current RLS status and policies
SELECT 
    'RLS enabled' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'therapists';

-- Show existing policies
SELECT 
    'Current policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'therapists';

-- Disable RLS temporarily to see all therapists
ALTER TABLE therapists DISABLE ROW LEVEL SECURITY;

-- Or, if you want to keep RLS but allow all users to see all therapists,
-- drop existing policies and create a new one:

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Therapists can view own data" ON therapists;
DROP POLICY IF EXISTS "Therapists can insert own data" ON therapists;
DROP POLICY IF EXISTS "Therapists can update own data" ON therapists;
DROP POLICY IF EXISTS "Therapists can delete own data" ON therapists;

-- Re-enable RLS
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows ALL users to view ALL therapists
-- This is needed for the booking system to work
CREATE POLICY "All users can view all therapists" ON therapists
    FOR SELECT USING (true);

-- Create a policy that allows therapists to manage their own data
CREATE POLICY "Therapists can manage own data" ON therapists
    FOR ALL USING (auth.uid() = id);

-- Test the query that the book session page uses
-- This should now return all therapists
SELECT 
    'Test query result' as info,
    COUNT(*) as therapist_count
FROM therapists t
JOIN profiles p ON t.id = p.id
WHERE p.role = 'therapist';

-- Show all therapists that should be visible
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

-- Verify the exact query from the book session page works
SELECT 
    'Book session query test' as info,
    COUNT(*) as count
FROM therapists t
JOIN profiles p ON t.id = p.id
WHERE p.role = 'therapist'; 