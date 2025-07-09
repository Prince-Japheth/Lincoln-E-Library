-- Temporary fix to get the site working
-- This disables RLS on the books table to avoid the recursion issue

-- Disable RLS on books table temporarily
ALTER TABLE books DISABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'books';

-- Test query to make sure it works
SELECT COUNT(*) as total_books FROM books;
SELECT COUNT(*) as public_books FROM books WHERE is_public = true OR is_public = 'true'; 