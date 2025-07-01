-- Run this script in Supabase SQL Editor to fix the unavailability trigger
-- This will ensure appointments automatically create unavailability records

-- Run the fix script
\i fix_unavailability_trigger.sql

-- Test the fix
\i test_unavailability_trigger.sql 