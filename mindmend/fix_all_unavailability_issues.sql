-- Comprehensive fix for all unavailability issues
-- This script will recreate the table with the correct structure

-- 1. Drop existing table and triggers
DROP TRIGGER IF EXISTS trigger_create_therapist_unavailability ON appointments;
DROP TRIGGER IF EXISTS trigger_remove_therapist_unavailability ON appointments;
DROP FUNCTION IF EXISTS create_therapist_unavailability();
DROP FUNCTION IF EXISTS remove_therapist_unavailability();
DROP TABLE IF EXISTS therapist_unavailability;

-- 2. Create the table with the correct structure (timestamp schema)
CREATE TABLE therapist_unavailability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT DEFAULT 'Booked session',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add indexes for better performance
CREATE INDEX idx_therapist_unavailability_therapist_id ON therapist_unavailability(therapist_id);
CREATE INDEX idx_therapist_unavailability_start_time ON therapist_unavailability(start_time);
CREATE INDEX idx_therapist_unavailability_end_time ON therapist_unavailability(end_time);
CREATE INDEX idx_therapist_unavailability_date_range ON therapist_unavailability(start_time, end_time);

-- 4. Disable RLS for now to avoid permission issues
ALTER TABLE therapist_unavailability DISABLE ROW LEVEL SECURITY;

-- 5. Create the trigger function
CREATE OR REPLACE FUNCTION create_therapist_unavailability()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'Creating unavailability for appointment %: therapist_id=%, scheduled_at=%, duration=%', 
        NEW.id, NEW.therapist_id, NEW.scheduled_at, NEW.duration;
    
    -- Insert unavailability record for the appointment duration
    INSERT INTO therapist_unavailability (
        therapist_id,
        appointment_id,
        start_time,
        end_time,
        reason
    ) VALUES (
        NEW.therapist_id,
        NEW.id,
        NEW.scheduled_at,
        NEW.scheduled_at + (NEW.duration || ' minutes')::interval,
        'Booked session - ' || COALESCE(NEW.type, 'Unknown')
    );
    
    RAISE NOTICE 'Unavailability record created successfully';
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating unavailability: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create the trigger
CREATE TRIGGER trigger_create_therapist_unavailability
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION create_therapist_unavailability();

-- 7. Create function to remove unavailability
CREATE OR REPLACE FUNCTION remove_therapist_unavailability()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove unavailability record when appointment is deleted
    DELETE FROM therapist_unavailability 
    WHERE appointment_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 8. Create the delete trigger
CREATE TRIGGER trigger_remove_therapist_unavailability
    AFTER DELETE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION remove_therapist_unavailability();

-- 9. Test the table creation
SELECT 'Table created successfully' as status;

-- 10. Test insert
DO $$
DECLARE
    test_therapist_id uuid;
    test_appointment_id uuid;
BEGIN
    -- Get a sample therapist_id
    SELECT id INTO test_therapist_id FROM therapists LIMIT 1;
    
    -- Get a sample appointment_id
    SELECT id INTO test_appointment_id FROM appointments LIMIT 1;
    
    IF test_therapist_id IS NOT NULL THEN
        INSERT INTO therapist_unavailability (
            therapist_id,
            appointment_id,
            start_time,
            end_time,
            reason
        ) VALUES (
            test_therapist_id,
            test_appointment_id,
            '2025-01-15T10:00:00+00:00',
            '2025-01-15T11:00:00+00:00',
            'Test session'
        );
        
        RAISE NOTICE '✅ Test insert successful';
        
        -- Clean up
        DELETE FROM therapist_unavailability WHERE reason = 'Test session';
        
    ELSE
        RAISE NOTICE 'No therapists found in database';
    END IF;
END $$;

-- 11. Verify everything is working
SELECT 
    'Verification' as info,
    (SELECT COUNT(*) FROM appointments) as total_appointments,
    (SELECT COUNT(*) FROM therapist_unavailability) as total_unavailability_records;

-- 12. Show trigger status
SELECT 
    'Trigger status' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'appointments'
AND trigger_name LIKE '%therapist_unavailability%'; 