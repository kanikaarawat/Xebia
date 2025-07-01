-- Create appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at timestamp NOT NULL,
  duration integer DEFAULT 30,
  type text NOT NULL,
  notes text,
  status text DEFAULT 'upcoming',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS on appointments table for now
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS, create appropriate policies:
/*
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can view their own appointments
CREATE POLICY "Patients can view own appointments" ON appointments
    FOR SELECT USING (auth.uid() = patient_id);

-- Policy: Therapists can view appointments with them
CREATE POLICY "Therapists can view appointments with them" ON appointments
    FOR SELECT USING (auth.uid() = therapist_id);

-- Policy: Patients can create appointments
CREATE POLICY "Patients can create appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Policy: Patients can update their own appointments
CREATE POLICY "Patients can update own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = patient_id);

-- Policy: Patients can delete their own appointments
CREATE POLICY "Patients can delete own appointments" ON appointments
    FOR DELETE USING (auth.uid() = patient_id);
*/

-- Verify the table was created
SELECT 
    'Appointments table created' as info,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') as exists;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments'
ORDER BY ordinal_position; 