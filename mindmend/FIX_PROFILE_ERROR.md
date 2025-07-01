# Fix "Profile Error" - Step by Step Solution

## 🚨 Current Issue
You're seeing: "Profile Error - Unable to load or create your profile. This is usually a database setup issue."

## 🔧 Quick Fix (5 minutes)

### Step 1: Run the Database Fix Script
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `quick_fix_profile.sql`
4. Click **Run** to execute the script
5. You should see results showing your user ID and profile status

### Step 2: Check the Results
After running the script, you should see:
- Your current user ID
- Whether your profile exists (should show "YES")
- Your profile details

### Step 3: Test the Setup Profile Page
1. Go back to your app at `http://localhost:3001/setup-profile`
2. The page should now load without the error
3. You should see the setup form

## 🔍 If the Quick Fix Doesn't Work

### Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages like:
   - `❌ Error creating profile:`
   - `❌ Database error:`
   - `❌ Unexpected error creating profile:`

### Check System Status
1. Go to `http://localhost:3001/debug`
2. This will show you:
   - Authentication status
   - Database connection
   - Table existence
   - Profile status

## 🛠️ Manual Database Setup

If the quick fix doesn't work, run these commands in order:

### 1. Create Tables
```sql
-- Create profiles table
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

-- Create therapists table
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  license_number text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### 2. Set Up Permissions
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON therapists TO authenticated;
```

### 3. Create RLS Policies
```sql
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Therapists policies
CREATE POLICY "Therapists can view own data" ON therapists
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Therapists can insert own data" ON therapists
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Therapists can update own data" ON therapists
    FOR UPDATE USING (auth.uid() = id);
```

### 4. Create Your Profile
```sql
-- Create profile for current user
INSERT INTO profiles (id, email, role)
SELECT 
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    'user'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid());
```

## 🔍 Common Error Messages & Solutions

### "relation 'profiles' does not exist"
**Solution:** Run the table creation commands above

### "new row violates row-level security policy"
**Solution:** Run the RLS policy commands above

### "permission denied for table profiles"
**Solution:** Run the GRANT commands above

### "duplicate key value violates unique constraint"
**Solution:** This means your profile already exists, which is fine

## ✅ Success Indicators

You'll know it's fixed when:
1. ✅ The setup profile page loads without the error message
2. ✅ You see the profile setup form
3. ✅ Console shows "✅ Basic profile created:" or "✅ Profile found:"
4. ✅ You can fill out and submit the form successfully

## 🆘 Still Having Issues?

If you're still getting the error:

1. **Check the debug page** at `/debug` for comprehensive system status
2. **Share the console output** - Copy all error messages
3. **Check the network tab** - Look for failed API calls (status 403, 500, etc.)
4. **Verify your Supabase URL and API key** in your environment variables

## 📞 Get Help

Share this information:
1. The exact error message you see
2. Console output from browser dev tools
3. Results from the `/debug` page
4. Any error messages from the SQL script execution

# Fix "Infinite Recursion" RLS Policy Error

## 🚨 Problem
You're getting this error: `"infinite recursion detected in policy for relation 'profiles'"`

This happens when RLS (Row Level Security) policies create circular references.

## 🔧 Quick Fix

### Option 1: Quick Fix (Recommended)
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the entire `fix_rls_recursion.sql` file
4. Click **Run**
5. This will fix the RLS policies without losing data

### Option 2: Complete Reset (If Quick Fix Doesn't Work)
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the entire `complete_reset.sql` file
4. Click **Run**
5. **Warning:** This will delete all existing data and start fresh

## 🔍 What Each Script Does

### `fix_rls_recursion.sql`
- Disables RLS temporarily to break recursion
- Drops problematic policies
- Creates new, simple policies without recursion
- Keeps your existing data

### `complete_reset.sql`
- Completely drops and recreates all tables
- Creates fresh, clean database structure
- Sets up proper RLS policies
- **Deletes all existing data**

## ✅ After Running the Fix

1. **Refresh your setup profile page** (`/setup-profile`)
2. **Check the browser console** for any remaining errors
3. **Visit the debug page** (`/debug`) to verify everything works
4. **Try filling out the setup form** again

## 🔍 Verify the Fix

Run this in your Supabase SQL Editor to check if it worked:

```sql
-- Check if policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'therapists')
ORDER BY tablename, policyname;

-- Check if you can access your profile
SELECT 
    id,
    email,
    role,
    created_at
FROM profiles 
WHERE id = auth.uid();
```

## 🆘 Still Having Issues?

If you're still getting errors:

1. **Check the browser console** for new error messages
2. **Try the complete reset** if the quick fix didn't work
3. **Verify your Supabase connection** in environment variables
4. **Check if you're properly authenticated**

## 📞 Get Help

Share this information:
1. Which script you ran (quick fix or complete reset)
2. Any new error messages in the console
3. Results from the verification queries above
4. What you see on the setup profile page after the fix

---

# Fix "Null Value in Column ID" Error

## 🚨 Problem
You're getting this error: `"null value in column "id" of relation "profiles" violates not-null constraint"`

This happens when `auth.uid()` returns null, meaning you're not authenticated in the SQL context.

## 🔧 Solution

### Step 1: Fix Database Structure
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the entire `fix_auth_issue.sql` file
4. Click **Run**
5. This creates tables without auth dependencies

### Step 2: Create Profile Manually
1. **Make sure you're logged in** to your app first
2. Go to **SQL Editor** again
3. Copy and paste the `create_profile_manually.sql` file
4. Click **Run**
5. This will create your profile when you're authenticated

### Step 3: Alternative - Create Profile via App
1. Go to your app and log in
2. Navigate to `/setup-profile`
3. The app should now be able to create your profile automatically

## 🔍 Why This Happens

- The SQL Editor runs in a different context than your app
- `auth.uid()` returns null when not authenticated in SQL context
- The app handles authentication properly, but SQL scripts don't

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Tables are created without errors
2. ✅ Profile is created successfully
3. ✅ Setup profile page loads without errors
4. ✅ You can fill out and submit the form

## 🆘 Still Having Issues?

If you're still getting errors:

1. **Make sure you're logged in** to your app first
2. **Try creating the profile through the app** instead of SQL
3. **Check the browser console** for authentication status
4. **Verify your Supabase connection** in environment variables 