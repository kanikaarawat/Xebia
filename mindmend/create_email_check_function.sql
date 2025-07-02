-- Create function to check if email exists in auth.users table (case insensitive)
-- Run this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION check_email_exists(email_to_check text)
RETURNS TABLE(email_exists boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT EXISTS(
    SELECT 1 
    FROM auth.users 
    WHERE LOWER(email) = LOWER(email_to_check)
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO authenticated;

-- Test the function
SELECT * FROM check_email_exists('Jaanhvi.101756@stu.upes.ac.in'); 