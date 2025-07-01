-- Quick Unavailability Data Check
-- Simple script to quickly check unavailability data

-- 1. Basic count
SELECT 'Total unavailability records' as info, COUNT(*) as count FROM therapist_unavailability;

-- 2. Show all records with therapist names
SELECT 
    tu.id,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.start_time,
    tu.end_time,
    tu.reason,
    tu.appointment_id
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
ORDER BY tu.start_time DESC;

-- 3. Show today's unavailability
SELECT 
    'Today unavailability' as info,
    p.first_name || ' ' || p.last_name as therapist_name,
    tu.start_time,
    tu.end_time,
    tu.reason
FROM therapist_unavailability tu
LEFT JOIN profiles p ON tu.therapist_id = p.id
WHERE tu.start_time >= CURRENT_DATE
AND tu.start_time < CURRENT_DATE + INTERVAL '1 day'
ORDER BY tu.start_time;

-- 4. Count by reason
SELECT reason, COUNT(*) as count 
FROM therapist_unavailability 
GROUP BY reason 
ORDER BY count DESC;

-- 5. Check for data issues
SELECT 
    'Data issues check' as info,
    (SELECT COUNT(*) FROM therapist_unavailability WHERE appointment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.id = therapist_unavailability.appointment_id)) as orphaned_records,
    (SELECT COUNT(*) FROM appointments a WHERE NOT EXISTS (SELECT 1 FROM therapist_unavailability tu WHERE tu.appointment_id = a.id)) as missing_unavailability; 