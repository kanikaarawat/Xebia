-- Fix appointments table access issues
-- Run this in Supabase SQL Editor

-- 1. Check current RLS status
SELECT 
    'Current RLS status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'appointments';

-- 2. Disable RLS temporarily to test access
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- 3. Create a simple policy to allow all authenticated users to read appointments
DROP POLICY IF EXISTS "Allow authenticated users to read appointments" ON appointments;
CREATE POLICY "Allow authenticated users to read appointments" ON appointments
    FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Create policy to allow users to read their own appointments
DROP POLICY IF EXISTS "Allow users to read own appointments" ON appointments;
CREATE POLICY "Allow users to read own appointments" ON appointments
    FOR SELECT USING (auth.uid() = patient_id);

-- 5. Create policy to allow users to insert their own appointments
DROP POLICY IF EXISTS "Allow users to insert own appointments" ON appointments;
CREATE POLICY "Allow users to insert own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- 6. Re-enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 7. Test the query
SELECT 
    'Test query after fix' as info,
    COUNT(*) as appointment_count
FROM appointments;

-- 8. Show current policies
SELECT 
    'Current policies' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'appointments'; 