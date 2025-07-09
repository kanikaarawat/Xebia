-- Admin Service Role Setup (Alternative Approach)
-- This approach uses service role for admin operations, which is more secure

-- 1. Check current RLS status
SELECT 
    'Current RLS status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'therapists', 'appointments', 'therapist_availability');

-- 2. Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- 4. Create admin policies that allow full access for admins
-- Profiles table
CREATE POLICY "Admins have full access to profiles" ON profiles
    FOR ALL USING (is_admin());

-- Therapists table  
CREATE POLICY "Admins have full access to therapists" ON therapists
    FOR ALL USING (is_admin());

-- Appointments table
CREATE POLICY "Admins have full access to appointments" ON appointments
    FOR ALL USING (is_admin());

-- Therapist availability table
CREATE POLICY "Admins have full access to therapist_availability" ON therapist_availability
    FOR ALL USING (is_admin());

-- 5. Create admin policies for notifications table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        EXECUTE 'CREATE POLICY "Admins have full access to notifications" ON notifications
            FOR ALL USING (is_admin())';
    END IF;
END $$;

-- 6. Create admin policies for therapist_unavailability table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'therapist_unavailability') THEN
        EXECUTE 'CREATE POLICY "Admins have full access to therapist_unavailability" ON therapist_unavailability
            FOR ALL USING (is_admin())';
    END IF;
END $$;

-- 7. Test the admin function
SELECT 
    'Admin function test' as info,
    is_admin() as is_admin_user;

-- 8. Show all policies after creation
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

-- 9. Make yourself an admin (replace with your user ID)
-- Uncomment and modify the following lines to make yourself an admin
/*
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
*/

-- 10. Verify admin access
SELECT 
    'Admin access verification' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'therapist' THEN 1 END) as therapist_count,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count
FROM profiles; 