-- Fix Authentication Issue
-- This script handles the case where auth.uid() returns null

-- 1. First, let's check if we're authenticated
SELECT 
    'Authentication check' as info,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED'
        ELSE 'AUTHENTICATED'
    END as status;

-- 2. If not authenticated, we need to create tables without auth dependencies
-- Create profiles table without auth trigger first
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  role text CHECK (role IN ('user', 'therapist', 'admin')) DEFAULT 'user',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 3. Create therapists table
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  license_number text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 4. Create therapist_availability table
CREATE TABLE IF NOT EXISTS therapist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(therapist_id, day_of_week)
);

-- 5. Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at timestamp NOT NULL,
  notes text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 6. Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_therapists_specialization ON therapists(specialization);
CREATE INDEX IF NOT EXISTS idx_therapists_license_number ON therapists(license_number);
CREATE INDEX IF NOT EXISTS idx_therapist_availability_therapist_id ON therapist_availability(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_availability_day ON therapist_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);

-- 7. Create update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_therapists_updated_at ON therapists;
CREATE TRIGGER update_therapists_updated_at 
    BEFORE UPDATE ON therapists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_therapist_availability_updated_at ON therapist_availability;
CREATE TRIGGER update_therapist_availability_updated_at 
    BEFORE UPDATE ON therapist_availability 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Create user signup function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 11. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 12. Drop any existing policies
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "therapists_select" ON therapists;
DROP POLICY IF EXISTS "therapists_insert" ON therapists;
DROP POLICY IF EXISTS "therapists_update" ON therapists;
DROP POLICY IF EXISTS "therapists_delete" ON therapists;
DROP POLICY IF EXISTS "availability_select" ON therapist_availability;
DROP POLICY IF EXISTS "availability_insert" ON therapist_availability;
DROP POLICY IF EXISTS "availability_update" ON therapist_availability;
DROP POLICY IF EXISTS "availability_delete" ON therapist_availability;
DROP POLICY IF EXISTS "appointments_select" ON appointments;
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_update" ON appointments;

-- 13. Create simple RLS policies
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

-- 15. Verify tables were created
SELECT 
    'Tables created successfully' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') as profiles_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'therapists') as therapists_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'therapist_availability') as availability_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') as appointments_exists;

-- 16. Show current user info (if authenticated)
SELECT 
    'Current user info' as info,
    auth.uid() as user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email; 