-- Migration script to move therapist data from profiles to therapists table
-- Run this if you have existing therapist data in the profiles table

-- First, let's check if there are any profiles with therapist role and specialization/license data
SELECT 
    id,
    first_name,
    last_name,
    role,
    specialization,
    license_number
FROM profiles 
WHERE role = 'therapist' 
    AND (specialization IS NOT NULL OR license_number IS NOT NULL);

-- If you see data above, run this migration:
INSERT INTO therapists (id, specialization, license_number)
SELECT 
    id,
    COALESCE(specialization, 'General Therapy') as specialization,
    COALESCE(license_number, 'PENDING') as license_number
FROM profiles 
WHERE role = 'therapist' 
    AND id NOT IN (SELECT id FROM therapists)
    AND (specialization IS NOT NULL OR license_number IS NOT NULL);

-- After migration, you can optionally remove the specialization and license_number columns from profiles
-- (Only if you're sure all data has been migrated)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS specialization;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS license_number;

-- Verify the migration worked
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.role,
    t.specialization,
    t.license_number
FROM profiles p
LEFT JOIN therapists t ON p.id = t.id
WHERE p.role = 'therapist'; 