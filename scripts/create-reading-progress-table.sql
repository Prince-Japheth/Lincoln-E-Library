-- Create reading_progress table for tracking user reading activity
-- Run this script in your Supabase SQL Editor

-- Create reading_progress table
CREATE TABLE IF NOT EXISTS reading_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    current_page INTEGER DEFAULT 1,
    total_pages INTEGER,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 0,
    session_start_time TIMESTAMP WITH TIME ZONE,
    session_end_time TIMESTAMP WITH TIME ZONE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Enable Row Level Security
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reading_progress
CREATE POLICY "Users can manage their own reading progress" ON reading_progress
    FOR ALL USING (auth.uid() = user_id);

-- Allow admins to view all reading progress
CREATE POLICY "Admins can view all reading progress" ON reading_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read_at ON reading_progress(last_read_at);

-- Add comments for documentation
COMMENT ON TABLE reading_progress IS 'Tracks user reading progress for books';
COMMENT ON COLUMN reading_progress.user_id IS 'Reference to auth.users';
COMMENT ON COLUMN reading_progress.book_id IS 'Reference to books table';
COMMENT ON COLUMN reading_progress.current_page IS 'Current page the user is reading';
COMMENT ON COLUMN reading_progress.total_pages IS 'Total pages in the book';
COMMENT ON COLUMN reading_progress.progress_percentage IS 'Percentage of book completed (0-100)';
COMMENT ON COLUMN reading_progress.reading_time_minutes IS 'Actual reading time in minutes';
COMMENT ON COLUMN reading_progress.session_start_time IS 'When the reading session started';
COMMENT ON COLUMN reading_progress.session_end_time IS 'When the reading session ended';
COMMENT ON COLUMN reading_progress.last_read_at IS 'Timestamp of last reading activity'; 