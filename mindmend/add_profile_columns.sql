-- Add missing columns to profiles table
-- Run this in your Supabase SQL editor

-- Add phone column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone text;

-- Add timezone column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';

-- Update existing profiles to have default timezone
UPDATE profiles 
SET timezone = 'UTC' 
WHERE timezone IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('phone', 'timezone')
ORDER BY column_name; 