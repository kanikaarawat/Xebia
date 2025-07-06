-- Check for triggers that might be creating appointments
-- Run this in Supabase SQL editor

-- Check all triggers in the database
SELECT 
    '=== ALL TRIGGERS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
ORDER BY event_object_table, trigger_name;

-- Check triggers specifically on therapist_unavailability table
SELECT 
    '=== TRIGGERS ON THERAPIST_UNAVAILABILITY ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'therapist_unavailability';

-- Check triggers on appointments table
SELECT 
    '=== TRIGGERS ON APPOINTMENTS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'appointments';

-- Check functions that might be creating appointments
SELECT 
    '=== FUNCTIONS THAT MIGHT CREATE APPOINTMENTS ===' as info;

SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition LIKE '%appointments%'
  AND routine_definition LIKE '%INSERT%'
ORDER BY routine_name;

-- Check the most recent appointments to see their pattern
SELECT 
    '=== MOST RECENT APPOINTMENTS ===' as info;

SELECT 
    id,
    therapist_id,
    patient_id,
    scheduled_at,
    duration,
    type,
    status,
    created_at
FROM appointments 
WHERE therapist_id = '12f138a9-cd94-4f05-9869-b6650333265c'
ORDER BY created_at DESC
LIMIT 5; 