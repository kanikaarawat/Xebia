-- Test Video Call Authorization
-- This script will help debug the authorization issue

-- 1. Check current users
SELECT '=== CURRENT USERS ===' as info;
SELECT id, email, role, first_name, last_name FROM profiles LIMIT 10;

-- 2. Check current appointments
SELECT '=== CURRENT APPOINTMENTS ===' as info;
SELECT 
  id,
  patient_id,
  therapist_id,
  scheduled_at,
  type,
  status,
  created_at
FROM appointments 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Create a test video call appointment
-- First, get a user and therapist
WITH test_data AS (
  SELECT 
    (SELECT id FROM profiles WHERE role = 'user' LIMIT 1) as patient_id,
    (SELECT t.id FROM therapists t JOIN profiles p ON t.id = p.id LIMIT 1) as therapist_id
)
INSERT INTO appointments (
  patient_id,
  therapist_id,
  scheduled_at,
  duration,
  type,
  notes,
  status
)
SELECT 
  patient_id,
  therapist_id,
  NOW() + INTERVAL '1 hour', -- 1 hour from now
  60, -- 60 minutes
  'Video Call',
  'Test video call appointment for debugging authorization',
  'upcoming'
FROM test_data
RETURNING *;

-- 4. Verify the test appointment was created
SELECT '=== TEST APPOINTMENT CREATED ===' as info;
SELECT 
  a.id,
  a.patient_id,
  a.therapist_id,
  a.scheduled_at,
  a.type,
  a.status,
  p.first_name as patient_name,
  p.email as patient_email,
  t.first_name as therapist_name,
  t.email as therapist_email
FROM appointments a
JOIN profiles p ON a.patient_id = p.id
JOIN profiles t ON a.therapist_id = t.id
WHERE a.notes LIKE '%Test video call appointment%'
ORDER BY a.created_at DESC
LIMIT 5;

-- 5. Show the exact data that the video call page will query
SELECT '=== VIDEO CALL TEST DATA ===' as info;
SELECT 
  'Appointment ID for testing' as info,
  id as appointment_id,
  patient_id,
  therapist_id,
  scheduled_at,
  type,
  status
FROM appointments 
WHERE notes LIKE '%Test video call appointment%'
ORDER BY created_at DESC
LIMIT 1; 