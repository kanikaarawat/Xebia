# Therapist Availability Management

## Overview

The Availability tab in the Therapist Dashboard allows therapists to set their weekly availability schedule. This feature enables patients to book appointments only during the therapist's available hours.

## Database Setup

### 1. Create Therapist Availability Table

Run the following SQL in your Supabase SQL editor:

```sql
-- Create therapist_availability table if it doesn't exist
CREATE TABLE IF NOT EXISTS therapist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(therapist_id, day_of_week)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_therapist_availability_therapist_id ON therapist_availability(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_availability_day ON therapist_availability(day_of_week);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_therapist_availability_updated_at 
    BEFORE UPDATE ON therapist_availability 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Therapists can only see their own availability
CREATE POLICY "Therapists can view own availability" ON therapist_availability
    FOR SELECT USING (auth.uid() = therapist_id);

-- Policy: Therapists can insert their own availability
CREATE POLICY "Therapists can insert own availability" ON therapist_availability
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);

-- Policy: Therapists can update their own availability
CREATE POLICY "Therapists can update own availability" ON therapist_availability
    FOR UPDATE USING (auth.uid() = therapist_id);

-- Policy: Therapists can delete their own availability
CREATE POLICY "Therapists can delete own availability" ON therapist_availability
    FOR DELETE USING (auth.uid() = therapist_id);
```

### 2. Table Structure

The `therapist_availability` table has the following structure:

- `id` (uuid, primary key) - Unique identifier for each availability slot
- `therapist_id` (uuid) - References profiles(id) with cascade delete
- `day_of_week` (text) - Day of the week (Monday-Sunday)
- `start_time` (time) - Start time for availability (HH:MM format)
- `end_time` (time) - End time for availability (HH:MM format)
- `created_at` (timestamp) - Record creation timestamp
- `updated_at` (timestamp) - Last update timestamp

## Features

### Availability Management Features:

- ✅ **Daily Toggle** - Enable/disable availability for each day
- ✅ **Time Inputs** - Set start and end times for each day
- ✅ **Real-time Updates** - Changes are reflected immediately
- ✅ **Save Functionality** - Persist changes to database
- ✅ **Visual Feedback** - Status badges and loading states
- ✅ **Tips Section** - Helpful guidance for setting availability
- ✅ **Summary View** - Quick overview of current availability

### UI Components:

1. **Weekly Schedule Grid**
   - Checkbox to enable/disable each day
   - Time inputs for start and end times
   - Status badges (Available/Unavailable)

2. **Save Button**
   - Saves all changes to database
   - Loading state during save operation
   - Success feedback

3. **Tips Section**
   - Best practices for setting availability
   - Helpful guidance for therapists

4. **Current Availability Summary**
   - Shows number of available days
   - Lists all current availability slots

## How It Works

### 1. Loading Availability
- Component loads existing availability from database
- If no availability exists, initializes with default slots (all unavailable)
- Each day starts with 9:00 AM - 5:00 PM default times

### 2. Setting Availability
- Therapist can toggle availability for each day
- Time inputs are disabled when day is unavailable
- Changes are tracked in local state

### 3. Saving Availability
- Only saves days that are marked as available
- Deletes existing availability and inserts new slots
- Provides loading feedback during save operation

### 4. Data Validation
- Ensures end time is after start time
- Validates day names (Monday-Sunday)
- Prevents duplicate entries per therapist/day

## Usage

### For Therapists:

1. **Access Availability Tab**
   - Navigate to Therapist Dashboard
   - Click on "Availability" tab

2. **Set Weekly Schedule**
   - Check/uncheck days you're available
   - Set start and end times for each available day
   - Use 24-hour format (e.g., 09:00, 17:00)

3. **Save Changes**
   - Click "Save Availability" button
   - Wait for confirmation

4. **Review Summary**
   - Check the right sidebar for current availability
   - Verify your settings are correct

### Best Practices:

1. **Set Realistic Hours**
   - Choose times you can consistently maintain
   - Consider your energy levels throughout the day

2. **Include Buffer Time**
   - Leave time between appointments for notes
   - Account for breaks and emergencies

3. **Regular Updates**
   - Update availability when your schedule changes
   - Communicate changes to existing patients

4. **Consistency**
   - Try to maintain consistent hours
   - Avoid frequent changes that confuse patients

## Integration with Booking System

The availability data will be used by the patient booking system to:

1. **Show Available Slots** - Only display times when therapist is available
2. **Prevent Double Booking** - Ensure no overlapping appointments
3. **Time Zone Handling** - Convert times to patient's timezone
4. **Real-time Updates** - Reflect changes immediately in booking interface

## Troubleshooting

### Common Issues:

1. **"No availability found"**
   - Check if therapist has set any availability
   - Verify database table exists
   - Check RLS policies

2. **"Save failed"**
   - Check network connection
   - Verify therapist permissions
   - Check console for error messages

3. **"Time validation error"**
   - Ensure end time is after start time
   - Check time format (HH:MM)
   - Verify day names are correct

### Debug Commands:
```sql
-- Check therapist availability
SELECT * FROM therapist_availability WHERE therapist_id = 'therapist-uuid';

-- Check all availability
SELECT p.first_name, p.last_name, ta.* 
FROM therapist_availability ta 
JOIN profiles p ON ta.therapist_id = p.id;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'therapist_availability';
```

## Future Enhancements

Potential improvements for the availability system:

1. **Recurring Patterns** - Set availability for specific weeks/months
2. **Exception Dates** - Mark specific dates as unavailable
3. **Multiple Time Slots** - Allow multiple time ranges per day
4. **Template Schedules** - Save and reuse common schedules
5. **Integration with Calendar** - Sync with external calendar systems
6. **Notification System** - Alert patients of availability changes 