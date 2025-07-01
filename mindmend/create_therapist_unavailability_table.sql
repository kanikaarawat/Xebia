-- Create therapist_unavailability table
-- This table tracks when therapists are unavailable due to booked sessions

CREATE TABLE IF NOT EXISTS therapist_unavailability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT DEFAULT 'Booked session',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_therapist_unavailability_therapist_id ON therapist_unavailability(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_unavailability_start_time ON therapist_unavailability(start_time);
CREATE INDEX IF NOT EXISTS idx_therapist_unavailability_end_time ON therapist_unavailability(end_time);
CREATE INDEX IF NOT EXISTS idx_therapist_unavailability_date_range ON therapist_unavailability(start_time, end_time);

-- Add RLS policies
ALTER TABLE therapist_unavailability ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read unavailability (for booking purposes)
CREATE POLICY "Allow authenticated users to read therapist unavailability" ON therapist_unavailability
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow system to insert unavailability records
CREATE POLICY "Allow system to insert therapist unavailability" ON therapist_unavailability
    FOR INSERT WITH CHECK (true);

-- Allow system to update unavailability records
CREATE POLICY "Allow system to update therapist unavailability" ON therapist_unavailability
    FOR UPDATE USING (true);

-- Allow system to delete unavailability records
CREATE POLICY "Allow system to delete therapist unavailability" ON therapist_unavailability
    FOR DELETE USING (true);

-- Function to automatically create unavailability when appointment is created
CREATE OR REPLACE FUNCTION create_therapist_unavailability()
RETURNS TRIGGER AS $$
BEGIN
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
        'Booked session - ' || NEW.type
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create unavailability when appointment is created
DROP TRIGGER IF EXISTS trigger_create_therapist_unavailability ON appointments;
CREATE TRIGGER trigger_create_therapist_unavailability
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION create_therapist_unavailability();

-- Function to remove unavailability when appointment is cancelled/deleted
CREATE OR REPLACE FUNCTION remove_therapist_unavailability()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove unavailability record when appointment is deleted
    DELETE FROM therapist_unavailability 
    WHERE appointment_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically remove unavailability when appointment is deleted
DROP TRIGGER IF EXISTS trigger_remove_therapist_unavailability ON appointments;
CREATE TRIGGER trigger_remove_therapist_unavailability
    AFTER DELETE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION remove_therapist_unavailability();

-- Test the table creation
SELECT 'Therapist unavailability table created successfully' as status; 