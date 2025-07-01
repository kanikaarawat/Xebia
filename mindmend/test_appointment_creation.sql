-- Test Appointment Creation
-- This script will help verify if appointments can be created and retrieved properly

-- 1. First, let's see what users we have
SELECT '=== AVAILABLE USERS ===' as info;
SELECT id, email, role FROM profiles LIMIT 5;

-- 2. See what therapists we have
SELECT '=== AVAILABLE THERAPISTS ===' as info;
SELECT t.id, p.first_name, p.last_name, t.specialization 
FROM therapists t 
JOIN profiles p ON t.id = p.id 
LIMIT 5;

-- 3. Create a test appointment (replace the IDs with actual ones from your database)
-- First, get a user ID and therapist ID
SELECT '=== CREATING TEST APPOINTMENT ===' as info;

-- Get a user (patient)
WITH patient AS (
  SELECT id FROM profiles WHERE role = 'user' LIMIT 1
),
therapist AS (
  SELECT t.id FROM therapists t JOIN profiles p ON t.id = p.id LIMIT 1
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
  patient.id,
  therapist.id,
  NOW() + INTERVAL '2 days', -- 2 days from now
  60, -- 1 hour session
  'Video Call',
  'Test appointment for debugging',
  'upcoming'
FROM patient, therapist
RETURNING *;

-- 4. Verify the appointment was created
SELECT '=== VERIFYING TEST APPOINTMENT ===' as info;
SELECT 
  a.id,
  a.patient_id,
  a.therapist_id,
  a.scheduled_at,
  a.duration,
  a.type,
  a.status,
  p.first_name as patient_name,
  t.first_name as therapist_name
FROM appointments a
JOIN profiles p ON a.patient_id = p.id
JOIN therapists t ON a.therapist_id = t.id
JOIN profiles tp ON t.id = tp.id
ORDER BY a.created_at DESC
LIMIT 3;

-- 5. Test the exact query that the app uses
SELECT '=== TESTING APP QUERY ===' as info;
-- Replace 'your-user-id-here' with an actual user ID from step 1
SELECT 
  a.id,
  a.patient_id,
  a.therapist_id,
  a.scheduled_at,
  a.duration,
  a.type,
  a.notes,
  a.status,
  t.first_name as therapist_first_name,
  t.last_name as therapist_last_name,
  t.specialization,
  t.avatar_url
FROM appointments a
LEFT JOIN (
  SELECT 
    t.id,
    p.first_name,
    p.last_name,
    t.specialization,
    p.avatar_url
  FROM therapists t
  JOIN profiles p ON t.id = p.id
) t ON a.therapist_id = t.id
WHERE a.patient_id = (SELECT id FROM profiles WHERE role = 'user' LIMIT 1)
ORDER BY a.scheduled_at ASC; 