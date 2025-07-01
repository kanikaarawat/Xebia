# Therapist Dashboard Setup

## Database Setup

### 1. Create Therapists Table

Run the following SQL in your Supabase SQL editor:

```sql
-- Create therapists table if it doesn't exist
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  license_number text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_therapists_specialization ON therapists(specialization);
CREATE INDEX IF NOT EXISTS idx_therapists_license_number ON therapists(license_number);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_therapists_updated_at 
    BEFORE UPDATE ON therapists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Table Structure

The `therapists` table has the following structure:

- `id` (uuid, primary key) - References profiles(id) with cascade delete
- `specialization` (text, required) - Therapist's area of specialization
- `license_number` (text, required) - Professional license number
- `created_at` (timestamp) - Record creation timestamp
- `updated_at` (timestamp) - Last update timestamp

## How It Works

### 1. Signup Process
1. User signs up as "Therapist"
2. Role is saved in user metadata
3. Email confirmation creates basic profile
4. User completes profile setup with specialization and license

### 2. Profile Setup
- Regular users: Only basic profile fields
- Therapists: Basic profile + specialization + license number
- Therapist data is saved to both `profiles` and `therapists` tables

### 3. Dashboard Display
- Dashboard fetches therapist profile with specialization and license
- Displays personalized greeting with therapist's name
- Shows specialization and license badges
- Includes therapist info card with all details

## Features

### Therapist Dashboard Features:
- ✅ **Personalized Greeting** - Shows "Good morning/afternoon/evening, Dr. [Last Name]"
- ✅ **Profile Display** - Shows full name, email, specialization, license
- ✅ **Avatar Support** - Uses profile avatar or initials fallback
- ✅ **Dynamic Content** - All data fetched from database
- ✅ **Error Handling** - Graceful fallback if profile not found
- ✅ **Loading States** - Proper loading indicators

### API Endpoints:
- `GET /api/therapists` - Fetch all therapist profiles (for admin/testing)

## Testing

### 1. Create a Therapist Account:
1. Go to `/signup`
2. Select "Therapist" role
3. Complete signup and email confirmation
4. Complete profile setup with specialization and license

### 2. Verify Database:
Check that data exists in both tables:
```sql
-- Check profiles table
SELECT * FROM profiles WHERE role = 'therapist';

-- Check therapists table
SELECT * FROM therapists;
```

### 3. Test Dashboard:
1. Login as therapist
2. Navigate to `/dashboard`
3. Should see therapist dashboard with personalized content
4. Check console logs for debugging information

## Troubleshooting

### Common Issues:

1. **"Profile Not Found" Error**
   - Ensure therapist completed profile setup
   - Check that therapists table exists
   - Verify role is set to "therapist" in profiles table

2. **Missing Specialization/License**
   - Check therapists table has data
   - Verify profile setup was completed
   - Check console logs for errors

3. **Dashboard Shows User Dashboard**
   - Verify role is correctly set in profiles table
   - Check dashboard is fetching from profiles table, not user metadata

### Debug Commands:
```sql
-- Check if therapist profile exists
SELECT p.*, t.* 
FROM profiles p 
LEFT JOIN therapists t ON p.id = t.id 
WHERE p.role = 'therapist';

-- Check specific therapist
SELECT p.*, t.* 
FROM profiles p 
LEFT JOIN therapists t ON p.id = t.id 
WHERE p.email = 'therapist@example.com';
``` 