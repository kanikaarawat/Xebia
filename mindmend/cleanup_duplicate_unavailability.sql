-- Clean up duplicate unavailability records
-- This script removes duplicate records created by both manual function and database trigger

-- First, let's see what duplicates we have
SELECT 
    '=== DUPLICATE ANALYSIS ===' as info;

SELECT 
    appointment_id,
    start_time,
    end_time,
    reason,
    COUNT(*) as duplicate_count
FROM therapist_unavailability 
WHERE appointment_id IS NOT NULL
GROUP BY appointment_id, start_time, end_time, reason
HAVING COUNT(*) > 1
ORDER BY appointment_id;

-- Show the actual duplicate records
SELECT 
    '=== DUPLICATE RECORDS ===' as info;

WITH duplicates AS (
    SELECT 
        id,
        appointment_id,
        start_time,
        end_time,
        reason,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY appointment_id, start_time, end_time, reason 
            ORDER BY created_at
        ) as rn
    FROM therapist_unavailability 
    WHERE appointment_id IS NOT NULL
)
SELECT 
    id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at,
    CASE WHEN rn = 1 THEN 'KEEP' ELSE 'DELETE' END as action
FROM duplicates 
WHERE rn > 1
ORDER BY appointment_id, created_at;

-- Delete duplicate records, keeping only the first one for each unique combination
DELETE FROM therapist_unavailability 
WHERE id IN (
    SELECT id FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY appointment_id, start_time, end_time, reason 
                ORDER BY created_at
            ) as rn
        FROM therapist_unavailability 
        WHERE appointment_id IS NOT NULL
    ) ranked
    WHERE rn > 1
);

-- Verify the cleanup
SELECT 
    '=== VERIFICATION ===' as info;

SELECT 
    'Total unavailability records after cleanup:' as info,
    COUNT(*) as total_records
FROM therapist_unavailability;

SELECT 
    'Appointment-linked records after cleanup:' as info,
    COUNT(*) as appointment_records
FROM therapist_unavailability 
WHERE appointment_id IS NOT NULL;

SELECT 
    'Manual records after cleanup:' as info,
    COUNT(*) as manual_records
FROM therapist_unavailability 
WHERE appointment_id IS NULL;

-- Check for any remaining duplicates
SELECT 
    '=== REMAINING DUPLICATES ===' as info;

SELECT 
    appointment_id,
    start_time,
    end_time,
    reason,
    COUNT(*) as count
FROM therapist_unavailability 
WHERE appointment_id IS NOT NULL
GROUP BY appointment_id, start_time, end_time, reason
HAVING COUNT(*) > 1
ORDER BY appointment_id; 