-- Migration: Allow anonymous access to public jobs
-- This enables the audio showcase on the landing page to work without authentication

-- Policy: Anyone (including anonymous users) can view public jobs
-- This is needed for the audio showcase section on the landing page
CREATE POLICY "Anyone can view public jobs"
  ON jobs FOR SELECT
  USING (public = true AND status = 'completed' AND public_path IS NOT NULL);

-- Add index for public jobs queries
CREATE INDEX IF NOT EXISTS idx_jobs_public ON jobs(public) WHERE public = true;

-- Add comment
COMMENT ON POLICY "Anyone can view public jobs" ON jobs IS 'Allows unauthenticated users to view jobs that have been marked as public for the audio showcase';
