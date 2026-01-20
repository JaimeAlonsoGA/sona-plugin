-- Migration: Configure Storage Policies for audio-files bucket (PRIVATE)
-- This sets up RLS policies so authenticated users can access their own audio files
-- and create signed URLs for playback

-- ============================================
-- STORAGE POLICIES FOR PRIVATE BUCKET
-- ============================================

-- The bucket 'audio-files' is PRIVATE and was created by audio-worker
-- Users need SELECT permission to create signed URLs for their files

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can download own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view audio files" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access" ON storage.objects;

-- Policy: Authenticated users can SELECT their own audio files
-- This is required to create signed URLs
-- The check verifies the file path exists in the user's jobs
CREATE POLICY "Users can view own audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-files'
  AND EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.user_id = auth.uid()
    AND (
      jobs.master_path = name
      OR jobs.preview_path = name
    )
  )
);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON POLICY "Users can view own audio files" ON storage.objects IS
'Allows authenticated users to view/download audio files that belong to their jobs.
Required for createSignedUrl to work on private buckets.
The policy checks if the file path matches master_path or preview_path in the user''s jobs.';
