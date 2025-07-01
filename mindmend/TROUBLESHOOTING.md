# Troubleshooting: "Profile Not Found" Error

## Problem
You're seeing the error: "Your therapist profile could not be loaded. Please complete your profile setup."

## Common Causes & Solutions

### 1. **Database Tables Not Created**

**Check if tables exist:**
```sql
-- Check if profiles table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'profiles'
);

-- Check if therapists table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'therapists'
);
```

**Solution:** Run the SQL scripts in order:
1. `create_therapists_table.sql`
2. `create_therapist_availability_table.sql` (if using availability feature)

### 2. **User Role Not Set to 'therapist'**

**Check user role:**
```sql
SELECT id, email, role FROM profiles WHERE id = 'your-user-id';
```

**Solution:** Update the user's role:
```sql
UPDATE profiles 
SET role = 'therapist' 
WHERE id = 'your-user-id';
```

### 3. **Missing Therapist Data in Therapists Table**

**Check therapist data:**
```sql
SELECT p.id, p.first_name, p.last_name, p.role, t.specialization, t.license_number
FROM profiles p
LEFT JOIN therapists t ON p.id = t.id
WHERE p.id = 'your-user-id';
```

**Solution:** If profile exists but no therapist data, run the migration:
```sql
-- Run the migration script
INSERT INTO therapists (id, specialization, license_number)
SELECT 
    id,
    COALESCE(specialization, 'General Therapy') as specialization,
    COALESCE(license_number, 'PENDING') as license_number
FROM profiles 
WHERE id = 'your-user-id' 
    AND role = 'therapist'
    AND id NOT IN (SELECT id FROM therapists);
```

### 4. **RLS (Row Level Security) Issues**

**Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
SELECT * FROM pg_policies WHERE tablename = 'therapists';
```

**Solution:** Ensure RLS policies allow the user to access their data:
```sql
-- For profiles table
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- For therapists table
CREATE POLICY "Therapists can view own data" ON therapists
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Therapists can update own data" ON therapists
    FOR UPDATE USING (auth.uid() = id);
```

### 5. **Profile Not Created During Signup**

**Check if profile exists:**
```sql
SELECT * FROM profiles WHERE id = 'your-user-id';
```

**Solution:** Create the profile manually:
```sql
INSERT INTO profiles (id, email, role, created_at, updated_at)
VALUES ('your-user-id', 'your-email@example.com', 'therapist', now(), now());
```

## Step-by-Step Debugging

### 1. **Check Browser Console**
Open browser developer tools and check the console for error messages. Look for:
- `🔍 Profile query result:`
- `❌ User exists but role is not 'therapist':`
- `⚠️ Profile exists but no therapist data in therapists table`

### 2. **Verify Database State**
Run these queries in your Supabase SQL editor:

```sql
-- Check if user profile exists
SELECT id, email, first_name, last_name, role, created_at 
FROM profiles 
WHERE id = 'your-user-id';

-- Check if therapist data exists
SELECT * FROM therapists WHERE id = 'your-user-id';

-- Check if user is authenticated
SELECT auth.uid() as current_user_id;
```

### 3. **Test Profile Creation**
Try creating a test profile:

```sql
-- Insert test profile (replace with your actual user ID)
INSERT INTO profiles (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
    'your-user-id',
    'test@example.com',
    'Test',
    'Therapist',
    'therapist',
    now(),
    now()
);

-- Insert test therapist data
INSERT INTO therapists (id, specialization, license_number)
VALUES (
    'your-user-id',
    'General Therapy',
    'TEST123'
);
```

## Quick Fix Script

If you're sure the user should be a therapist, run this complete fix:

```sql
-- 1. Ensure profile exists with correct role
INSERT INTO profiles (id, email, role, created_at, updated_at)
VALUES ('your-user-id', 'your-email@example.com', 'therapist', now(), now())
ON CONFLICT (id) DO UPDATE SET role = 'therapist';

-- 2. Ensure therapist data exists
INSERT INTO therapists (id, specialization, license_number)
VALUES ('your-user-id', 'General Therapy', 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- 3. Verify the fix
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.role,
    t.specialization,
    t.license_number
FROM profiles p
LEFT JOIN therapists t ON p.id = t.id
WHERE p.id = 'your-user-id';
```

## Prevention

To prevent this issue in the future:

1. **Always run database migrations** when setting up the project
2. **Test the signup flow** for both users and therapists
3. **Verify RLS policies** are correctly configured
4. **Check console logs** during development for any errors

## Still Having Issues?

If none of the above solutions work:

1. **Check the network tab** in browser dev tools for failed API calls
2. **Verify Supabase configuration** in your environment variables
3. **Check if the user is properly authenticated** by testing `supabase.auth.getUser()`
4. **Look for any TypeScript errors** that might be preventing the component from rendering

## Common Error Messages

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "relation 'profiles' does not exist" | Table not created | Run `create_therapists_table.sql` |
| "relation 'therapists' does not exist" | Table not created | Run `create_therapists_table.sql` |
| "new row violates row-level security policy" | RLS policy issue | Check and fix RLS policies |
| "duplicate key value violates unique constraint" | Data already exists | Use `ON CONFLICT` in INSERT |
| "column 'role' does not exist" | Missing column | Add role column to profiles table | 