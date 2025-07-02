-- Debug: Check what emails exist in auth.users table
-- Run this in your Supabase SQL Editor

-- Check all users in auth.users table
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users
ORDER BY created_at DESC;

-- Check if the specific email exists (case insensitive)
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE LOWER(email) = LOWER('Jaanhvi.101756@stu.upes.ac.in');

-- Count total users
SELECT COUNT(*) as total_users FROM auth.users;

-- Check for any emails containing 'Jaanhvi'
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email ILIKE '%Jaanhvi%'; 