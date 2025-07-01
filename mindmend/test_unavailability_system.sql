-- Test the therapist unavailability system
-- This script helps verify that unavailable slots are properly tracked

-- 1. Check if the table exists and has the right structure
SELECT 
    'Table exists' as check_type,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'therapist_unavailability'
    ) as result;

-- 2. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'therapist_unavailability'
ORDER BY ordinal_position;

-- 3. Check if there are any existing unavailability records
SELECT 
    'Existing records' as check_type,
    COUNT(*) as count
FROM therapist_unavailability;

-- 4. Show sample unavailability records if any exist
SELECT 
    id,
    therapist_id,
    appointment_id,
    start_time,
    end_time,
    reason,
    created_at
FROM therapist_unavailability
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check if there are any therapists with availability
SELECT 
    'Therapists with availability' as check_type,
    COUNT(DISTINCT therapist_id) as count
FROM therapist_availability;

-- 6. Show sample availability records
SELECT 
    therapist_id,
    day_of_week,
    start_time,
    end_time
FROM therapist_availability
LIMIT 5;

-- 7. Test query: Get unavailability for a specific date and therapist
-- Replace 'your-therapist-id' and '2024-01-15' with actual values
SELECT 
    'Test query for specific date' as test_type,
    start_time,
    end_time,
    reason
FROM therapist_unavailability
WHERE therapist_id = (
    SELECT id FROM therapists LIMIT 1
)
AND start_time >= '2024-01-15T00:00:00'
AND start_time < '2024-01-15T23:59:59';

-- 8. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'therapist_unavailability';

-- 9. Test trigger function
SELECT 
    'Trigger function exists' as check_type,
    EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = 'create_therapist_unavailability'
    ) as result;

-- 10. Check if trigger exists
SELECT 
    'Trigger exists' as check_type,
    EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'trigger_create_therapist_unavailability'
    ) as result;

-- 11. Show all triggers on appointments table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'appointments';

-- Test script to demonstrate unavailability system
-- This script shows how to create and query unavailable slots

-- 1. First, let's see what therapists we have
SELECT 'Current therapists:' as info;
SELECT 
  t.id,
  t.specialization,
  t.license_number,
  p.first_name,
  p.last_name
FROM therapists t
JOIN profiles p ON t.id = p.id;

-- 2. Check current availability for therapists
SELECT 'Current availability:' as info;
SELECT 
  ta.therapist_id,
  ta.day_of_week,
  ta.start_time,
  ta.end_time
FROM therapist_availability ta;

-- 3. Check current unavailability records
SELECT 'Current unavailability records:' as info;
SELECT 
  tu.therapist_id,
  tu.start_time,
  tu.end_time,
  tu.reason,
  tu.appointment_id
FROM therapist_unavailability tu
ORDER BY tu.start_time;

-- 4. Create a test unavailability record for today
-- Replace 'YOUR_THERAPIST_ID' with an actual therapist ID from step 1
-- Replace '2024-01-15' with today's date

/*
INSERT INTO therapist_unavailability (
  therapist_id,
  start_time,
  end_time,
  reason
) VALUES (
  'YOUR_THERAPIST_ID', -- Replace with actual therapist ID
  '2024-01-15T10:00:00Z', -- 10:00 AM today
  '2024-01-15T11:00:00Z', -- 11:00 AM today
  'Test unavailable slot'
);
*/

-- 5. Query to see what slots would be available for a specific date
-- This simulates what the getFreeSlots function does
SELECT 'Available slots simulation:' as info;

-- Example: For therapist with ID 'example-id' on '2024-01-15'
-- Replace with actual therapist ID and date
/*
WITH available_slots AS (
  SELECT 
    generate_series(
      '2024-01-15T09:00:00'::timestamp,
      '2024-01-15T17:00:00'::timestamp,
      '30 minutes'::interval
    ) as slot_start
),
unavailable_times AS (
  SELECT 
    start_time,
    end_time
  FROM therapist_unavailability 
  WHERE therapist_id = 'YOUR_THERAPIST_ID'
    AND start_time >= '2024-01-15T00:00:00'
    AND start_time < '2024-01-16T00:00:00'
)
SELECT 
  slot_start,
  slot_start + '30 minutes'::interval as slot_end,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM unavailable_times ut 
      WHERE slot_start >= ut.start_time 
        AND slot_start < ut.end_time
    ) THEN 'Unavailable'
    ELSE 'Available'
  END as status
FROM available_slots
ORDER BY slot_start;
*/

-- 6. Clean up test data (uncomment to remove test records)
/*
DELETE FROM therapist_unavailability 
WHERE reason = 'Test unavailable slot';
*/

SELECT 'Test script completed. Check the results above.' as status; 