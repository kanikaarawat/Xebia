-- Check if there are triggers on the therapist_unavailability table
-- Run this in Supabase SQL editor

-- Check triggers on therapist_unavailability table
SELECT 
    '=== TRIGGERS ON THERAPIST_UNAVAILABILITY TABLE ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'therapist_unavailability';

-- Check if there are any triggers that might create appointments
SELECT 
    '=== TRIGGERS THAT MIGHT CREATE APPOINTMENTS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE action_statement LIKE '%appointments%';

-- Check functions that might be called by triggers
SELECT 
    '=== FUNCTIONS THAT MIGHT CREATE APPOINTMENTS ===' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%appointment%'
ORDER BY routine_name;

-- Check the specific function that might create appointments
SELECT 
    '=== CREATE_APPOINTMENT FUNCTION ===' as info;

SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_appointment_from_unavailability';

-- Check if there's a trigger that creates appointments when unavailability is inserted
SELECT 
    '=== TRIGGER THAT CREATES APPOINTMENTS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_appointment_from_unavailability'; 