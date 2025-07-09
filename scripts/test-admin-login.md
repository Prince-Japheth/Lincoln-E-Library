# Admin Login Test Guide

## Issue Resolution

The admin login issue has been fixed with the following improvements:

1. **Enhanced Error Handling**: Added better error logging and user feedback
2. **Middleware Protection**: Added role-based routing middleware
3. **Database Setup**: Created admin user setup script
4. **Notification System**: Added admin notification bell for book requests

## Testing Steps

### 1. Database Setup
First, ensure the admin user is properly set up in your database:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Create a new user with:
   - Email: `admin@lincoln.edu`
   - Password: `LincolnAdmin123!`

4. Run the admin setup script in SQL Editor:
```sql
-- Run scripts/setup-admin.sql
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
```

### 2. Test Admin Login

1. Go to `/auth/login`
2. Click on the "Admin" tab
3. Enter credentials:
   - Email: `admin@lincoln.edu`
   - Password: `LincolnAdmin123!`
4. Click "Admin Sign In"

### 3. Expected Behavior

- **Successful Login**: Should redirect to `/admin` dashboard
- **Console Logs**: Check browser console for role and redirect information
- **Admin Dashboard**: Should show admin interface with book management

### 4. Troubleshooting

If login still doesn't work:

1. **Check Console**: Look for error messages in browser console
2. **Verify Database**: Ensure admin user profile exists with role='admin'
3. **Check Network**: Verify Supabase connection in Network tab
4. **Clear Cache**: Clear browser cache and try again

### 5. Admin Features to Test

Once logged in as admin, test these features:

1. **Book Management**:
   - Upload new books
   - Edit existing books
   - Make books public/private
   - Assign courses to books

2. **Request Management**:
   - View pending book requests
   - Approve/deny requests
   - Send notifications to users

3. **Notifications**:
   - Check notification bell in header
   - Mark notifications as read
   - View notification history

4. **User Management**:
   - View all user profiles
   - See user roles and statistics

## Site Behavior Verification

### Public Access (No Login)
- Visit homepage
- Should see only public books
- Call-to-action to sign up for full access

### Student Access (After Login)
- Sign up as a new student
- Should access both public and private books
- Can filter by course
- Can request new books

### Admin Access (After Login)
- Should be redirected to admin dashboard
- Full control over all features
- Notification system for requests

## Common Issues and Solutions

### Issue: Admin login redirects to dashboard instead of admin panel
**Solution**: Check that the user profile has `role = 'admin'` in the database

### Issue: No notifications appear
**Solution**: Ensure the notifications table exists and RLS policies are set up

### Issue: Books not showing up
**Solution**: Verify that books are marked as `is_public = true` for public access

### Issue: Course filtering not working
**Solution**: Check that courses are properly assigned to books in the database 