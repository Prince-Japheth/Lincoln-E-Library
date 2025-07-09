-- Simple storage status check (read-only operations)
-- This script only checks existing buckets and policies without modifying anything

-- Check if storage buckets exist
SELECT 'Storage Buckets Status:' as info;
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id IN ('books', 'covers')
ORDER BY id;

-- Check if buckets are missing
SELECT 'Missing Buckets:' as info;
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'books') 
        THEN 'books bucket is missing'
        ELSE 'books bucket exists'
    END as books_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'covers') 
        THEN 'covers bucket is missing'
        ELSE 'covers bucket exists'
    END as covers_status;

-- Check existing storage policies (read-only)
SELECT 'Existing Storage Policies:' as info;
SELECT 
    policyname,
    tablename,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- Check for any existing files (read-only)
SELECT 'Files in Books Bucket:' as info;
SELECT 
    name,
    bucket_id,
    created_at
FROM storage.objects 
WHERE bucket_id = 'books'
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Files in Covers Bucket:' as info;
SELECT 
    name,
    bucket_id,
    created_at
FROM storage.objects 
WHERE bucket_id = 'covers'
ORDER BY created_at DESC
LIMIT 5;

-- Check bucket configuration
SELECT 'Bucket Configuration Summary:' as info;
SELECT 
    'books' as bucket_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'books') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'books' AND public = true) 
        THEN 'PUBLIC' 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'books' AND public = false) 
        THEN 'PRIVATE' 
        ELSE 'N/A' 
    END as visibility
UNION ALL
SELECT 
    'covers' as bucket_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'covers') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'covers' AND public = true) 
        THEN 'PUBLIC' 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'covers' AND public = false) 
        THEN 'PRIVATE' 
        ELSE 'N/A' 
    END as visibility; 