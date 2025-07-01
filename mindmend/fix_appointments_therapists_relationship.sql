-- Fix missing foreign key relationship between appointments and therapists
-- Run this in Supabase SQL Editor

-- 1. Check current foreign key constraints
SELECT 
    'Current foreign key constraints' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'appointments';

-- 2. Check if therapists table exists and has the right structure
SELECT 
    'Therapists table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'therapists'
ORDER BY ordinal_position;

-- 3. Check appointments table structure
SELECT 
    'Appointments table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- 4. Drop existing foreign key if it exists (but is broken)
DO $$
BEGIN
    -- Try to drop the foreign key constraint if it exists
    ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_therapist_id_fkey;
    RAISE NOTICE 'Dropped existing foreign key constraint if it existed';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No existing foreign key to drop or error: %', SQLERRM;
END $$;

-- 5. Add the foreign key constraint
ALTER TABLE appointments 
ADD CONSTRAINT appointments_therapist_id_fkey 
FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE;

-- 6. Verify the foreign key was created
SELECT 
    'New foreign key constraint' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'appointments'
    AND tc.constraint_name = 'appointments_therapist_id_fkey';

-- 7. Test the relationship with a sample query
SELECT 
    'Test relationship query' as info,
    a.id as appointment_id,
    a.therapist_id,
    t.id as therapist_table_id,
    t.first_name,
    t.last_name,
    t.specialization
FROM appointments a
LEFT JOIN therapists t ON a.therapist_id = t.id
LIMIT 3;

-- 8. Check for any orphaned appointments (appointments with non-existent therapist_id)
SELECT 
    'Orphaned appointments check' as info,
    COUNT(*) as orphaned_count
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM therapists t WHERE t.id = a.therapist_id
);

-- 9. Show orphaned appointments if any exist
SELECT 
    'Orphaned appointments details' as info,
    a.id,
    a.therapist_id,
    a.scheduled_at,
    a.status
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM therapists t WHERE t.id = a.therapist_id
)
LIMIT 5;