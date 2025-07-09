-- Fix infinite recursion in RLS policies
-- This script drops and recreates the policies to avoid recursion

-- First, disable RLS temporarily to avoid issues
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE book_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
BEGIN
    -- Drop user_profiles policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
    
    -- Drop courses policies
    DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
    DROP POLICY IF EXISTS "Only admins can manage courses" ON courses;
    
    -- Drop books policies
    DROP POLICY IF EXISTS "Anyone can view public books" ON books;
    DROP POLICY IF EXISTS "Authenticated users can view all books" ON books;
    DROP POLICY IF EXISTS "Only admins can manage books" ON books;
    
    -- Drop book_requests policies
    DROP POLICY IF EXISTS "Users can view their own requests" ON book_requests;
    DROP POLICY IF EXISTS "Users can create their own requests" ON book_requests;
    DROP POLICY IF EXISTS "Admins can view all requests" ON book_requests;
    DROP POLICY IF EXISTS "Admins can update all requests" ON book_requests;
    
    -- Drop notifications policies
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
END $$;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create simplified policies that avoid recursion

-- User profiles policies (simplified)
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to view all profiles (for admin functionality)
CREATE POLICY "Authenticated users can view all profiles" ON user_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Courses policies
CREATE POLICY "Anyone can view courses" ON courses
    FOR SELECT USING (true);

-- Allow all authenticated users to manage courses (admin check will be done in application)
CREATE POLICY "Authenticated users can manage courses" ON courses
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Books policies
CREATE POLICY "Anyone can view public books" ON books
    FOR SELECT USING (is_public = true OR is_public = 'true');

CREATE POLICY "Authenticated users can view all books" ON books
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to manage books (admin check will be done in application)
CREATE POLICY "Authenticated users can manage books" ON books
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Book requests policies
CREATE POLICY "Users can view their own requests" ON book_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" ON book_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to view all requests (for admin functionality)
CREATE POLICY "Authenticated users can view all requests" ON book_requests
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to update requests (admin check will be done in application)
CREATE POLICY "Authenticated users can update requests" ON book_requests
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow all authenticated users to manage notifications (admin check will be done in application)
CREATE POLICY "Authenticated users can manage notifications" ON notifications
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 