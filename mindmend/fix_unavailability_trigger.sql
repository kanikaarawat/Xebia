-- Fix therapist unavailability trigger
-- This script will recreate the trigger properly to match the table schema

-- First, let's check if the trigger exists
SELECT 
    'Current triggers on appointments table' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'appointments';

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_create_therapist_unavailability ON appointments;
DROP FUNCTION IF EXISTS create_therapist_unavailability();

-- Recreate the function with better error handling and correct schema
CREATE OR REPLACE FUNCTION create_therapist_unavailability()
RETURNS TRIGGER AS $$
DECLARE
    session_end_time time;
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'Creating unavailability for appointment %: therapist_id=%, scheduled_at=%, duration=%', 
        NEW.id, NEW.therapist_id, NEW.scheduled_at, NEW.duration;
    
    -- Calculate end time based on start time and duration
    session_end_time := (NEW.scheduled_at::time + (NEW.duration || ' minutes')::interval)::time;
    
    -- Insert unavailability record for the appointment duration
    INSERT INTO therapist_unavailability (
        therapist_id,
        appointment_id,
        date,
        start_time,
        end_time,
        reason
    ) VALUES (
        NEW.therapist_id,
        NEW.id,
        NEW.scheduled_at::date,
        NEW.scheduled_at::time,
        session_end_time,
        'Booked session - ' || COALESCE(NEW.type, 'Unknown')
    );
    
    RAISE NOTICE 'Unavailability record created successfully: date=%, start_time=%, end_time=%', 
        NEW.scheduled_at::date, NEW.scheduled_at::time, session_end_time;
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating unavailability: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_create_therapist_unavailability
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION create_therapist_unavailability();

-- Test the trigger by checking if it was created
SELECT 
    'Trigger created successfully' as status,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'appointments' 
AND trigger_name = 'trigger_create_therapist_unavailability';

-- Check if we have any existing appointments without unavailability records
SELECT 
    'Appointments without unavailability records' as info,
    COUNT(*) as count
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM therapist_unavailability tu 
    WHERE tu.appointment_id = a.id
);

-- Show some examples of appointments without unavailability
SELECT 
    a.id as appointment_id,
    a.therapist_id,
    a.scheduled_at,
    a.duration,
    a.type,
    a.status
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM therapist_unavailability tu 
    WHERE tu.appointment_id = a.id
)
LIMIT 5;

-- Manually create unavailability for existing appointments with correct schema
INSERT INTO therapist_unavailability (
    therapist_id,
    appointment_id,
    date,
    start_time,
    end_time,
    reason
)
SELECT 
    a.therapist_id,
    a.id as appointment_id,
    a.scheduled_at::date as date,
    a.scheduled_at::time as start_time,
    (a.scheduled_at::time + (a.duration || ' minutes')::interval)::time as end_time,
    'Booked session - ' || COALESCE(a.type, 'Unknown') as reason
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM therapist_unavailability tu 
    WHERE tu.appointment_id = a.id
);

-- Verify the fix
SELECT 
    'Verification' as info,
    (SELECT COUNT(*) FROM appointments) as total_appointments,
    (SELECT COUNT(*) FROM therapist_unavailability) as total_unavailability_records,
    (SELECT COUNT(*) FROM appointments a 
     WHERE EXISTS (SELECT 1 FROM therapist_unavailability tu WHERE tu.appointment_id = a.id)) as appointments_with_unavailability; 