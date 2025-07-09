-- Setup Admin User Script
-- Run this after creating the admin user in Supabase Auth

-- First, make sure the admin user exists in auth.users
-- You need to create the user in Supabase Auth dashboard first with:
-- Email: admin@lincoln.edu
-- Password: LincolnAdmin123!

-- Then run this script to create/update the admin profile

-- Check if admin profile exists, if not create it
INSERT INTO user_profiles (user_id, full_name, email, role)
SELECT 
    id,
    'System Administrator',
    'admin@lincoln.edu',
    'admin'
FROM auth.users 
WHERE email = 'admin@lincoln.edu'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'admin',
    full_name = 'System Administrator',
    email = 'admin@lincoln.edu';

-- Verify the admin user was created
SELECT 
    up.id,
    up.full_name,
    up.email,
    up.role,
    up.created_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'admin@lincoln.edu'; 