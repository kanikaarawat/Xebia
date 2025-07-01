-- Comprehensive fix for therapist unavailability table schema issues
-- This script will handle both possible table schemas and fix the trigger

-- First, let's check what schema we actually have
SELECT 
    'Current table schema' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'therapist_unavailability'
ORDER BY ordinal_position;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS trigger_create_therapist_unavailability ON appointments;
DROP TRIGGER IF EXISTS trigger_remove_therapist_unavailability ON appointments;
DROP FUNCTION IF EXISTS create_therapist_unavailability();
DROP FUNCTION IF EXISTS remove_therapist_unavailability();

-- Create a flexible function that works with both schemas
CREATE OR REPLACE FUNCTION create_therapist_unavailability()
RETURNS TRIGGER AS $$
DECLARE
    session_end_time time;
    session_end_timestamp timestamp with time zone;
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'Creating unavailability for appointment %: therapist_id=%, scheduled_at=%, duration=%', 
        NEW.id, NEW.therapist_id, NEW.scheduled_at, NEW.duration;
    
    -- Calculate end time
    session_end_timestamp := NEW.scheduled_at + (NEW.duration || ' minutes')::interval;
    session_end_time := session_end_timestamp::time;
    
    -- Try to insert with timestamp schema first
    BEGIN
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
            session_end_timestamp,
            'Booked session - ' || COALESCE(NEW.type, 'Unknown')
        );
        
        RAISE NOTICE 'Unavailability record created with timestamp schema';
        RETURN NEW;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Timestamp schema failed, trying date/time schema: %', SQLERRM;
        
        -- Try with date/time schema
        BEGIN
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
            
            RAISE NOTICE 'Unavailability record created with date/time schema';
            RETURN NEW;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Both schemas failed: %', SQLERRM;
            RETURN NEW;
        END;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_create_therapist_unavailability
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION create_therapist_unavailability();

-- Create function to remove unavailability
CREATE OR REPLACE FUNCTION remove_therapist_unavailability()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove unavailability record when appointment is deleted
    DELETE FROM therapist_unavailability 
    WHERE appointment_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the delete trigger
CREATE TRIGGER trigger_remove_therapist_unavailability
    AFTER DELETE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION remove_therapist_unavailability();

-- Verify triggers were created
SELECT 
    'Triggers created' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'appointments'
AND trigger_name LIKE '%therapist_unavailability%';

-- Check for any existing appointments without unavailability records
SELECT 
    'Appointments without unavailability' as info,
    COUNT(*) as count
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM therapist_unavailability tu 
    WHERE tu.appointment_id = a.id
);

-- Manually create unavailability for existing appointments
-- This will try both schemas automatically
DO $$
DECLARE
    appt RECORD;
    session_end_time time;
    session_end_timestamp timestamp with time zone;
BEGIN
    FOR appt IN 
        SELECT * FROM appointments a
        WHERE NOT EXISTS (
            SELECT 1 FROM therapist_unavailability tu 
            WHERE tu.appointment_id = a.id
        )
    LOOP
        session_end_timestamp := appt.scheduled_at + (appt.duration || ' minutes')::interval;
        session_end_time := session_end_timestamp::time;
        
        -- Try timestamp schema first
        BEGIN
            INSERT INTO therapist_unavailability (
                therapist_id,
                appointment_id,
                start_time,
                end_time,
                reason
            ) VALUES (
                appt.therapist_id,
                appt.id,
                appt.scheduled_at,
                session_end_timestamp,
                'Booked session - ' || COALESCE(appt.type, 'Unknown')
            );
            
            RAISE NOTICE 'Created unavailability for appointment % with timestamp schema', appt.id;
            
        EXCEPTION WHEN OTHERS THEN
            -- Try date/time schema
            BEGIN
                INSERT INTO therapist_unavailability (
                    therapist_id,
                    appointment_id,
                    date,
                    start_time,
                    end_time,
                    reason
                ) VALUES (
                    appt.therapist_id,
                    appt.id,
                    appt.scheduled_at::date,
                    appt.scheduled_at::time,
                    session_end_time,
                    'Booked session - ' || COALESCE(appt.type, 'Unknown')
                );
                
                RAISE NOTICE 'Created unavailability for appointment % with date/time schema', appt.id;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Failed to create unavailability for appointment %: %', appt.id, SQLERRM;
            END;
        END;
    END LOOP;
END $$;

-- Final verification
SELECT 
    'Final verification' as info,
    (SELECT COUNT(*) FROM appointments) as total_appointments,
    (SELECT COUNT(*) FROM therapist_unavailability) as total_unavailability_records,
    (SELECT COUNT(*) FROM appointments a 
     WHERE EXISTS (SELECT 1 FROM therapist_unavailability tu WHERE tu.appointment_id = a.id)) as appointments_with_unavailability; 