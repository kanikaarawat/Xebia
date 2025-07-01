-- Fix Infinite Recursion in RLS Policies
-- This script fixes the "infinite recursion detected in policy" error

-- 1. First, disable RLS temporarily to break the recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE therapists DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

DROP POLICY IF EXISTS "Therapists can view own data" ON therapists;
DROP POLICY IF EXISTS "Therapists can insert own data" ON therapists;
DROP POLICY IF EXISTS "Therapists can update own data" ON therapists;
DROP POLICY IF EXISTS "Therapists can delete own data" ON therapists;

-- 3. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

-- 4. Create simplified policies that avoid recursion
-- For profiles table - use simple auth.uid() checks
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 5. For therapists table - use simple auth.uid() checks
CREATE POLICY "therapists_select_policy" ON therapists
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "therapists_insert_policy" ON therapists
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "therapists_update_policy" ON therapists
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "therapists_delete_policy" ON therapists
    FOR DELETE USING (auth.uid() = id);

-- 6. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON therapists TO authenticated;

-- 7. Test the policies work
SELECT 
    'Testing profiles table access' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            LIMIT 1
        ) THEN 'SUCCESS'
        ELSE 'FAILED'
    END as result;

-- 8. Create a profile for current user if it doesn't exist
INSERT INTO profiles (id, email, role)
SELECT 
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    'user'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid());

-- 9. Verify the fix
SELECT 
    'Profile verification' as check_type,
    p.id,
    p.email,
    p.role,
    p.created_at
FROM profiles p
WHERE p.id = auth.uid(); 