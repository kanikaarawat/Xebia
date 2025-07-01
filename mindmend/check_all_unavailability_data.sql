-- Comprehensive Unavailability Data Check
-- This script will show you all unavailability data in your system

-- 1. Check if the therapist_unavailability table exists
SELECT 
    'Table exists' as check_type,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'therapist_unavailability'
    ) as result;

-- 2. Show table structure
SELECT 
    'Table structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'therapist_unavailability'
ORDER BY ordinal_position;

-- 3. Count total unavailability records
SELECT 
    'Total unavailability records' as info,
    COUNT(*) as count
FROM therapist_unavailability;

-- 4. Show all unavailability records with therapist names
SELECT 
    'All unavailability records' as info,
    tu.id,
    tu.therapist_id,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.appointment_id,
    tu.start_time,
    tu.end_time,
    tu.reason,
    tu.created_at,
    tu.updated_at
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
ORDER BY tu.start_time DESC;

-- 5. Count unavailability by therapist
SELECT 
    'Unavailability by therapist' as info,
    p.first_name || ' ' || p.last_name as therapist_name,
    COUNT(*) as unavailability_count
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
GROUP BY tu.therapist_id, p.first_name, p.last_name
ORDER BY unavailability_count DESC;

-- 6. Count unavailability by reason
SELECT 
    'Unavailability by reason' as info,
    reason,
    COUNT(*) as count
FROM therapist_unavailability
GROUP BY reason
ORDER BY count DESC;

-- 7. Show unavailability for today
SELECT 
    'Today unavailability' as info,
    tu.id,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.start_time,
    tu.end_time,
    tu.reason
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
WHERE tu.start_time >= CURRENT_DATE
AND tu.start_time < CURRENT_DATE + INTERVAL '1 day'
ORDER BY tu.start_time;

-- 8. Show unavailability for this week
SELECT 
    'This week unavailability' as info,
    tu.id,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.start_time,
    tu.end_time,
    tu.reason
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
WHERE tu.start_time >= CURRENT_DATE
AND tu.start_time < CURRENT_DATE + INTERVAL '7 days'
ORDER BY tu.start_time;

-- 9. Show unavailability for next 30 days
SELECT 
    'Next 30 days unavailability' as info,
    tu.id,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.start_time,
    tu.end_time,
    tu.reason
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
WHERE tu.start_time >= CURRENT_DATE
AND tu.start_time < CURRENT_DATE + INTERVAL '30 days'
ORDER BY tu.start_time;

-- 10. Check for orphaned records (unavailability without appointments)
SELECT 
    'Orphaned unavailability records' as info,
    COUNT(*) as count
FROM therapist_unavailability tu
WHERE tu.appointment_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM appointments a WHERE a.id = tu.appointment_id
);

-- 11. Show orphaned records details
SELECT 
    'Orphaned records details' as info,
    tu.id,
    tu.therapist_id,
    tu.appointment_id,
    tu.start_time,
    tu.end_time,
    tu.reason
FROM therapist_unavailability tu
WHERE tu.appointment_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM appointments a WHERE a.id = tu.appointment_id
);

-- 12. Check for appointments without unavailability records
SELECT 
    'Appointments without unavailability' as info,
    COUNT(*) as count
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM therapist_unavailability tu WHERE tu.appointment_id = a.id
);

-- 13. Show appointments without unavailability
SELECT 
    'Appointments missing unavailability' as info,
    a.id as appointment_id,
    a.therapist_id,
    a.scheduled_at,
    a.duration,
    a.type,
    a.status
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM therapist_unavailability tu WHERE tu.appointment_id = a.id
)
ORDER BY a.scheduled_at DESC;

-- 14. Check for overlapping unavailability periods
SELECT 
    'Overlapping unavailability periods' as info,
    tu1.id as record1_id,
    tu1.therapist_id,
    tu1.start_time as start1,
    tu1.end_time as end1,
    tu2.id as record2_id,
    tu2.start_time as start2,
    tu2.end_time as end2
FROM therapist_unavailability tu1
JOIN therapist_unavailability tu2 ON tu1.therapist_id = tu2.therapist_id
WHERE tu1.id < tu2.id
AND tu1.start_time < tu2.end_time
AND tu1.end_time > tu2.start_time;

-- 15. Show unavailability by date range
SELECT 
    'Unavailability by date range' as info,
    DATE(tu.start_time) as date,
    COUNT(*) as unavailability_count
FROM therapist_unavailability tu
GROUP BY DATE(tu.start_time)
ORDER BY date DESC
LIMIT 30;

-- 16. Check for very long unavailability periods (potential data issues)
SELECT 
    'Long unavailability periods' as info,
    tu.id,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.start_time,
    tu.end_time,
    EXTRACT(EPOCH FROM (tu.end_time - tu.start_time))/3600 as duration_hours,
    tu.reason
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
WHERE EXTRACT(EPOCH FROM (tu.end_time - tu.start_time))/3600 > 8
ORDER BY duration_hours DESC;

-- 17. Show recent unavailability (last 7 days)
SELECT 
    'Recent unavailability (last 7 days)' as info,
    tu.id,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.start_time,
    tu.end_time,
    tu.reason,
    tu.created_at
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
WHERE tu.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY tu.created_at DESC;

-- 18. Summary statistics
SELECT 
    'Summary statistics' as info,
    (SELECT COUNT(*) FROM therapist_unavailability) as total_records,
    (SELECT COUNT(DISTINCT therapist_id) FROM therapist_unavailability) as unique_therapists,
    (SELECT COUNT(*) FROM therapist_unavailability WHERE appointment_id IS NOT NULL) as with_appointments,
    (SELECT COUNT(*) FROM therapist_unavailability WHERE appointment_id IS NULL) as without_appointments,
    (SELECT MIN(start_time) FROM therapist_unavailability) as earliest_start,
    (SELECT MAX(start_time) FROM therapist_unavailability) as latest_start; 