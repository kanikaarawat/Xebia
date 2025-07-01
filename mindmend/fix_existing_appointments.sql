-- Fix Existing Appointments
-- This will update existing appointments to have valid status values before applying the constraint

-- First, let's see what status values currently exist
SELECT 
    'Current status values' as info,
    status,
    COUNT(*) as count
FROM appointments
GROUP BY status;

-- Show all appointments with their current status
SELECT 
    'All appointments' as info,
    id,
    patient_id,
    therapist_id,
    scheduled_at,
    type,
    status,
    notes,
    created_at
FROM appointments
ORDER BY created_at DESC;

-- Update any appointments with invalid status to 'upcoming'
-- This will fix any existing rows that might have invalid status values
UPDATE appointments 
SET status = 'upcoming'
WHERE status NOT IN ('upcoming', 'completed', 'cancelled', 'no-show', 'rescheduled')
   OR status IS NULL;

-- Show the updated status values
SELECT 
    'Updated status values' as info,
    status,
    COUNT(*) as count
FROM appointments
GROUP BY status;

-- Now let's drop the old constraint and create the new one
DO $$
BEGIN
    -- Drop any existing status check constraints
    EXECUTE (
        'ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check'
    );
    RAISE NOTICE 'Dropped existing status check constraint';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No status check constraint to drop or error: %', SQLERRM;
END $$;

-- Create a new status check constraint that allows common appointment statuses
ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('upcoming', 'completed', 'cancelled', 'no-show', 'rescheduled'));

-- Verify the constraint was created
SELECT 
    'New status check constraint' as info,
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'appointments'::regclass 
AND contype = 'c' 
AND conname = 'appointments_status_check';

-- Test appointment creation
DO $$
DECLARE
    test_therapist_id uuid;
    current_user_id uuid;
    test_appointment_id uuid;
BEGIN
    -- Get a sample therapist ID
    SELECT t.id INTO test_therapist_id 
    FROM therapists t 
    LIMIT 1;
    
    -- Get current user ID
    current_user_id := auth.uid();
    
    RAISE NOTICE 'Testing appointment creation after fixing existing data...';
    
    -- Try to create a test appointment
    INSERT INTO appointments (
        patient_id,
        therapist_id,
        scheduled_at,
        duration,
        type,
        notes,
        status
    ) VALUES (
        current_user_id,
        test_therapist_id,
        '2025-01-06T10:00:00',
        30,
        'Video Call',
        'Test appointment after fixing existing data',
        'upcoming'
    ) RETURNING id INTO test_appointment_id;
    
    RAISE NOTICE '✅ Test appointment created successfully with ID: %', test_appointment_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating appointment: %', SQLERRM;
END $$;

-- Final verification
SELECT 
    'Final appointment count' as info,
    COUNT(*) as count
FROM appointments;

SELECT 
    'Final status distribution' as info,
    status,
    COUNT(*) as count
FROM appointments
GROUP BY status
ORDER BY count DESC; 