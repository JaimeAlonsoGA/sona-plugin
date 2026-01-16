-- Create reports table for feedback submissions
-- This migration creates the table structure for storing user feedback/reports

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  feedback_type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  -- Optional: linked job information
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  job_storage_url TEXT,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- Status for admin review
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  
  -- Constraints
  CONSTRAINT valid_feedback_type CHECK (feedback_type IN ('bug', 'feature', 'general', 'prompting')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  CONSTRAINT message_not_empty CHECK (length(trim(message)) > 0)
);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert reports (even unauthenticated users)
CREATE POLICY "Anyone can create reports"
  ON reports FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view only their own reports (if authenticated)
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for admin dashboard)
CREATE POLICY "Service role full access"
  ON reports
  USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_feedback_type ON reports(feedback_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Trigger to update updated_at on row modification
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to table and columns
COMMENT ON TABLE reports IS 'Stores user feedback and bug reports';
COMMENT ON COLUMN reports.user_id IS 'References the user who submitted the report (null for anonymous)';
COMMENT ON COLUMN reports.email IS 'Contact email for follow-up (may be provided by anonymous users)';
COMMENT ON COLUMN reports.feedback_type IS 'Type of feedback: bug, feature, general, or prompting';
COMMENT ON COLUMN reports.message IS 'The feedback message content';
COMMENT ON COLUMN reports.job_id IS 'Optional reference to a related job';
COMMENT ON COLUMN reports.job_storage_url IS 'Optional storage URL for the linked job audio';
COMMENT ON COLUMN reports.status IS 'Review status: pending, reviewed, resolved, or dismissed';
COMMENT ON COLUMN reports.admin_notes IS 'Internal notes from admin review';
