-- Create therapist_availability table if it doesn't exist
CREATE TABLE IF NOT EXISTS therapist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(therapist_id, day_of_week)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_therapist_availability_therapist_id ON therapist_availability(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_availability_day ON therapist_availability(day_of_week);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_therapist_availability_updated_at 
    BEFORE UPDATE ON therapist_availability 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Therapists can only see their own availability
CREATE POLICY "Therapists can view own availability" ON therapist_availability
    FOR SELECT USING (auth.uid() = therapist_id);

-- Policy: Therapists can insert their own availability
CREATE POLICY "Therapists can insert own availability" ON therapist_availability
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);

-- Policy: Therapists can update their own availability
CREATE POLICY "Therapists can update own availability" ON therapist_availability
    FOR UPDATE USING (auth.uid() = therapist_id);

-- Policy: Therapists can delete their own availability
CREATE POLICY "Therapists can delete own availability" ON therapist_availability
    FOR DELETE USING (auth.uid() = therapist_id); 