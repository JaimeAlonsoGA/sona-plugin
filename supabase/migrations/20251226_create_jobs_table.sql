-- Create jobs table for audio generation tracking
-- This migration creates the table structure needed by the generate edge function

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 10,
  quality TEXT NOT NULL DEFAULT 'medium',
  mode TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  result_url TEXT,
  
  -- Constraints
  CONSTRAINT valid_duration CHECK (duration >= 1 AND duration <= 60),
  CONSTRAINT valid_quality CHECK (quality IN ('low', 'medium', 'high')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own jobs
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own jobs
CREATE POLICY "Users can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own jobs (for status updates)
CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row modification
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE jobs IS 'Tracks audio generation jobs created by users';
COMMENT ON COLUMN jobs.user_id IS 'References the user who created the job';
COMMENT ON COLUMN jobs.prompt IS 'Text description for audio generation';
COMMENT ON COLUMN jobs.duration IS 'Duration in seconds (1-60)';
COMMENT ON COLUMN jobs.quality IS 'Quality level: low, medium, or high';
COMMENT ON COLUMN jobs.mode IS 'Generation mode (e.g., ambient, default)';
COMMENT ON COLUMN jobs.status IS 'Job status: pending, processing, completed, or failed';
COMMENT ON COLUMN jobs.result_url IS 'URL to the generated audio file in Supabase Storage';
