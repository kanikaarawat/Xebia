-- Fix therapist_availability table to include is_available field
-- First, add the column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'therapist_availability' 
        AND column_name = 'is_available'
    ) THEN
        ALTER TABLE therapist_availability ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update existing records to have is_available = true
UPDATE therapist_availability SET is_available = true WHERE is_available IS NULL;

-- Make the column NOT NULL
ALTER TABLE therapist_availability ALTER COLUMN is_available SET NOT NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'therapist_availability' 
ORDER BY ordinal_position; 