-- Test Appointments Table
-- This script will check if the appointments table exists and test appointment creation

-- Check if appointments table exists
SELECT 
    'Appointments table exists' as info,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') as exists;

-- Show appointments table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- Check RLS status
SELECT 
    'Appointments RLS status' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'appointments';

-- Show existing policies
SELECT 
    'Appointments policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'appointments';

-- Count existing appointments
SELECT 
    'Current appointments count' as info,
    COUNT(*) as count
FROM appointments;

-- Test appointment creation (replace with actual IDs)
-- First, get a sample therapist and patient
SELECT 
    'Sample therapist' as info,
    t.id as therapist_id,
    p.first_name,
    p.last_name
FROM therapists t
JOIN profiles p ON t.id = p.id
LIMIT 1;

-- Test appointment insertion (uncomment and modify as needed)
/*
-- Replace 'therapist-id-here' and 'patient-id-here' with actual IDs
INSERT INTO appointments (
    patient_id,
    therapist_id,
    scheduled_at,
    duration,
    type,
    notes,
    status
) VALUES (
    'patient-id-here',
    'therapist-id-here',
    '2025-01-06T09:00:00',
    30,
    'Video Call',
    'Test appointment',
    'upcoming'
);

-- Verify the appointment was created
SELECT 
    'Test appointment created' as info,
    id,
    patient_id,
    therapist_id,
    scheduled_at,
    type,
    status
FROM appointments
WHERE notes = 'Test appointment';
*/

-- Show all appointments (if any exist)
SELECT 
    'All appointments' as info,
    id,
    patient_id,
    therapist_id,
    scheduled_at,
    type,
    status,
    created_at
FROM appointments
ORDER BY created_at DESC; 