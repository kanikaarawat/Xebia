-- View all unavailability slots for therapist: 12f138a9-cd94-4f05-9869-b6650333265c
-- Run this in Supabase SQL editor

-- Show all unavailability records for this therapist
SELECT 
    '=== ALL UNAVAILABILITY RECORDS ===' as info;

SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at,
    CASE 
        WHEN appointment_id IS NOT NULL THEN 'Appointment'
        ELSE 'Manual Block'
    END as type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
ORDER BY start_time;

-- Show today's unavailability
SELECT 
    '=== TODAY UNAVAILABILITY ===' as info;

SELECT 
    id,
    appointment_id,
    start_time,
    end_time,
    reason,
    CASE 
        WHEN appointment_id IS NOT NULL THEN 'Appointment'
        ELSE 'Manual Block'
    END as type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
  AND DATE(start_time) = CURRENT_DATE
ORDER BY start_time;

-- Show this week's unavailability
SELECT 
    '=== THIS WEEK UNAVAILABILITY ===' as info;

SELECT 
    id,
    appointment_id,
    start_time,
    end_time,
    reason,
    CASE 
        WHEN appointment_id IS NOT NULL THEN 'Appointment'
        ELSE 'Manual Block'
    END as type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
  AND DATE(start_time) >= DATE_TRUNC('week', CURRENT_DATE)
  AND DATE(start_time) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY start_time;

-- Show upcoming unavailability (future dates)
SELECT 
    '=== UPCOMING UNAVAILABILITY ===' as info;

SELECT 
    id,
    appointment_id,
    start_time,
    end_time,
    reason,
    CASE 
        WHEN appointment_id IS NOT NULL THEN 'Appointment'
        ELSE 'Manual Block'
    END as type
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
  AND start_time > NOW()
ORDER BY start_time;

-- Count summary
SELECT 
    '=== SUMMARY ===' as info;

SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN appointment_id IS NOT NULL THEN 1 END) as appointment_blocks,
    COUNT(CASE WHEN appointment_id IS NULL THEN 1 END) as manual_blocks,
    COUNT(CASE WHEN DATE(start_time) = CURRENT_DATE THEN 1 END) as today_blocks,
    COUNT(CASE WHEN DATE(start_time) >= DATE_TRUNC('week', CURRENT_DATE) 
                AND DATE(start_time) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days' 
                THEN 1 END) as this_week_blocks
FROM therapist_unavailability 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'; 