-- Complete Database Reset and Fix
-- This script will completely reset and fix all database issues

-- 1. Drop all existing tables to start fresh
DROP TABLE IF EXISTS therapist_availability CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS therapists CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Drop all functions and triggers
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. Create profiles table with proper structure
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  role text CHECK (role IN ('user', 'therapist', 'admin')) DEFAULT 'user',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 4. Create therapists table
CREATE TABLE therapists (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  license_number text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 5. Create therapist_availability table
CREATE TABLE therapist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(therapist_id, day_of_week)
);

-- 6. Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at timestamp NOT NULL,
  notes text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 7. Add indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_therapists_specialization ON therapists(specialization);
CREATE INDEX idx_therapists_license_number ON therapists(license_number);
CREATE INDEX idx_therapist_availability_therapist_id ON therapist_availability(therapist_id);
CREATE INDEX idx_therapist_availability_day ON therapist_availability(day_of_week);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);

-- 8. Create update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapists_updated_at 
    BEFORE UPDATE ON therapists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapist_availability_updated_at 
    BEFORE UPDATE ON therapist_availability 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Create user signup function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create signup trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 12. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 13. Create simple RLS policies (no recursion)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "therapists_select" ON therapists FOR SELECT USING (auth.uid() = id);
CREATE POLICY "therapists_insert" ON therapists FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "therapists_update" ON therapists FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "therapists_delete" ON therapists FOR DELETE USING (auth.uid() = id);

CREATE POLICY "availability_select" ON therapist_availability FOR SELECT USING (auth.uid() = therapist_id);
CREATE POLICY "availability_insert" ON therapist_availability FOR INSERT WITH CHECK (auth.uid() = therapist_id);
CREATE POLICY "availability_update" ON therapist_availability FOR UPDATE USING (auth.uid() = therapist_id);
CREATE POLICY "availability_delete" ON therapist_availability FOR DELETE USING (auth.uid() = therapist_id);

CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = therapist_id);
CREATE POLICY "appointments_insert" ON appointments FOR INSERT WITH CHECK (auth.uid() = patient_id OR auth.uid() = therapist_id);
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (auth.uid() = patient_id OR auth.uid() = therapist_id);

-- 14. Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON therapists TO authenticated;
GRANT ALL ON therapist_availability TO authenticated;
GRANT ALL ON appointments TO authenticated;

-- 15. Create profile for current user
INSERT INTO profiles (id, email, role)
SELECT 
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    'user'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid());

-- 16. Verify everything works
SELECT 
    'Database reset complete' as status,
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM therapists) as therapists_count,
    (SELECT COUNT(*) FROM therapist_availability) as availability_count,
    (SELECT COUNT(*) FROM appointments) as appointments_count; 