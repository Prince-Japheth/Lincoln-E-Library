-- Migration script to support draft status for books
-- This script updates the books table to allow NULL values for is_public
-- Run this script to enable the new draft status functionality

-- Step 1: Update the books table to allow NULL values for is_public
-- First, we need to handle existing data that might have issues
-- Convert any existing books with is_public = false to have is_public = false (private)
-- Convert any existing books with is_public = true to have is_public = true (public)
-- New books can have is_public = NULL (draft)

-- Update the column to allow NULL values
ALTER TABLE books ALTER COLUMN is_public DROP NOT NULL;

-- Update the default value to NULL (draft) instead of true
ALTER TABLE books ALTER COLUMN is_public SET DEFAULT NULL;

-- Step 2: Update RLS policies to handle the new draft status
-- Drop existing policies that need to be updated
DROP POLICY IF EXISTS "Anyone can view public books" ON books;
DROP POLICY IF EXISTS "Public can read public books" ON books;

-- Create updated policies that handle the three states:
-- is_public = true: Public books (everyone can see)
-- is_public = false: Private books (only authenticated users can see)
-- is_public = NULL: Draft books (only admins can see)

-- Policy for public books (is_public = true)
CREATE POLICY "Anyone can view public books" ON books
    FOR SELECT USING (is_public = true);

-- Policy for authenticated users to view private books (is_public = false)
CREATE POLICY "Authenticated users can view private books" ON books
    FOR SELECT USING (is_public = false AND auth.uid() IS NOT NULL);

-- Policy for admins to view all books (including drafts where is_public = NULL)
CREATE POLICY "Admins can view all books including drafts" ON books
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy for public access to public books (redundant but explicit)
CREATE POLICY "Public can read public books"
    ON books FOR SELECT
    USING (is_public = true);

-- Step 3: Add a comment to document the new status system
COMMENT ON COLUMN books.is_public IS 'Book publication status: true = public, false = private, NULL = draft';

-- Step 4: Create a function to help with status queries
CREATE OR REPLACE FUNCTION get_book_status(is_public_value BOOLEAN)
RETURNS TEXT AS $$
BEGIN
    IF is_public_value IS NULL THEN
        RETURN 'draft';
    ELSIF is_public_value = true THEN
        RETURN 'public';
    ELSE
        RETURN 'private';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create a view for easier book status management
CREATE OR REPLACE VIEW books_with_status AS
SELECT 
    b.*,
    CASE 
        WHEN b.is_public IS NULL THEN 'draft'
        WHEN b.is_public = true THEN 'public'
        ELSE 'private'
    END as status_text,
    c.name as course_name
FROM books b
LEFT JOIN courses c ON b.course_id = c.id;

-- Step 6: Add some sample draft books for testing
INSERT INTO books (title, author, genre, description, is_public, cover_image_url, file_url, course_id) VALUES
    (
        'Machine Learning Fundamentals',
        'Andrew Ng',
        'Computer Science',
        'Introduction to machine learning concepts and algorithms.',
        NULL, -- This is a draft
        '/placeholder.svg?height=400&width=300',
        'https://example.com/ml-fundamentals.pdf',
        (SELECT id FROM courses WHERE name = 'Computer Science' LIMIT 1)
    ),
    (
        'Quantum Physics for Beginners',
        'Richard Feynman',
        'Physics',
        'Basic concepts of quantum mechanics explained simply.',
        NULL, -- This is a draft
        '/placeholder.svg?height=400&width=300',
        'https://example.com/quantum-physics.pdf',
        (SELECT id FROM courses WHERE name = 'Physics' LIMIT 1)
    )
ON CONFLICT DO NOTHING;

-- Step 7: Create an index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_books_is_public ON books(is_public);

-- Step 8: Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verification queries (run these to check the migration worked)
-- SELECT 'Books by status:' as info;
-- SELECT 
--     CASE 
--         WHEN is_public IS NULL THEN 'draft'
--         WHEN is_public = true THEN 'public'
--         ELSE 'private'
--     END as status,
--     COUNT(*) as count
-- FROM books 
-- GROUP BY is_public
-- ORDER BY status;

-- SELECT 'Sample books with status:' as info;
-- SELECT title, author, 
--     CASE 
--         WHEN is_public IS NULL THEN 'draft'
--         WHEN is_public = true THEN 'public'
--         ELSE 'private'
--     END as status
-- FROM books 
-- ORDER BY created_at DESC 
-- LIMIT 10; 