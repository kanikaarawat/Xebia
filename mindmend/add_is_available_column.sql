-- Add is_available column to therapist_availability table
-- This script safely adds the column without losing existing data

-- Step 1: Add the column with a default value
ALTER TABLE therapist_availability 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Step 2: Update any NULL values to true (default available)
UPDATE therapist_availability 
SET is_available = true 
WHERE is_available IS NULL;

-- Step 3: Make the column NOT NULL (after ensuring no NULL values)
ALTER TABLE therapist_availability 
ALTER COLUMN is_available SET NOT NULL;

-- Step 4: Verify the changes
SELECT 
    'Column added successfully' as status,
    COUNT(*) as total_records,
    COUNT(CASE WHEN is_available = true THEN 1 END) as available_records,
    COUNT(CASE WHEN is_available = false THEN 1 END) as unavailable_records
FROM therapist_availability;

-- Step 5: Show sample data
SELECT 
    id,
    therapist_id,
    day_of_week,
    start_time,
    end_time,
    is_available,
    created_at
FROM therapist_availability 
ORDER BY day_of_week 
LIMIT 10; 