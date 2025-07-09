-- Complete database setup with all required functionality
-- Run this script to set up your database properly
-- Clean version that handles existing policies properly

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    profile_picture_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    file_url TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create book requests table
CREATE TABLE IF NOT EXISTS book_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI chat sessions table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI chat messages table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    window_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, endpoint, window_start)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies (this will work even if they don't exist)
DO $$
BEGIN
    -- Drop user_profiles policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON user_profiles;
    
    -- Drop courses policies
    DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
    DROP POLICY IF EXISTS "Only admins can manage courses" ON courses;
    
    -- Drop books policies
    DROP POLICY IF EXISTS "Anyone can view public books" ON books;
    DROP POLICY IF EXISTS "Authenticated users can view all books" ON books;
    DROP POLICY IF EXISTS "Only admins can manage books" ON books;
    DROP POLICY IF EXISTS "Public can read public books" ON books;
    
    -- Drop book_requests policies
    DROP POLICY IF EXISTS "Users can view their own requests" ON book_requests;
    DROP POLICY IF EXISTS "Users can create their own requests" ON book_requests;
    DROP POLICY IF EXISTS "Admins can view all requests" ON book_requests;
    DROP POLICY IF EXISTS "Admins can update all requests" ON book_requests;
    
    -- Drop notifications policies
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
    
    -- Drop AI chat policies
    DROP POLICY IF EXISTS "Users can manage their own chat sessions" ON ai_chat_sessions;
    DROP POLICY IF EXISTS "Users can manage their own chat messages" ON ai_chat_messages;
    
    -- Drop rate_limits policies
    DROP POLICY IF EXISTS "Users can view their own rate limits" ON rate_limits;
    DROP POLICY IF EXISTS "Users can manage their own rate limits" ON rate_limits;
END $$;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to view all profiles (for admin functionality)
CREATE POLICY "Authenticated users can view all profiles" ON user_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for courses
CREATE POLICY "Anyone can view courses" ON courses
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage courses" ON courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for books
CREATE POLICY "Anyone can view public books" ON books
    FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can view all books" ON books
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage books" ON books
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for book_requests
CREATE POLICY "Users can view their own requests" ON book_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" ON book_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests" ON book_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all requests" ON book_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for AI chat sessions
CREATE POLICY "Users can manage their own chat sessions" ON ai_chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for AI chat messages
CREATE POLICY "Users can manage their own chat messages" ON ai_chat_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ai_chat_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for rate_limits
CREATE POLICY "Users can view their own rate limits" ON rate_limits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own rate limits" ON rate_limits
    FOR ALL USING (auth.uid() = user_id);

-- Allow anyone to read public books
CREATE POLICY "Public can read public books"
    ON books FOR SELECT
    USING (is_public = true);

-- Insert sample courses
INSERT INTO courses (name, description) VALUES
    ('Computer Science', 'Programming, algorithms, and software development'),
    ('Mathematics', 'Pure and applied mathematics'),
    ('Physics', 'Classical and modern physics'),
    ('Literature', 'Classic and contemporary literature'),
    ('History', 'World history and historical analysis'),
    ('Biology', 'Life sciences and biological systems'),
    ('Chemistry', 'Chemical principles and applications'),
    ('Psychology', 'Human behavior and mental processes'),
    ('Engineering', 'Various engineering disciplines'),
    ('Business', 'Business administration and management')
ON CONFLICT DO NOTHING;

-- Insert sample public books
INSERT INTO books (title, author, genre, description, is_public, cover_image_url, file_url, course_id) VALUES
    (
        'Introduction to Algorithms',
        'Thomas H. Cormen',
        'Computer Science',
        'A comprehensive introduction to algorithms and data structures.',
        true,
        '/placeholder.svg?height=400&width=300',
        'https://example.com/algorithms.pdf',
        (SELECT id FROM courses WHERE name = 'Computer Science' LIMIT 1)
    ),
    (
        'Calculus: Early Transcendentals',
        'James Stewart',
        'Mathematics',
        'A thorough introduction to calculus concepts and applications.',
        true,
        '/placeholder.svg?height=400&width=300',
        'https://example.com/calculus.pdf',
        (SELECT id FROM courses WHERE name = 'Mathematics' LIMIT 1)
    ),
    (
        'Physics for Scientists and Engineers',
        'Raymond A. Serway',
        'Physics',
        'Comprehensive physics textbook covering mechanics, thermodynamics, and more.',
        true,
        '/placeholder.svg?height=400&width=300',
        'https://example.com/physics.pdf',
        (SELECT id FROM courses WHERE name = 'Physics' LIMIT 1)
    ),
    (
        'Pride and Prejudice',
        'Jane Austen',
        'Literature',
        'A classic novel exploring themes of love, marriage, and social class.',
        true,
        '/placeholder.svg?height=400&width=300',
        'https://example.com/pride-prejudice.pdf',
        (SELECT id FROM courses WHERE name = 'Literature' LIMIT 1)
    ),
    (
        'Advanced Data Structures',
        'Mark Allen Weiss',
        'Computer Science',
        'Advanced concepts in data structures and algorithm analysis.',
        false,
        '/placeholder.svg?height=400&width=300',
        'https://example.com/advanced-ds.pdf',
        (SELECT id FROM courses WHERE name = 'Computer Science' LIMIT 1)
    ),
    (
        'Organic Chemistry',
        'Paula Yurkanis Bruice',
        'Chemistry',
        'Comprehensive guide to organic chemistry principles.',
        false,
        '/placeholder.svg?height=400&width=300',
        'https://example.com/organic-chem.pdf',
        (SELECT id FROM courses WHERE name = 'Chemistry' LIMIT 1)
    ),
    (
        'World History: Patterns of Interaction',
        'Roger B. Beck',
        'History',
        'Comprehensive world history from ancient times to present.',
        true,
        '/placeholder.svg?height=400&width=300',
        'https://example.com/world-history.pdf',
        (SELECT id FROM courses WHERE name = 'History' LIMIT 1)
    ),
    (
        'Principles of Economics',
        'N. Gregory Mankiw',
        'Business',
        'Introduction to microeconomic and macroeconomic principles.',
        true,
        '/placeholder.svg?height=400&width=300',
        'https://example.com/economics.pdf',
        (SELECT id FROM courses WHERE name = 'Business' LIMIT 1)
    )
ON CONFLICT DO NOTHING;

-- Admin user will be created separately through Supabase dashboard
-- After creating the user, run this SQL to create the admin profile:
-- 
-- UPDATE user_profiles 
-- SET user_id = (SELECT id FROM auth.users WHERE email = 'admin@lincoln.edu'),
--     role = 'admin'
-- WHERE email = 'admin@lincoln.edu';
-- 
-- OR if the profile doesn't exist:
-- 
-- INSERT INTO user_profiles (user_id, full_name, email, role) 
-- VALUES (
--     (SELECT id FROM auth.users WHERE email = 'admin@lincoln.edu'),
--     'System Administrator',
--     'admin@lincoln.edu',
--     'admin'
-- ); 