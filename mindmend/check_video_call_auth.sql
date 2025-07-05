-- Check Video Call Authorization
-- This script will help verify the authorization logic

-- 1. Show all appointments with their patient and therapist IDs
SELECT '=== ALL APPOINTMENTS ===' as info;
SELECT 
  id as appointment_id,
  patient_id,
  therapist_id,
  scheduled_at,
  type,
  status,
  created_at
FROM appointments 
ORDER BY created_at DESC;

-- 2. Show appointments with patient and therapist names
SELECT '=== APPOINTMENTS WITH NAMES ===' as info;
SELECT 
  a.id as appointment_id,
  a.patient_id,
  a.therapist_id,
  a.scheduled_at,
  a.type,
  a.status,
  p.first_name as patient_first_name,
  p.last_name as patient_last_name,
  p.email as patient_email,
  t.first_name as therapist_first_name,
  t.last_name as therapist_last_name,
  t.email as therapist_email
FROM appointments a
JOIN profiles p ON a.patient_id = p.id
JOIN profiles t ON a.therapist_id = t.id
ORDER BY a.created_at DESC;

-- 3. Test authorization logic for a specific appointment
-- Replace 'your-appointment-id' with an actual appointment ID from step 1
SELECT '=== AUTHORIZATION TEST ===' as info;
SELECT 
  'Appointment ID' as info,
  id as appointment_id,
  patient_id,
  therapist_id,
  CASE 
    WHEN patient_id = 'your-user-id-here' THEN 'User is PATIENT'
    WHEN therapist_id = 'your-user-id-here' THEN 'User is THERAPIST'
    ELSE 'User is NOT AUTHORIZED'
  END as authorization_status
FROM appointments 
WHERE id = 'your-appointment-id-here';

-- 4. Show all users for reference
SELECT '=== ALL USERS ===' as info;
SELECT 
  id as user_id,
  email,
  first_name,
  last_name,
  role
FROM profiles 
ORDER BY created_at DESC;

-- 5. Create a test appointment if none exist
-- This will create a test appointment for the first user and therapist
DO $$
DECLARE
    test_patient_id uuid;
    test_therapist_id uuid;
    test_appointment_id uuid;
BEGIN
    -- Get first user (patient)
    SELECT id INTO test_patient_id FROM profiles WHERE role = 'user' LIMIT 1;
    
    -- Get first therapist
    SELECT t.id INTO test_therapist_id FROM therapists t JOIN profiles p ON t.id = p.id LIMIT 1;
    
    IF test_patient_id IS NOT NULL AND test_therapist_id IS NOT NULL THEN
        -- Create test appointment
        INSERT INTO appointments (
            patient_id,
            therapist_id,
            scheduled_at,
            duration,
            type,
            notes,
            status
        ) VALUES (
            test_patient_id,
            test_therapist_id,
            NOW() + INTERVAL '30 minutes',
            60,
            'Video Call',
            'Test appointment for authorization debugging',
            'upcoming'
        ) RETURNING id INTO test_appointment_id;
        
        RAISE NOTICE 'Test appointment created with ID: %', test_appointment_id;
        RAISE NOTICE 'Patient ID: %, Therapist ID: %', test_patient_id, test_therapist_id;
    ELSE
        RAISE NOTICE 'No users or therapists found to create test appointment';
    END IF;
END $$;

-- 6. Show the test appointment created
SELECT '=== TEST APPOINTMENT CREATED ===' as info;
SELECT 
  id as appointment_id,
  patient_id,
  therapist_id,
  scheduled_at,
  type,
  status
FROM appointments 
WHERE notes LIKE '%Test appointment for authorization debugging%'
ORDER BY created_at DESC
LIMIT 1; 