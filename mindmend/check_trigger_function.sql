-- Check the trigger function that creates unavailability records
-- Run this in Supabase SQL editor

-- Check the trigger function definition
SELECT 
    '=== TRIGGER FUNCTION DEFINITION ===' as info;

SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_therapist_unavailability';

-- Check if there are any triggers that create appointments from unavailability
SELECT 
    '=== TRIGGERS ON UNAVAILABILITY TABLE ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'therapist_unavailability';

-- Check if there's a reverse trigger (unavailability -> appointment)
SELECT 
    '=== REVERSE TRIGGERS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE action_statement LIKE '%appointments%' 
    AND event_object_table = 'therapist_unavailability';

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