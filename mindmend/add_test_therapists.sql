-- Add Multiple Test Therapists
-- Run this in your Supabase SQL editor to add more therapists

-- First, let's see what we currently have
SELECT 
    'Current therapists count' as info,
    COUNT(*) as count
FROM therapists;

-- Add multiple test therapists
-- We'll create profiles and therapist data for each

-- Therapist 1: Dr. Sarah Johnson (Cognitive Behavioral Therapy)
INSERT INTO profiles (id, email, first_name, last_name, role, bio, specialization, license_number)
VALUES (
    gen_random_uuid(),
    'dr.sarah.johnson@mindmend.com',
    'Dr. Sarah',
    'Johnson',
    'therapist',
    'Experienced cognitive behavioral therapist with 8+ years helping patients overcome anxiety and depression.',
    'Cognitive Behavioral Therapy',
    'CBT123456'
)
ON CONFLICT (email) DO NOTHING;

-- Get the ID of the therapist we just created
DO $$
DECLARE
    therapist1_id uuid;
    therapist2_id uuid;
    therapist3_id uuid;
BEGIN
    -- Get Dr. Sarah's ID
    SELECT id INTO therapist1_id FROM profiles WHERE email = 'dr.sarah.johnson@mindmend.com';
    
    -- Add therapist data for Dr. Sarah
    INSERT INTO therapists (id, specialization, license_number)
    VALUES (therapist1_id, 'Cognitive Behavioral Therapy', 'CBT123456')
    ON CONFLICT (id) DO NOTHING;

    -- Therapist 2: Dr. Michael Chen (Family Therapy)
    INSERT INTO profiles (id, email, first_name, last_name, role, bio, specialization, license_number)
    VALUES (
        gen_random_uuid(),
        'dr.michael.chen@mindmend.com',
        'Dr. Michael',
        'Chen',
        'therapist',
        'Specialized in family therapy and relationship counseling with a focus on communication and conflict resolution.',
        'Family Therapy',
        'FT789012'
    )
    ON CONFLICT (email) DO NOTHING;

    -- Get Dr. Michael's ID
    SELECT id INTO therapist2_id FROM profiles WHERE email = 'dr.michael.chen@mindmend.com';
    
    -- Add therapist data for Dr. Michael
    INSERT INTO therapists (id, specialization, license_number)
    VALUES (therapist2_id, 'Family Therapy', 'FT789012')
    ON CONFLICT (id) DO NOTHING;

    -- Therapist 3: Dr. Emily Rodriguez (Trauma Therapy)
    INSERT INTO profiles (id, email, first_name, last_name, role, bio, specialization, license_number)
    VALUES (
        gen_random_uuid(),
        'dr.emily.rodriguez@mindmend.com',
        'Dr. Emily',
        'Rodriguez',
        'therapist',
        'Trauma-informed therapist specializing in PTSD, anxiety disorders, and healing from past experiences.',
        'Trauma Therapy',
        'TT345678'
    )
    ON CONFLICT (email) DO NOTHING;

    -- Get Dr. Emily's ID
    SELECT id INTO therapist3_id FROM profiles WHERE email = 'dr.emily.rodriguez@mindmend.com';
    
    -- Add therapist data for Dr. Emily
    INSERT INTO therapists (id, specialization, license_number)
    VALUES (therapist3_id, 'Trauma Therapy', 'TT345678')
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Added 3 new therapists successfully';
END $$;

-- Verify all therapists
SELECT 
    'All therapists after adding new ones' as info,
    COUNT(*) as count
FROM therapists;

-- Show all therapists with their details
SELECT 
    t.id,
    p.first_name,
    p.last_name,
    p.email,
    t.specialization,
    t.license_number,
    p.role
FROM therapists t
JOIN profiles p ON t.id = p.id
ORDER BY p.first_name;

-- Add availability for all therapists (including the new ones)
-- This will add Monday-Friday availability for all therapists

DO $$
DECLARE
    therapist_record RECORD;
BEGIN
    -- Loop through all therapists and add availability
    FOR therapist_record IN 
        SELECT t.id 
        FROM therapists t
        WHERE NOT EXISTS (
            SELECT 1 FROM therapist_availability ta 
            WHERE ta.therapist_id = t.id
        )
    LOOP
        -- Add Monday to Friday availability, 9 AM to 5 PM
        INSERT INTO therapist_availability (therapist_id, day_of_week, start_time, end_time)
        VALUES 
            (therapist_record.id, 'Monday', '09:00', '17:00'),
            (therapist_record.id, 'Tuesday', '09:00', '17:00'),
            (therapist_record.id, 'Wednesday', '09:00', '17:00'),
            (therapist_record.id, 'Thursday', '09:00', '17:00'),
            (therapist_record.id, 'Friday', '09:00', '17:00')
        ON CONFLICT (therapist_id, day_of_week) DO NOTHING;
        
        RAISE NOTICE 'Added availability for therapist %', therapist_record.id;
    END LOOP;
    
    RAISE NOTICE 'Finished adding availability for all therapists';
END $$;

-- Final verification
SELECT 
    'Final therapist count' as info,
    COUNT(*) as count
FROM therapists;

SELECT 
    'Final availability count' as info,
    COUNT(*) as count
FROM therapist_availability;

-- Show all availability
SELECT 
    ta.therapist_id,
    p.first_name,
    p.last_name,
    ta.day_of_week,
    ta.start_time,
    ta.end_time
FROM therapist_availability ta
JOIN profiles p ON ta.therapist_id = p.id
ORDER BY p.first_name, ta.day_of_week; 