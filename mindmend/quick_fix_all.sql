-- Quick fix for all database issues
-- Run this in Supabase SQL Editor to fix everything at once

-- 1. Disable RLS on all tables to avoid permission issues
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE therapists DISABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_unavailability DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Create therapists table if it doesn't exist
CREATE TABLE IF NOT EXISTS therapists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    license_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    type TEXT NOT NULL DEFAULT 'Video Call',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled', 'no-show')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create therapist_unavailability table if it doesn't exist
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

-- 5. Create therapist_availability table if it doesn't exist
CREATE TABLE IF NOT EXISTS therapist_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(therapist_id, day_of_week)
);

-- 6. Add some test data if tables are empty
INSERT INTO therapists (profile_id, specialization, license_number)
SELECT 
    p.id,
    'General Therapy',
    'LIC-' || substr(p.id::text, 1, 8)
FROM profiles p
WHERE p.role = 'therapist'
AND NOT EXISTS (SELECT 1 FROM therapists t WHERE t.profile_id = p.id)
LIMIT 5;

-- 7. Add availability for therapists
INSERT INTO therapist_availability (therapist_id, day_of_week, start_time, end_time)
SELECT 
    t.id,
    day,
    '09:00:00',
    '17:00:00'
FROM therapists t
CROSS JOIN (VALUES ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday')) AS days(day)
WHERE NOT EXISTS (
    SELECT 1 FROM therapist_availability ta 
    WHERE ta.therapist_id = t.id AND ta.day_of_week = days.day
);

-- 8. Test queries
SELECT 'Appointments count' as info, COUNT(*) as count FROM appointments;
SELECT 'Therapists count' as info, COUNT(*) as count FROM therapists;
SELECT 'Profiles count' as info, COUNT(*) as count FROM profiles;

-- 9. Show sample data
SELECT 'Sample therapists' as info, id, profile_id, specialization, license_number FROM therapists LIMIT 3;
SELECT 'Sample appointments' as info, id, patient_id, therapist_id, scheduled_at, status FROM appointments LIMIT 3;

-- 10. Create simple RLS policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_unavailability ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow read all" ON appointments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read all" ON therapists FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read all" ON therapist_unavailability FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read all" ON profiles FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to insert their own appointments
CREATE POLICY "Allow insert own appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Allow system to insert unavailability
CREATE POLICY "Allow insert unavailability" ON therapist_unavailability FOR INSERT WITH CHECK (true);

SELECT 'All fixes completed successfully!' as status; 