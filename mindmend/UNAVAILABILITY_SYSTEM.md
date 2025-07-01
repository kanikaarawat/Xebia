# Therapist Unavailability System

## Overview

The MindMend application now uses a dedicated `therapist_unavailability` table to track when therapists are unavailable due to booked sessions. This provides better performance and more accurate availability tracking.

## Database Structure

### 1. **therapist_unavailability Table**
```sql
CREATE TABLE therapist_unavailability (
    id UUID PRIMARY KEY,
    therapist_id UUID REFERENCES therapists(id),
    appointment_id UUID REFERENCES appointments(id),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    reason TEXT DEFAULT 'Booked session',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **Automatic Triggers**
- **INSERT trigger**: Automatically creates unavailability when appointment is created
- **DELETE trigger**: Automatically removes unavailability when appointment is deleted

## How It Works

### 1. **When a Session is Booked**
1. User books appointment in `appointments` table
2. Trigger automatically creates record in `therapist_unavailability` table
3. Unavailability covers the entire session duration
4. Reason includes session type (e.g., "Booked session - Video Call")

### 2. **When Checking Availability**
1. System fetches from `therapist_availability` (base availability)
2. System fetches from `therapist_unavailability` (blocked times)
3. Generates time slots from base availability
4. Filters out slots that overlap with unavailability
5. Returns available and unavailable slots with reasons

### 3. **Therapist Name Resolution**
- `therapists` table has `id` that references `profiles(id)`
- Names are fetched from `profiles` table using the relationship
- Query: `therapists.profiles(first_name, last_name, avatar_url)`

## Setup Instructions

### Step 1: Create the Unavailability Table
```sql
-- Run in Supabase SQL Editor
\i create_therapist_unavailability_table.sql
```

### Step 2: Migrate Existing Data
```sql
-- Run in Supabase SQL Editor
\i migrate_to_unavailability.sql
```

### Step 3: Verify Setup
```sql
-- Check if everything is working
SELECT 
    'Setup verification' as info,
    (SELECT COUNT(*) FROM appointments) as appointments,
    (SELECT COUNT(*) FROM therapist_unavailability) as unavailability_records,
    (SELECT COUNT(*) FROM therapist_availability) as availability_records;
```

## Key Benefits

### 1. **Better Performance**
- Dedicated table for unavailability tracking
- Optimized indexes for date range queries
- Faster availability calculations

### 2. **More Accurate Tracking**
- Direct relationship between appointments and unavailability
- Automatic cleanup when appointments are cancelled
- Detailed reason tracking

### 3. **Easier Debugging**
- Clear separation of availability vs unavailability
- Detailed logging of blocked time periods
- Easy to query and verify data

## API Changes

### Updated getFreeSlots Function
```typescript
// Old: Fetched from appointments table
const { data: appointments } = await supabase
  .from("appointments")
  .select("scheduled_at, duration")

// New: Fetches from therapist_unavailability table
const { data: unavailability } = await supabase
  .from("therapist_unavailability")
  .select("start_time, end_time, reason")
  .eq("therapist_id", therapist_id)
  .gte("start_time", `${date}T00:00:00`)
  .lt("start_time", `${date}T23:59:59`)
```

### Updated Therapist Fetching
```typescript
// New: Proper profiles relationship
const { data } = await supabase
  .from('therapists')
  .select(`
    id,
    specialization,
    license_number,
    profiles(
      first_name,
      last_name,
      avatar_url
    )
  `)
```

## Testing the System

### 1. **Book a Session**
- Go to `/dashboard/book-session`
- Select therapist, date, time, and duration
- Complete booking
- Check that unavailability record is created

### 2. **Verify Unavailability**
```sql
-- Check unavailability for a specific date
SELECT 
    tu.start_time,
    tu.end_time,
    tu.reason,
    p.first_name || ' ' || p.last_name as therapist_name
FROM therapist_unavailability tu
JOIN therapists t ON tu.therapist_id = t.id
JOIN profiles p ON t.id = p.id
WHERE DATE(tu.start_time) = '2025-01-06'
ORDER BY tu.start_time;
```

### 3. **Test Availability Display**
- Go to booking page
- Select a date with existing appointments
- Verify unavailable slots are shown with red X icons
- Verify available slots are clickable

## Troubleshooting

### Issue: Therapist Names Not Showing
```sql
-- Check if profiles exist for therapists
SELECT 
    t.id,
    p.first_name,
    p.last_name,
    t.specialization
FROM therapists t
LEFT JOIN profiles p ON t.id = p.id
WHERE p.id IS NULL;
```

### Issue: Unavailability Not Created
```sql
-- Check if triggers are working
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'appointments';
```

### Issue: Slots Not Blocked
```sql
-- Check unavailability records
SELECT 
    COUNT(*) as unavailability_count,
    MIN(start_time) as earliest,
    MAX(end_time) as latest
FROM therapist_unavailability
WHERE therapist_id = 'your-therapist-id';
```

## Migration Notes

### From Old System
- **Old**: Checked appointments table for conflicts
- **New**: Checks therapist_unavailability table
- **Benefit**: Better performance and accuracy

### Data Migration
- Existing appointments are automatically migrated
- No data loss during transition
- Backward compatibility maintained

## Best Practices

1. **Always use the unavailability table** for availability checks
2. **Let triggers handle** unavailability creation/deletion
3. **Use proper date ranges** when querying unavailability
4. **Monitor trigger performance** for large datasets
5. **Regular cleanup** of old unavailability records

This system provides a robust, scalable solution for managing therapist availability with automatic conflict prevention and detailed tracking. 