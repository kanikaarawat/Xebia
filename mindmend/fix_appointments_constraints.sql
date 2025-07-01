-- Fix Appointments Table Constraints
-- This will fix the status check constraint and other potential issues

-- First, let's see what constraints exist on the appointments table
SELECT 
    'Current constraints' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'appointments'::regclass;

-- Check the current status check constraint
SELECT 
    'Status check constraint' as info,
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'appointments'::regclass 
AND contype = 'c' 
AND conname LIKE '%status%';

-- Drop the existing status check constraint if it exists
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

-- Verify the new constraint
SELECT 
    'New status check constraint' as info,
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'appointments'::regclass 
AND contype = 'c' 
AND conname = 'appointments_status_check';

-- Test appointment creation with the fixed constraint
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
    
    RAISE NOTICE 'Testing appointment creation with fixed constraint...';
    
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
        '2025-01-06T09:00:00',
        30,
        'Video Call',
        'Test appointment after constraint fix',
        'upcoming'
    ) RETURNING id INTO test_appointment_id;
    
    RAISE NOTICE '✅ Test appointment created successfully with ID: %', test_appointment_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating appointment: %', SQLERRM;
END $$;

-- Show all constraints on appointments table
SELECT 
    'All appointments constraints' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'appointments'::regclass; 