-- Storage buckets setup for Lincoln E-Library
-- This script creates the necessary storage buckets and policies
-- Run this in your Supabase SQL editor

-- Step 1: Create the books bucket for PDF files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'books',
    'books',
    true, -- Public bucket so files can be accessed
    52428800, -- 50MB file size limit
    ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Create the covers bucket for book cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'covers',
    'covers',
    true, -- Public bucket so images can be accessed
    5242880, -- 5MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Step 3: Enable Row Level Security on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing storage policies (if any)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload books" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view public files" ON storage.objects;

-- Step 5: Create storage policies for books bucket
-- Allow anyone to view books (public access)
CREATE POLICY "Anyone can view books" ON storage.objects
    FOR SELECT USING (bucket_id = 'books');

-- Allow authenticated users to upload books
CREATE POLICY "Authenticated users can upload books" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'books' 
        AND auth.uid() IS NOT NULL
    );

-- Allow admins to manage all book files
CREATE POLICY "Admins can manage all book files" ON storage.objects
    FOR ALL USING (
        bucket_id = 'books' 
        AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Step 6: Create storage policies for covers bucket
-- Allow anyone to view cover images (public access)
CREATE POLICY "Anyone can view covers" ON storage.objects
    FOR SELECT USING (bucket_id = 'covers');

-- Allow authenticated users to upload cover images
CREATE POLICY "Authenticated users can upload covers" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'covers' 
        AND auth.uid() IS NOT NULL
    );

-- Allow admins to manage all cover files
CREATE POLICY "Admins can manage all cover files" ON storage.objects
    FOR ALL USING (
        bucket_id = 'covers' 
        AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Step 7: Create a general policy for file management
-- Allow users to update/delete their own uploaded files
CREATE POLICY "Users can manage their own files" ON storage.objects
    FOR ALL USING (
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Step 8: Create a function to get file metadata
CREATE OR REPLACE FUNCTION get_file_metadata(bucket_name text, file_path text)
RETURNS TABLE (
    id uuid,
    name text,
    bucket_id text,
    owner uuid,
    created_at timestamptz,
    updated_at timestamptz,
    last_accessed_at timestamptz,
    metadata jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.bucket_id,
        o.owner,
        o.created_at,
        o.updated_at,
        o.last_accessed_at,
        o.metadata
    FROM storage.objects o
    WHERE o.bucket_id = bucket_name 
    AND o.name = file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create a function to list files in a bucket
CREATE OR REPLACE FUNCTION list_bucket_files(bucket_name text)
RETURNS TABLE (
    name text,
    id uuid,
    updated_at timestamptz,
    created_at timestamptz,
    last_accessed_at timestamptz,
    metadata jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.name,
        o.id,
        o.updated_at,
        o.created_at,
        o.last_accessed_at,
        o.metadata
    FROM storage.objects o
    WHERE o.bucket_id = bucket_name
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Add comments for documentation
COMMENT ON TABLE storage.objects IS 'Storage objects for Lincoln E-Library files';
COMMENT ON FUNCTION get_file_metadata IS 'Get metadata for a specific file in storage';
COMMENT ON FUNCTION list_bucket_files IS 'List all files in a specific bucket';

-- Verification queries (run these to check the setup worked)
-- SELECT 'Storage buckets created:' as info;
-- SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id IN ('books', 'covers');

-- SELECT 'Storage policies created:' as info;
-- SELECT policyname, tablename FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- SELECT 'Sample file listing (if any files exist):' as info;
-- SELECT * FROM list_bucket_files('books') LIMIT 5; 