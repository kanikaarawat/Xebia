-- Create therapists table if it doesn't exist
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  license_number text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_therapists_specialization ON therapists(specialization);
CREATE INDEX IF NOT EXISTS idx_therapists_license_number ON therapists(license_number);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_therapists_updated_at 
    BEFORE UPDATE ON therapists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 