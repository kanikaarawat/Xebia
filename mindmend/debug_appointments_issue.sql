-- Debug Appointments Issue
-- This script will help identify why appointments might not be showing

-- 1. Check if appointments table exists and has data
SELECT '=== APPOINTMENTS TABLE CHECK ===' as info;
SELECT COUNT(*) as total_appointments FROM appointments;
SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5;

-- 2. Check appointments table structure
SELECT '=== APPOINTMENTS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- 3. Check if there are any appointments for specific users
SELECT '=== APPOINTMENTS BY USER ===' as info;
SELECT 
  patient_id,
  COUNT(*) as appointment_count,
  MIN(scheduled_at) as earliest_appointment,
  MAX(scheduled_at) as latest_appointment
FROM appointments 
GROUP BY patient_id;

-- 4. Check therapist data
SELECT '=== THERAPIST DATA ===' as info;
SELECT COUNT(*) as total_therapists FROM therapists;
SELECT * FROM therapists LIMIT 5;

-- 5. Check profiles table
SELECT '=== PROFILES TABLE ===' as info;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT role, COUNT(*) as count FROM profiles GROUP BY role;

-- 6. Check if appointments have valid therapist references
SELECT '=== APPOINTMENT-THERAPIST RELATIONSHIP ===' as info;
SELECT 
  a.id as appointment_id,
  a.therapist_id,
  a.scheduled_at,
  a.status,
  CASE WHEN t.id IS NOT NULL THEN 'Valid' ELSE 'Invalid' END as therapist_status
FROM appointments a
LEFT JOIN therapists t ON a.therapist_id = t.id
ORDER BY a.created_at DESC
LIMIT 10;

-- 7. Check RLS policies on appointments table
SELECT '=== APPOINTMENTS RLS POLICIES ===' as info;
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
WHERE tablename = 'appointments';

-- 8. Check if there are any constraint violations
SELECT '=== CONSTRAINT CHECK ===' as info;
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'appointments'::regclass;

-- 9. Check recent activity
SELECT '=== RECENT ACTIVITY ===' as info;
SELECT 
  'appointments' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM appointments
WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
  'therapists' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM therapists
WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM profiles
WHERE created_at > NOW() - INTERVAL '7 days';

-- 10. Check for any error logs or issues
SELECT '=== POTENTIAL ISSUES ===' as info;
SELECT 
  'Appointments without valid therapist' as issue,
  COUNT(*) as count
FROM appointments a
LEFT JOIN therapists t ON a.therapist_id = t.id
WHERE t.id IS NULL
UNION ALL
SELECT 
  'Appointments with null patient_id' as issue,
  COUNT(*) as count
FROM appointments
WHERE patient_id IS NULL
UNION ALL
SELECT 
  'Appointments with null scheduled_at' as issue,
  COUNT(*) as count
FROM appointments
WHERE scheduled_at IS NULL; 