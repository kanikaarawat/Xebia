-- Make User Admin
-- Run this script to make yourself an admin
-- Replace 'your-user-id-here' with your actual user ID

-- 1. Check current user
SELECT 
    'Current user' as info,
    auth.uid() as user_id;

-- 2. Check if user has a profile
SELECT 
    'Profile check' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
        THEN 'Profile exists' 
        ELSE 'No profile found' 
    END as status;

-- 3. Show current profile details
SELECT 
    'Current profile' as info,
    id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM profiles 
WHERE id = auth.uid();

-- 4. Make user admin (uncomment and replace with your user ID)
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = 'your-user-id-here';

-- 5. Alternative: Make current user admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- 6. Verify the change
SELECT 
    'Admin verification' as info,
    id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM profiles 
WHERE id = auth.uid();

-- 7. Show all admin users
SELECT 
    'All admin users' as info,
    COUNT(*) as admin_count
FROM profiles 
WHERE role = 'admin'; 