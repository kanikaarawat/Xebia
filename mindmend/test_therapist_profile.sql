-- Test Script for Therapist Profile System
-- Run this after setting up your database to verify everything works

-- 1. Check if all tables exist
SELECT 
    'profiles' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') as exists
UNION ALL
SELECT 
    'therapists' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'therapists') as exists
UNION ALL
SELECT 
    'therapist_availability' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'therapist_availability') as exists
UNION ALL
SELECT 
    'appointments' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') as exists;

-- 2. Check current user (replace 'your-user-id' with your actual user ID)
-- You can find your user ID in the browser console or from auth.users table
SELECT 
    'Current authenticated user' as info,
    auth.uid() as user_id;

-- 3. Check if your profile exists
SELECT 
    'Profile exists' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
        THEN 'YES' 
        ELSE 'NO' 
    END as result;

-- 4. Check your profile details (if it exists)
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM profiles 
WHERE id = auth.uid();

-- 5. Check if you have therapist data (if role is therapist)
SELECT 
    'Therapist data exists' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM therapists WHERE id = auth.uid()) 
        THEN 'YES' 
        ELSE 'NO' 
    END as result;

-- 6. Check your therapist details (if they exist)
SELECT 
    id,
    specialization,
    license_number,
    created_at
FROM therapists 
WHERE id = auth.uid();

-- 7. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'therapists', 'therapist_availability', 'appointments')
ORDER BY tablename, policyname;

-- 8. Test data insertion (uncomment and modify as needed)
-- This will create a test therapist profile if you don't have one
/*
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES (
    auth.uid(),
    'test@example.com',
    'Test',
    'Therapist',
    'therapist'
)
ON CONFLICT (id) DO UPDATE SET 
    role = 'therapist',
    first_name = COALESCE(profiles.first_name, 'Test'),
    last_name = COALESCE(profiles.last_name, 'Therapist');

INSERT INTO therapists (id, specialization, license_number)
VALUES (
    auth.uid(),
    'General Therapy',
    'TEST123'
)
ON CONFLICT (id) DO NOTHING;
*/

-- 9. Final verification query
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    t.specialization,
    t.license_number,
    CASE 
        WHEN p.role = 'therapist' AND t.id IS NOT NULL 
        THEN '✅ Complete therapist profile'
        WHEN p.role = 'therapist' AND t.id IS NULL 
        THEN '⚠️ Missing therapist data'
        WHEN p.role = 'user' 
        THEN '✅ User profile'
        ELSE '❌ Incomplete profile'
    END as status
FROM profiles p
LEFT JOIN therapists t ON p.id = t.id
WHERE p.id = auth.uid(); 