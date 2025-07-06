-- Check if there are triggers that create unavailability when appointments are created
-- Run this in Supabase SQL editor

-- Check triggers on appointments table
SELECT 
    '=== TRIGGERS ON APPOINTMENTS TABLE ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'appointments';

-- Check if there's a trigger that creates unavailability
SELECT 
    '=== TRIGGERS THAT CREATE UNAVAILABILITY ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE action_statement LIKE '%therapist_unavailability%';

-- Check functions that might be creating unavailability
SELECT 
    '=== FUNCTIONS THAT CREATE UNAVAILABILITY ===' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%unavailability%'
ORDER BY routine_name;

-- Check the specific function that creates unavailability
SELECT 
    '=== CREATE_UNAVAILABILITY FUNCTION ===' as info;

SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_therapist_unavailability';

-- Check if the trigger exists
SELECT 
    '=== TRIGGER EXISTS CHECK ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_therapist_unavailability'; 