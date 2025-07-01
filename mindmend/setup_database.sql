-- Comprehensive Database Setup for MindMend Therapist System
-- Run this script in your Supabase SQL editor to set up all necessary tables

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
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

-- 2. Create therapists table if it doesn't exist
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  license_number text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 3. Create therapist_availability table if it doesn't exist
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

-- 4. Create appointments table if it doesn't exist
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

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_therapists_specialization ON therapists(specialization);
CREATE INDEX IF NOT EXISTS idx_therapists_license_number ON therapists(license_number);
CREATE INDEX IF NOT EXISTS idx_therapist_availability_therapist_id ON therapist_availability(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_availability_day ON therapist_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);

-- 6. Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at columns
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

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 10. Create RLS policies for therapists table
DROP POLICY IF EXISTS "Therapists can view own data" ON therapists;
CREATE POLICY "Therapists can view own data" ON therapists
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Therapists can insert own data" ON therapists;
CREATE POLICY "Therapists can insert own data" ON therapists
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Therapists can update own data" ON therapists;
CREATE POLICY "Therapists can update own data" ON therapists
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Therapists can delete own data" ON therapists;
CREATE POLICY "Therapists can delete own data" ON therapists
    FOR DELETE USING (auth.uid() = id);

-- 11. Create RLS policies for therapist_availability table
DROP POLICY IF EXISTS "Therapists can view own availability" ON therapist_availability;
CREATE POLICY "Therapists can view own availability" ON therapist_availability
    FOR SELECT USING (auth.uid() = therapist_id);

DROP POLICY IF EXISTS "Therapists can insert own availability" ON therapist_availability;
CREATE POLICY "Therapists can insert own availability" ON therapist_availability
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);

DROP POLICY IF EXISTS "Therapists can update own availability" ON therapist_availability;
CREATE POLICY "Therapists can update own availability" ON therapist_availability
    FOR UPDATE USING (auth.uid() = therapist_id);

DROP POLICY IF EXISTS "Therapists can delete own availability" ON therapist_availability;
CREATE POLICY "Therapists can delete own availability" ON therapist_availability
    FOR DELETE USING (auth.uid() = therapist_id);

-- 12. Create RLS policies for appointments table
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = therapist_id);

DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
CREATE POLICY "Users can insert own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = patient_id OR auth.uid() = therapist_id);

DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = patient_id OR auth.uid() = therapist_id);

-- 13. Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 15. Verify tables were created successfully
SELECT 
    table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name
    ) as table_exists
FROM (VALUES 
    ('profiles'),
    ('therapists'),
    ('therapist_availability'),
    ('appointments')
) AS t(table_name); 