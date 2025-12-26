-- Add WAV and MP3 URL columns to jobs table
-- This migration adds separate columns for master (WAV) and preview (MP3) audio files

-- Add new columns for WAV and MP3 URLs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS wav_url TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS mp3_url TEXT;

-- Add comments to new columns
COMMENT ON COLUMN jobs.wav_url IS 'URL to the master WAV audio file in Supabase Storage';
COMMENT ON COLUMN jobs.mp3_url IS 'URL to the preview MP3 audio file in Supabase Storage';

-- Update the status constraint to include 'queued' status
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE jobs ADD CONSTRAINT valid_status 
  CHECK (status IN ('pending', 'queued', 'processing', 'completed', 'failed'));
