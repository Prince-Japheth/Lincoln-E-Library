-- Fix storage RLS policies for file uploads
-- This script creates the necessary policies to allow file uploads

-- Step 1: Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing conflicting policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload books" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view books" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own files" ON storage.objects;

-- Step 3: Create a general policy for authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND bucket_id IN ('books', 'covers')
    );

-- Step 4: Create a policy for viewing files (public access)
CREATE POLICY "Anyone can view files" ON storage.objects
    FOR SELECT USING (
        bucket_id IN ('books', 'covers')
    );

-- Step 5: Create a policy for updating files (for authenticated users)
CREATE POLICY "Authenticated users can update files" ON storage.objects
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND bucket_id IN ('books', 'covers')
    );

-- Step 6: Create a policy for deleting files (for authenticated users)
CREATE POLICY "Authenticated users can delete files" ON storage.objects
    FOR DELETE USING (
        auth.uid() IS NOT NULL
        AND bucket_id IN ('books', 'covers')
    );

-- Step 7: Create a more permissive policy for admins
CREATE POLICY "Admins can manage all files" ON storage.objects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Step 8: Create a fallback policy for service role (if needed)
-- This allows the service role to bypass RLS
CREATE POLICY "Service role bypass" ON storage.objects
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- Step 9: Verify the policies were created
SELECT 'Storage Policies Created:' as info;
SELECT 
    policyname,
    tablename,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- Step 10: Check if buckets exist and are public
SELECT 'Bucket Status:' as info;
SELECT 
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets 
WHERE id IN ('books', 'covers')
ORDER BY id;

-- Step 11: Test policy effectiveness
SELECT 'Policy Test Results:' as info;
SELECT 
    'RLS Enabled' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND rowsecurity = true
        ) THEN 'YES' 
        ELSE 'NO' 
    END as result
UNION ALL
SELECT 
    'Books Bucket Exists' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'books') 
        THEN 'YES' 
        ELSE 'NO' 
    END as result
UNION ALL
SELECT 
    'Covers Bucket Exists' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'covers') 
        THEN 'YES' 
        ELSE 'NO' 
    END as result
UNION ALL
SELECT 
    'Upload Policy Exists' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage'
            AND policyname = 'Authenticated users can upload files'
        ) THEN 'YES' 
        ELSE 'NO' 
    END as result; 