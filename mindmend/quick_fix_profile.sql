-- Quick Fix for Profile Error
-- Run this in your Supabase SQL Editor to fix the profile loading issue

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  role text CHECK (role IN ('user', 'therapist', 'admin')) DEFAULT 'user',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 2. Create therapists table if it doesn't exist
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  license_number text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 3. Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 5. Create RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Enable RLS on therapists table
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Therapists can view own data" ON therapists;
DROP POLICY IF EXISTS "Therapists can insert own data" ON therapists;
DROP POLICY IF EXISTS "Therapists can update own data" ON therapists;
DROP POLICY IF EXISTS "Therapists can delete own data" ON therapists;

-- 8. Create RLS policies for therapists table
CREATE POLICY "Therapists can view own data" ON therapists
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Therapists can insert own data" ON therapists
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Therapists can update own data" ON therapists
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Therapists can delete own data" ON therapists
    FOR DELETE USING (auth.uid() = id);

-- 9. Grant permissions to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON therapists TO authenticated;

-- 10. Create function to handle new user signup (if it doesn't exist)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger for new user signup (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 12. Test the setup by checking current user
SELECT 
    'Current user ID' as info,
    auth.uid() as user_id;

-- 13. Check if current user has a profile
SELECT 
    'Profile exists' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
        THEN 'YES' 
        ELSE 'NO' 
    END as result;

-- 14. If no profile exists, create one for current user
INSERT INTO profiles (id, email, role)
SELECT 
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    'user'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid());

-- 15. Verify the fix
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at
FROM profiles p
WHERE p.id = auth.uid(); 