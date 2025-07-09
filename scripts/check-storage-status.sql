-- Storage status check for Lincoln E-Library
-- Run this to diagnose storage bucket issues

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

-- Check storage policies
SELECT 'Storage Policies Status:' as info;
SELECT 
    policyname,
    tablename,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- Check if RLS is enabled on storage.objects
SELECT 'RLS Status on storage.objects:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Check for any existing files
SELECT 'Existing Files in Books Bucket:' as info;
SELECT 
    name,
    bucket_id,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'books'
ORDER BY created_at DESC
LIMIT 10;

SELECT 'Existing Files in Covers Bucket:' as info;
SELECT 
    name,
    bucket_id,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'covers'
ORDER BY created_at DESC
LIMIT 10;

-- Check storage bucket permissions
SELECT 'Storage Bucket Permissions:' as info;
SELECT 
    bucket_id,
    name,
    owner,
    created_at
FROM storage.objects 
WHERE bucket_id IN ('books', 'covers')
GROUP BY bucket_id, name, owner, created_at
ORDER BY bucket_id, created_at DESC
LIMIT 5; 