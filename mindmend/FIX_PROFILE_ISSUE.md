# Fix "Profile Not Found" Issue - Step by Step Guide

## 🚨 Problem
You're getting "Profile Not Found" error even after filling out the setup form.

## 🔧 Solution Steps

### Step 1: Set Up Database Tables
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `setup_database.sql`
4. Click **Run** to execute the script
5. You should see a table verification at the end showing all tables exist

### Step 2: Check Your Current Status
1. In the **SQL Editor**, run the `test_therapist_profile.sql` script
2. Look at the results to see:
   - Which tables exist
   - If your profile exists
   - If you have therapist data
   - What your current role is

### Step 3: Fix Your Profile (if needed)
If the test shows issues, run these commands in order:

```sql
-- 1. Ensure you have a profile with therapist role
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES (
    auth.uid(),
    'your-email@example.com',  -- Replace with your actual email
    'Your First Name',         -- Replace with your actual name
    'Your Last Name',          -- Replace with your actual name
    'therapist'
)
ON CONFLICT (id) DO UPDATE SET 
    role = 'therapist',
    first_name = COALESCE(profiles.first_name, 'Your First Name'),
    last_name = COALESCE(profiles.last_name, 'Your Last Name');

-- 2. Ensure you have therapist data
INSERT INTO therapists (id, specialization, license_number)
VALUES (
    auth.uid(),
    'General Therapy',  -- Replace with your specialization
    'YOUR123'          -- Replace with your license number
)
ON CONFLICT (id) DO NOTHING;
```

### Step 4: Test the Setup Form
1. Go back to your app
2. Navigate to `/setup-profile`
3. Fill out the form with your details
4. **Open browser developer tools** (F12)
5. Go to the **Console** tab
6. Submit the form and watch for the debug messages:
   - `🔍 Starting profile setup for user:`
   - `✅ Profile updated successfully`
   - `✅ Therapist data saved successfully`

### Step 5: Test the Dashboard
1. After successful profile setup, go to `/dashboard`
2. Check the browser console for debug messages:
   - `🔍 Profile query result:`
   - `✅ Therapist profile found:`
   - `✅ Therapist data prepared:`

## 🔍 Debugging

### If Step 4 fails (Setup Form Issues):
Look for these console messages:
- `❌ Profile update error:` - Database permission issue
- `❌ Therapist save error:` - Therapists table issue
- `❌ Unexpected error:` - General error

### If Step 5 fails (Dashboard Issues):
Look for these console messages:
- `❌ User exists but role is not 'therapist':` - Role not set correctly
- `⚠️ Profile exists but no therapist data in therapists table` - Missing therapist data
- `❌ No therapist profile found` - Profile doesn't exist

## 🛠️ Common Fixes

### Fix 1: RLS Policy Issues
If you get permission errors, run:
```sql
-- Grant all permissions to authenticated users (for testing)
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON therapists TO authenticated;
GRANT ALL ON therapist_availability TO authenticated;
GRANT ALL ON appointments TO authenticated;
```

### Fix 2: Missing Tables
If tables don't exist, run the `setup_database.sql` script again.

### Fix 3: Wrong Role
If your role is not 'therapist', run:
```sql
UPDATE profiles SET role = 'therapist' WHERE id = auth.uid();
```

### Fix 4: Missing Therapist Data
If you have a profile but no therapist data, run:
```sql
INSERT INTO therapists (id, specialization, license_number)
VALUES (auth.uid(), 'General Therapy', 'PENDING')
ON CONFLICT (id) DO NOTHING;
```

## ✅ Success Indicators

You'll know it's working when you see:
1. ✅ All tables exist in the database
2. ✅ Profile exists with role = 'therapist'
3. ✅ Therapist data exists in therapists table
4. ✅ Setup form saves without errors
5. ✅ Dashboard loads without "Profile Not Found" error
6. ✅ You can see your therapist information in the dashboard

## 🆘 Still Having Issues?

If you're still having problems:

1. **Check the Network Tab** in browser dev tools for failed API calls
2. **Verify your Supabase URL and API key** in your environment variables
3. **Check if you're properly authenticated** by testing `supabase.auth.getUser()`
4. **Look for any TypeScript errors** that might be preventing the component from rendering

## 📞 Get Help

If none of the above works, please share:
1. The console output from the setup form
2. The console output from the dashboard
3. The results of the `test_therapist_profile.sql` script
4. Any error messages you see 