-- Restricted Admin Setup
-- This creates a single admin with read/write permissions only (no delete)
-- Run this in your Supabase SQL Editor

-- 1. First, remove all existing admin users except one
-- Replace 'your-admin-user-id' with the actual admin user ID
UPDATE profiles 
SET role = 'user' 
WHERE role = 'admin' 
AND id != 'your-admin-user-id';

-- 2. Create a function to check if user is the single admin
CREATE OR REPLACE FUNCTION is_single_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) AND (
        SELECT COUNT(*) FROM profiles WHERE role = 'admin'
    ) = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_single_admin() TO authenticated;

-- 4. Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all therapists" ON therapists;
DROP POLICY IF EXISTS "Admins can update all therapists" ON therapists;
DROP POLICY IF EXISTS "Admins can delete therapists" ON therapists;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can update all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all availability" ON therapist_availability;
DROP POLICY IF EXISTS "Admins can update all availability" ON therapist_availability;
DROP POLICY IF EXISTS "Admins can delete availability" ON therapist_availability;

-- 5. Create restricted admin policies (read/write only, no delete)
-- Profiles table
CREATE POLICY "Single admin can view all profiles" ON profiles
    FOR SELECT USING (is_single_admin());

CREATE POLICY "Single admin can update all profiles" ON profiles
    FOR UPDATE USING (is_single_admin());

-- Therapists table
CREATE POLICY "Single admin can view all therapists" ON therapists
    FOR SELECT USING (is_single_admin());

CREATE POLICY "Single admin can update all therapists" ON therapists
    FOR UPDATE USING (is_single_admin());

-- Appointments table
CREATE POLICY "Single admin can view all appointments" ON appointments
    FOR SELECT USING (is_single_admin());

CREATE POLICY "Single admin can update all appointments" ON appointments
    FOR UPDATE USING (is_single_admin());

-- Therapist availability table
CREATE POLICY "Single admin can view all availability" ON therapist_availability
    FOR SELECT USING (is_single_admin());

CREATE POLICY "Single admin can update all availability" ON therapist_availability
    FOR UPDATE USING (is_single_admin());

-- 6. Create restricted admin policies for notifications table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications';
        EXECUTE 'DROP POLICY IF EXISTS "Admins can update all notifications" ON notifications';
        EXECUTE 'DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications';
        
        EXECUTE 'CREATE POLICY "Single admin can view all notifications" ON notifications
            FOR SELECT USING (is_single_admin())';
        
        EXECUTE 'CREATE POLICY "Single admin can update all notifications" ON notifications
            FOR UPDATE USING (is_single_admin())';
    END IF;
END $$;

-- 7. Create restricted admin policies for therapist_unavailability table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'therapist_unavailability') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view all unavailability" ON therapist_unavailability';
        EXECUTE 'DROP POLICY IF EXISTS "Admins can update all unavailability" ON therapist_unavailability';
        EXECUTE 'DROP POLICY IF EXISTS "Admins can delete unavailability" ON therapist_unavailability';
        
        EXECUTE 'CREATE POLICY "Single admin can view all unavailability" ON therapist_unavailability
            FOR SELECT USING (is_single_admin())';
        
        EXECUTE 'CREATE POLICY "Single admin can update all unavailability" ON therapist_unavailability
            FOR UPDATE USING (is_single_admin())';
    END IF;
END $$;

-- 8. Test the single admin function
SELECT 
    'Single admin function test' as info,
    is_single_admin() as is_single_admin_user;

-- 9. Show current admin users
SELECT 
    'Current admin users' as info,
    COUNT(*) as admin_count
FROM profiles 
WHERE role = 'admin';

-- 10. Show all policies after creation
SELECT 
    'All policies after restricted admin setup' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'therapists', 'appointments', 'therapist_availability', 'notifications', 'therapist_unavailability')
AND policyname LIKE '%Single admin%'
ORDER BY tablename, policyname;

-- 11. Create a function to ensure only one admin exists
CREATE OR REPLACE FUNCTION ensure_single_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is an admin user being created/updated
    IF NEW.role = 'admin' THEN
        -- Check if there's already an admin
        IF EXISTS (
            SELECT 1 FROM profiles 
            WHERE role = 'admin' AND id != NEW.id
        ) THEN
            RAISE EXCEPTION 'Only one admin user is allowed';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to enforce single admin rule
DROP TRIGGER IF EXISTS enforce_single_admin ON profiles;
CREATE TRIGGER enforce_single_admin
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_admin();

-- 13. Verify the setup
SELECT 
    'Restricted admin setup complete' as info,
    (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admin_count,
    (SELECT COUNT(*) FROM profiles WHERE role = 'therapist') as therapist_count,
    (SELECT COUNT(*) FROM profiles WHERE role = 'user') as user_count; 