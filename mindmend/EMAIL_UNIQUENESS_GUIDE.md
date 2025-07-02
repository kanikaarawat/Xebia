# Email Uniqueness Guide

## Overview

This guide explains how the MindMend application prevents duplicate email registrations and provides user-friendly error handling.

## How Email Uniqueness Works

### 1. Database Level Protection
- The `profiles` table has a `UNIQUE` constraint on the `email` column
- This prevents duplicate emails at the database level
- Supabase automatically enforces this constraint

### 2. Application Level Validation
- Before attempting registration, the app checks if the email already exists
- This provides faster feedback to users
- Prevents unnecessary API calls to Supabase Auth

### 3. Error Handling
- User-friendly error messages for different scenarios
- Clear guidance on what to do when email already exists
- Direct links to sign-in page for existing users

## Implementation Details

### Email Existence Check
```typescript
const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No rows returned - email doesn't exist
      return false;
    }
    
    // If we get data, email exists
    return !!data;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};
```

### User-Friendly Error Messages
```typescript
const getErrorMessage = (error: any): string => {
  if (!error) return 'An error occurred';
  
  const message = error.message || error.toString();
  
  // Check for specific Supabase auth errors
  if (message.includes('User already registered')) {
    return 'This email is already registered. Please try signing in instead.';
  }
  
  if (message.includes('duplicate key value violates unique constraint')) {
    return 'This email is already registered. Please try signing in instead.';
  }
  
  // ... other error cases
  
  return message;
};
```

## Testing Scenarios

### 1. New Email Registration
**Steps:**
1. Go to `/signup` or `/register`
2. Enter a new email address
3. Fill in password and role
4. Submit the form

**Expected Result:**
- Registration succeeds
- User receives confirmation email
- Redirected to profile setup

### 2. Existing Email Registration
**Steps:**
1. Go to `/signup` or `/register`
2. Enter an email that's already registered
3. Fill in password and role
4. Submit the form

**Expected Result:**
- Error message: "This email is already registered. Please try signing in instead."
- "Sign in here" link appears below the error
- Form remains on the same page

### 3. Invalid Email Format
**Steps:**
1. Go to `/signup` or `/register`
2. Enter an invalid email format (e.g., "invalid-email")
3. Fill in password and role
4. Submit the form

**Expected Result:**
- Error message: "Please enter a valid email address."
- Form validation prevents submission

### 4. Weak Password
**Steps:**
1. Go to `/signup` or `/register`
2. Enter a valid email
3. Enter a password less than 6 characters
4. Submit the form

**Expected Result:**
- Error message: "Password must be at least 6 characters long."
- Form validation prevents submission

## Error Messages Reference

| Error Type | Message | Action |
|------------|---------|--------|
| Email already exists | "This email is already registered. Please try signing in instead." | Shows "Sign in here" link |
| Invalid email format | "Please enter a valid email address." | User must correct email |
| Weak password | "Password must be at least 6 characters long." | User must use stronger password |
| Password mismatch | "Passwords do not match" | User must match passwords |
| Network error | "An error occurred" | User should try again |

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,  -- This ensures email uniqueness
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  role text CHECK (role IN ('user', 'therapist', 'admin')) DEFAULT 'user',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

## Security Considerations

### 1. Rate Limiting
- Consider implementing rate limiting on registration endpoints
- Prevent brute force attempts to check email existence

### 2. Information Disclosure
- The email existence check could potentially reveal registered emails
- Consider implementing CAPTCHA or other anti-bot measures

### 3. Email Verification
- All registrations require email verification
- Unverified accounts cannot access the application

## Troubleshooting

### Common Issues

1. **"Email already exists" but user can't sign in**
   - Check if email is verified in Supabase Auth
   - User may need to reset password

2. **Registration fails with database error**
   - Check if profiles table exists
   - Verify UNIQUE constraint is properly set

3. **Error checking email existence**
   - Check RLS policies on profiles table
   - Verify database permissions

### Debug Queries

```sql
-- Check if email exists in profiles
SELECT * FROM profiles WHERE email = 'test@example.com';

-- Check auth.users table
SELECT * FROM auth.users WHERE email = 'test@example.com';

-- Check for duplicate emails
SELECT email, COUNT(*) 
FROM profiles 
GROUP BY email 
HAVING COUNT(*) > 1;
```

## Best Practices

1. **Always validate email format** before checking existence
2. **Use consistent error messages** across all registration forms
3. **Provide clear next steps** when email already exists
4. **Log registration attempts** for security monitoring
5. **Test with various email formats** (uppercase, spaces, etc.)

## Future Enhancements

1. **Real-time email validation** as user types
2. **Email suggestions** for common typos
3. **Social login integration** to prevent duplicate accounts
4. **Account recovery options** for forgotten passwords
5. **Email change functionality** with verification 