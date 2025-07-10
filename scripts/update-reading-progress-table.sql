-- Update existing reading_progress table with new fields
-- Run this script in your Supabase SQL Editor

-- First, check if the new columns exist, if not add them
DO $$
BEGIN
    -- Add reading_time_minutes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reading_progress' AND column_name = 'reading_time_minutes'
    ) THEN
        ALTER TABLE reading_progress ADD COLUMN reading_time_minutes INTEGER DEFAULT 0;
        RAISE NOTICE 'Added reading_time_minutes column';
    END IF;

    -- Add session_start_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reading_progress' AND column_name = 'session_start_time'
    ) THEN
        ALTER TABLE reading_progress ADD COLUMN session_start_time TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added session_start_time column';
    END IF;

    -- Add session_end_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reading_progress' AND column_name = 'session_end_time'
    ) THEN
        ALTER TABLE reading_progress ADD COLUMN session_end_time TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added session_end_time column';
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own reading progress" ON reading_progress;
DROP POLICY IF EXISTS "Admins can view all reading progress" ON reading_progress;

-- Create updated policies
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

-- Create indexes if they don't exist
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

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'reading_progress' 
ORDER BY ordinal_position; 