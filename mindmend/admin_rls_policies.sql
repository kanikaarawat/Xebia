-- Admin RLS Policies
-- Run this in your Supabase SQL Editor to enable admin access to all data

-- 1. First, let's check current RLS status
SELECT 
    'Current RLS status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'therapists', 'appointments', 'therapist_availability', 'notifications');

-- 2. Show existing policies
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
WHERE tablename IN ('profiles', 'therapists', 'appointments', 'therapist_availability', 'notifications')
ORDER BY tablename, policyname;

-- 3. Create admin policies for profiles table
-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" ON profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Create admin policies for therapists table
-- Allow admins to view all therapists
CREATE POLICY "Admins can view all therapists" ON therapists
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to update all therapists
CREATE POLICY "Admins can update all therapists" ON therapists
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to delete therapists
CREATE POLICY "Admins can delete therapists" ON therapists
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Create admin policies for appointments table
-- Allow admins to view all appointments
CREATE POLICY "Admins can view all appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to update all appointments
CREATE POLICY "Admins can update all appointments" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to delete appointments
CREATE POLICY "Admins can delete appointments" ON appointments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Create admin policies for therapist_availability table
-- Allow admins to view all availability
CREATE POLICY "Admins can view all availability" ON therapist_availability
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to update all availability
CREATE POLICY "Admins can update all availability" ON therapist_availability
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to delete availability
CREATE POLICY "Admins can delete availability" ON therapist_availability
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Create admin policies for notifications table (if it exists)
-- Check if notifications table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        -- Allow admins to view all notifications
        EXECUTE 'CREATE POLICY "Admins can view all notifications" ON notifications
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = ''admin''
                )
            )';
        
        -- Allow admins to update all notifications
        EXECUTE 'CREATE POLICY "Admins can update all notifications" ON notifications
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = ''admin''
                )
            )';
        
        -- Allow admins to delete notifications
        EXECUTE 'CREATE POLICY "Admins can delete notifications" ON notifications
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = ''admin''
                )
            )';
    END IF;
END $$;

-- 8. Create admin policies for therapist_unavailability table (if it exists)
-- Check if therapist_unavailability table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'therapist_unavailability') THEN
        -- Allow admins to view all unavailability
        EXECUTE 'CREATE POLICY "Admins can view all unavailability" ON therapist_unavailability
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = ''admin''
                )
            )';
        
        -- Allow admins to update all unavailability
        EXECUTE 'CREATE POLICY "Admins can update all unavailability" ON therapist_unavailability
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = ''admin''
                )
            )';
        
        -- Allow admins to delete unavailability
        EXECUTE 'CREATE POLICY "Admins can delete unavailability" ON therapist_unavailability
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = ''admin''
                )
            )';
    END IF;
END $$;

-- 9. Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- 11. Test the admin policies
SELECT 
    'Admin policy test' as info,
    CASE 
        WHEN is_admin() THEN 'User is admin'
        ELSE 'User is not admin'
    END as admin_status;

-- 12. Show all policies after creation
SELECT 
    'All policies after admin setup' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'therapists', 'appointments', 'therapist_availability', 'notifications', 'therapist_unavailability')
ORDER BY tablename, policyname;

-- 13. Create an admin user (replace with your user ID)
-- Uncomment and modify the following lines to make yourself an admin
/*
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
*/

-- 14. Verify admin access
SELECT 
    'Admin access verification' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'therapist' THEN 1 END) as therapist_count,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count
FROM profiles; 