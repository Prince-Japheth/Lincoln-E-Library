-- Rollback script for draft status changes
-- Run this if you need to revert the draft status functionality

-- Step 1: Convert all draft books (is_public = NULL) to private books (is_public = false)
UPDATE books SET is_public = false WHERE is_public IS NULL;

-- Step 2: Restore the original column constraints
ALTER TABLE books ALTER COLUMN is_public SET NOT NULL;
ALTER TABLE books ALTER COLUMN is_public SET DEFAULT true;

-- Step 3: Drop the new policies
DROP POLICY IF EXISTS "Authenticated users can view private books" ON books;
DROP POLICY IF EXISTS "Admins can view all books including drafts" ON books;

-- Step 4: Restore the original policies
CREATE POLICY "Anyone can view public books" ON books
    FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can view all books" ON books
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Step 5: Drop the helper function and view
DROP FUNCTION IF EXISTS get_book_status(BOOLEAN);
DROP VIEW IF EXISTS books_with_status;

-- Step 6: Remove the index
DROP INDEX IF EXISTS idx_books_is_public;

-- Step 7: Remove the trigger
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Step 8: Remove the column comment
COMMENT ON COLUMN books.is_public IS NULL;

-- Verification query
-- SELECT 'Books by status after rollback:' as info;
-- SELECT 
--     CASE 
--         WHEN is_public = true THEN 'public'
--         ELSE 'private'
--     END as status,
--     COUNT(*) as count
-- FROM books 
-- GROUP BY is_public
-- ORDER BY status; 