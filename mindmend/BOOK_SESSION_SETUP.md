# Book Session Setup Guide

This guide will help you set up the book session functionality using the therapist availability table.

## Prerequisites

1. **Database Tables**: Ensure you have the following tables set up:
   - `profiles` - User profiles
   - `therapists` - Therapist-specific data
   - `therapist_availability` - Daily availability schedules
   - `appointments` - Booked sessions

2. **Authentication**: Users must be logged in to book sessions

## Step 1: Add Therapist Data

First, ensure you have therapists in your database:

1. **Create a therapist profile**:
   ```sql
   -- Update an existing user to be a therapist
   UPDATE profiles 
   SET role = 'therapist', 
       first_name = 'Dr. Sarah', 
       last_name = 'Johnson'
   WHERE id = 'your-user-id-here';
   
   -- Add therapist data
   INSERT INTO therapists (id, specialization, license_number)
   VALUES ('your-user-id-here', 'Cognitive Behavioral Therapy', 'CBT123456')
   ON CONFLICT (id) DO NOTHING;
   ```

## Step 2: Add Availability Data

Run the seed script to add availability for all therapists:

1. **Go to your Supabase SQL editor**
2. **Run the `seed_therapist_availability.sql` script**
3. **This will add Monday-Friday, 9 AM - 5 PM availability for all therapists**

## Step 3: Test the Setup

1. **Visit the debug page**: Go to `http://localhost:3000/debug`
2. **Check the following sections**:
   - Therapists Table: Should show your therapists
   - Availability Table: Should show availability records
   - Get Free Slots Test: Should show available time slots

## Step 4: Use the Book Session Page

1. **Navigate to**: `http://localhost:3000/dashboard/book-session`
2. **Select a therapist** from the dropdown
3. **Choose a date** (Monday-Friday for default availability)
4. **Select a time slot** from the available options
5. **Choose session type** and add notes
6. **Book the session**

## How It Works

### 1. Therapist Selection
- Fetches all therapists with their profile information
- Shows name, specialization, and avatar
- Displays selected therapist details

### 2. Availability Calculation
The `getFreeSlots` function:
1. **Gets the day of week** from the selected date
2. **Fetches therapist availability** for that day
3. **Generates time slots** using the `slotGenerator` utility
4. **Filters out booked appointments** for that date
5. **Returns available slots**

### 3. Booking Process
1. **Validates all required fields**
2. **Creates appointment record** in the database
3. **Shows success message**
4. **Redirects to dashboard**

## Troubleshooting

### No Therapists Showing
1. **Check debug page** for therapist data
2. **Ensure profiles have role = 'therapist'**
3. **Verify therapists table has entries**

### No Available Slots
1. **Check availability table** has data for the selected day
2. **Verify the date is Monday-Friday** (default availability)
3. **Check console logs** for slot generation errors

### Booking Fails
1. **Check browser console** for error messages
2. **Verify appointments table exists**
3. **Check RLS policies** allow appointment creation

## Database Schema

### therapist_availability Table
```sql
CREATE TABLE therapist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES profiles(id),
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(therapist_id, day_of_week)
);
```

### appointments Table
```sql
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id),
  therapist_id uuid NOT NULL REFERENCES profiles(id),
  scheduled_at timestamp NOT NULL,
  duration integer DEFAULT 30,
  type text NOT NULL,
  notes text,
  status text DEFAULT 'upcoming',
  created_at timestamp DEFAULT now()
);
```

## Customization

### Add Different Availability
To add availability for different days/times:

```sql
INSERT INTO therapist_availability (therapist_id, day_of_week, start_time, end_time)
VALUES 
    ('therapist-id', 'Saturday', '10:00', '16:00'),
    ('therapist-id', 'Sunday', '10:00', '16:00');
```

### Modify Slot Duration
Change the interval in the `getFreeSlots` function call:
```typescript
const freeSlots = await getFreeSlots(therapistId, date, 60); // 60-minute slots
```

### Add More Session Types
Update the session type options in the book session page:
```typescript
<SelectItem value="Group Session">Group Session</SelectItem>
<SelectItem value="Emergency">Emergency</SelectItem>
```

## Testing

1. **Create test appointments** to verify booking works
2. **Test different dates** to ensure availability is correct
3. **Verify appointments appear** in the dashboard
4. **Check that booked slots** are no longer available

## Next Steps

Once the basic booking is working:
1. **Add email notifications** for booked appointments
2. **Implement appointment cancellation**
3. **Add recurring appointment options**
4. **Create appointment reminders**
5. **Add payment integration** 