-- Manual Profile Creation
-- Run this script when you're logged in to create your profile

-- 1. Check if you're authenticated
SELECT 
    'Authentication status' as check_type,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED - Please log in first'
        ELSE '✅ AUTHENTICATED'
    END as status;

-- 2. If authenticated, check if profile exists
SELECT 
    'Profile check' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
        THEN '✅ Profile exists'
        ELSE '❌ Profile does not exist'
    END as status;

-- 3. Create profile if it doesn't exist (only if authenticated)
INSERT INTO profiles (id, email, role)
SELECT 
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    'user'
WHERE auth.uid() IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid());

-- 4. Verify profile was created
SELECT 
    'Profile verification' as check_type,
    p.id,
    p.email,
    p.role,
    p.created_at,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ Profile created successfully'
        ELSE '❌ Profile creation failed'
    END as status
FROM profiles p
WHERE p.id = auth.uid();

-- 5. Show all profiles (for debugging)
SELECT 
    'All profiles' as info,
    COUNT(*) as total_profiles
FROM profiles; 