-- Test Database Connection and Tables
-- Run this to check if everything is set up correctly

-- 1. Check if we can connect to the database
SELECT 
    'Database connection' as test,
    'SUCCESS' as status,
    now() as timestamp;

-- 2. Check if profiles table exists
SELECT 
    'Profiles table exists' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
        ) THEN 'YES'
        ELSE 'NO'
    END as status;

-- 3. Check if therapists table exists
SELECT 
    'Therapists table exists' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'therapists'
        ) THEN 'YES'
        ELSE 'NO'
    END as status;

-- 4. Check if therapist_availability table exists
SELECT 
    'Therapist_availability table exists' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'therapist_availability'
        ) THEN 'YES'
        ELSE 'NO'
    END as status;

-- 5. Check if appointments table exists
SELECT 
    'Appointments table exists' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'appointments'
        ) THEN 'YES'
        ELSE 'NO'
    END as status;

-- 6. Check RLS policies
SELECT 
    'RLS policies' as test,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('profiles', 'therapists', 'therapist_availability', 'appointments');

-- 7. Check if we can query profiles table
SELECT 
    'Can query profiles' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN 'YES'
        ELSE 'NO'
    END as status;

-- 8. Check authentication status
SELECT 
    'Authentication status' as test,
    CASE 
        WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED'
        ELSE 'AUTHENTICATED'
    END as status,
    auth.uid() as user_id;

-- 9. If authenticated, check if profile exists
SELECT 
    'Profile exists for current user' as test,
    CASE 
        WHEN auth.uid() IS NULL THEN 'N/A - Not authenticated'
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) THEN 'YES'
        ELSE 'NO'
    END as status; 