-- Show All Data from therapist_unavailability Table
-- Run this in Supabase SQL Editor to see all unavailability data

-- 1. Check if table exists first
SELECT 
    'Table exists check' as info,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'therapist_unavailability'
    ) as table_exists;

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

-- 3. Count total records
SELECT 
    'Total records' as info,
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

-- 5. Show unavailability by therapist
SELECT 
    'Unavailability by therapist' as info,
    p.first_name || ' ' || p.last_name as therapist_name,
    COUNT(*) as unavailability_count,
    MIN(tu.start_time) as earliest_start,
    MAX(tu.start_time) as latest_start
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
GROUP BY tu.therapist_id, p.first_name, p.last_name
ORDER BY unavailability_count DESC;

-- 6. Show unavailability by reason
SELECT 
    'Unavailability by reason' as info,
    reason,
    COUNT(*) as count
FROM therapist_unavailability
GROUP BY reason
ORDER BY count DESC;

-- 7. Show today's unavailability
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

-- 8. Show this week's unavailability
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

-- 9. Show recent unavailability (last 30 days)
SELECT 
    'Recent unavailability (last 30 days)' as info,
    tu.id,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.start_time,
    tu.end_time,
    tu.reason,
    tu.created_at
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
WHERE tu.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY tu.created_at DESC;

-- 10. Show unavailability with appointment details
SELECT 
    'Unavailability with appointments' as info,
    tu.id,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.start_time,
    tu.end_time,
    tu.reason,
    a.scheduled_at as appointment_time,
    a.duration as appointment_duration,
    a.type as appointment_type,
    a.status as appointment_status
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
LEFT JOIN appointments a ON tu.appointment_id = a.id
WHERE tu.appointment_id IS NOT NULL
ORDER BY tu.start_time DESC;

-- 11. Show unavailability without appointments (manual entries)
SELECT 
    'Manual unavailability entries' as info,
    tu.id,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.start_time,
    tu.end_time,
    tu.reason,
    tu.created_at
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
WHERE tu.appointment_id IS NULL
ORDER BY tu.start_time DESC;

-- 12. Show summary statistics
SELECT 
    'Summary statistics' as info,
    (SELECT COUNT(*) FROM therapist_unavailability) as total_records,
    (SELECT COUNT(DISTINCT therapist_id) FROM therapist_unavailability) as unique_therapists,
    (SELECT COUNT(*) FROM therapist_unavailability WHERE appointment_id IS NOT NULL) as with_appointments,
    (SELECT COUNT(*) FROM therapist_unavailability WHERE appointment_id IS NULL) as without_appointments,
    (SELECT MIN(start_time) FROM therapist_unavailability) as earliest_start,
    (SELECT MAX(start_time) FROM therapist_unavailability) as latest_start,
    (SELECT AVG(EXTRACT(EPOCH FROM (end_time - start_time))/3600) FROM therapist_unavailability) as avg_duration_hours;

-- 13. Show data by date range
SELECT 
    'Data by date range' as info,
    DATE(tu.start_time) as date,
    COUNT(*) as unavailability_count,
    COUNT(DISTINCT tu.therapist_id) as unique_therapists
FROM therapist_unavailability tu
GROUP BY DATE(tu.start_time)
ORDER BY date DESC
LIMIT 30; 