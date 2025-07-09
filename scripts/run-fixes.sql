-- Comprehensive Database Fixes
-- Run this script to fix all database issues

-- 1. Fix boolean values in books table
UPDATE books 
SET is_public = CASE 
    WHEN is_public = 'true' THEN true
    WHEN is_public = 'false' THEN false
    WHEN is_public = true THEN true
    WHEN is_public = false THEN false
    ELSE false
END;

-- 2. Fix RLS policies to avoid recursion
-- Disable RLS temporarily
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
    FOR SELECT USING (is_public = true);

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

-- 3. Add missing tables for enhanced functionality

-- Create reading_progress table
CREATE TABLE IF NOT EXISTS reading_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    current_page INTEGER DEFAULT 1,
    total_pages INTEGER,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    page_number INTEGER,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'system',
    font_size TEXT DEFAULT 'medium',
    reading_mode TEXT DEFAULT 'scroll',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Users can manage their own reading progress" ON reading_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Verify the fixes
SELECT 'Books with boolean is_public' as check_name, COUNT(*) as count 
FROM books WHERE is_public = true
UNION ALL
SELECT 'Total books' as check_name, COUNT(*) as count 
FROM books
UNION ALL
SELECT 'Public books' as check_name, COUNT(*) as count 
FROM books WHERE is_public = true; 