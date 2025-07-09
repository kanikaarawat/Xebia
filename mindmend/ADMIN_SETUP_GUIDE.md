# Admin Dashboard Setup Guide

## Overview

The admin dashboard requires specific RLS (Row Level Security) policies to access all data across the application. This guide will help you set up admin access properly.

## Prerequisites

1. You need to be logged into your Supabase project
2. You need your user ID (found in browser console or auth.users table)
3. You need the `SUPABASE_SERVICE_ROLE_KEY` environment variable set

## Step 1: Set Up RLS Policies

### Option A: Comprehensive Admin Policies (Recommended)

Run the `admin_rls_policies.sql` script in your Supabase SQL Editor. This creates:
- Admin policies for all tables (profiles, therapists, appointments, etc.)
- A function to check if user is admin
- Policies that allow admins full CRUD access

### Option B: Simple Admin Policies

Run the `admin_service_role_setup.sql` script instead. This creates:
- Simpler policies using a single function
- Full access for admin users
- Less complex policy structure

## Step 2: Make Yourself an Admin

Run the `make_admin.sql` script in your Supabase SQL Editor. This will:
- Check your current user status
- Update your profile to have `role = 'admin'`
- Verify the change was successful

## Step 3: Set Up Environment Variables

Add the service role key to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:** The service role key bypasses RLS entirely, so keep it secure and only use it in server-side code.

## Step 4: Verify Admin Access

1. **Check your profile role:**
   ```sql
   SELECT role FROM profiles WHERE id = auth.uid();
   ```

2. **Test admin function:**
   ```sql
   SELECT is_admin();
   ```

3. **Test data access:**
   ```sql
   -- Should return all profiles if you're admin
   SELECT COUNT(*) FROM profiles;
   ```

## Step 5: Access the Admin Dashboard

1. Navigate to `/admin` in your application
2. You should see the admin dashboard with tabs for:
   - Appointments management
   - Users management  
   - Therapists management
   - Analytics
   - Backup/Restore

## Troubleshooting

### "Permission denied" errors

1. **Check if you're admin:**
   ```sql
   SELECT role FROM profiles WHERE id = auth.uid();
   ```

2. **Verify RLS policies exist:**
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename IN ('profiles', 'therapists', 'appointments')
   AND policyname LIKE '%admin%';
   ```

3. **Check service role key:**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in environment
   - Verify the key is correct in Supabase dashboard

### "No data" in admin dashboard

1. **Check if data exists:**
   ```sql
   SELECT COUNT(*) FROM profiles;
   SELECT COUNT(*) FROM appointments;
   SELECT COUNT(*) FROM therapists;
   ```

2. **Test API endpoints directly:**
   - Visit `/api/admin/appointments`
   - Visit `/api/admin/users`
   - Visit `/api/admin/therapists`

### Admin dashboard not loading

1. **Check browser console** for JavaScript errors
2. **Verify authentication** - you must be logged in
3. **Check network tab** for failed API requests

## Security Considerations

### RLS Policies
- Admin policies only grant access to users with `role = 'admin'`
- Regular users still have their own restrictive policies
- Service role bypasses RLS entirely (use only server-side)

### Service Role Key
- **Never expose in client-side code**
- Only use in API routes and server functions
- Keep the key secure and rotate regularly

### Admin Access
- Limit admin users to trusted personnel only
- Consider implementing additional authentication for admin routes
- Log all admin actions for audit purposes

## API Endpoints

The admin dashboard uses these API endpoints:

- `GET /api/admin/appointments` - List all appointments
- `POST /api/admin/appointments` - Create appointment
- `PUT /api/admin/appointments` - Update appointment
- `DELETE /api/admin/appointments` - Delete appointment

- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users` - Update user
- `DELETE /api/admin/users` - Delete user

- `GET /api/admin/therapists` - List all therapists
- `POST /api/admin/therapists` - Create therapist
- `PUT /api/admin/therapists` - Update therapist
- `DELETE /api/admin/therapists` - Delete therapist

## Database Schema

The admin dashboard works with these tables:

- `profiles` - User profiles and roles
- `therapists` - Therapist-specific data
- `appointments` - Booking data
- `therapist_availability` - Availability schedules
- `notifications` - System notifications
- `therapist_unavailability` - Blocked time slots

## Next Steps

After setting up admin access:

1. **Test all CRUD operations** in the admin dashboard
2. **Set up additional admin users** if needed
3. **Configure backup/restore functionality**
4. **Set up analytics and reporting**
5. **Implement audit logging** for admin actions

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your user has admin role
3. Test API endpoints directly
4. Check Supabase logs for RLS policy violations
5. Ensure environment variables are set correctly 