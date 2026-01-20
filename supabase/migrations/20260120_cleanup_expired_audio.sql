-- Migration: Add cleanup function for expired audio files
-- This creates a PostgreSQL function scheduled via pg_cron to clean up
-- audio files older than 24 hours using pg_net to call the Edge Function

-- ============================================
-- STEP 1: Enable required extensions
-- ============================================

-- pg_cron for scheduling (usually pre-enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- pg_net for HTTP requests from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- STEP 2: Database cleanup function
-- ============================================

-- Function to cleanup expired audio paths in the database
-- This clears paths but does NOT delete storage files
-- The Edge Function handles both database and storage cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_audio_paths(
  expiration_hours INTEGER DEFAULT 24,
  batch_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  job_id UUID,
  master_path TEXT,
  preview_path TEXT,
  completed_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expiration_threshold TIMESTAMPTZ;
BEGIN
  -- Calculate the expiration threshold
  expiration_threshold := NOW() - (expiration_hours || ' hours')::INTERVAL;
  
  -- Return the jobs that will be cleaned up (for logging/storage deletion)
  RETURN QUERY
  WITH expired_jobs AS (
    SELECT 
      j.id,
      j.master_path AS m_path,
      j.preview_path AS p_path,
      j.completed_at AS c_at
    FROM jobs j
    WHERE j.status = 'completed'
      AND j.completed_at < expiration_threshold
      AND (j.master_path IS NOT NULL OR j.preview_path IS NOT NULL)
    LIMIT batch_limit
    FOR UPDATE SKIP LOCKED
  ),
  updated AS (
    UPDATE jobs
    SET 
      master_path = NULL,
      preview_path = NULL,
      updated_at = NOW()
    WHERE id IN (SELECT id FROM expired_jobs)
    RETURNING id
  )
  SELECT 
    ej.id,
    ej.m_path,
    ej.p_path,
    ej.c_at
  FROM expired_jobs ej;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION cleanup_expired_audio_paths TO service_role;

-- ============================================
-- STEP 3: View for monitoring
-- ============================================

-- Create a view to easily check expired jobs count
CREATE OR REPLACE VIEW expired_audio_jobs_count AS
SELECT 
  COUNT(*) as total_expired,
  COUNT(DISTINCT user_id) as affected_users
FROM jobs
WHERE status = 'completed'
  AND completed_at < NOW() - INTERVAL '24 hours'
  AND (master_path IS NOT NULL OR preview_path IS NOT NULL);

-- Grant select on view to service role
GRANT SELECT ON expired_audio_jobs_count TO service_role;

-- ============================================
-- STEP 4: Performance index
-- ============================================

-- Add index to improve cleanup query performance
CREATE INDEX IF NOT EXISTS idx_jobs_cleanup 
ON jobs (status, completed_at) 
WHERE status = 'completed' 
  AND (master_path IS NOT NULL OR preview_path IS NOT NULL);

-- ============================================
-- STEP 5: Scheduled cleanup via pg_cron + pg_net
-- ============================================

-- Function to trigger the Edge Function cleanup via HTTP
CREATE OR REPLACE FUNCTION trigger_audio_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
  cleanup_secret TEXT;
  request_id BIGINT;
BEGIN
  -- Get configuration from Vault or environment
  -- These should be stored as Supabase secrets
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  cleanup_secret := current_setting('app.settings.cleanup_secret', true);
  
  -- If settings are not available, try to get from vault
  IF supabase_url IS NULL THEN
    SELECT decrypted_secret INTO supabase_url 
    FROM vault.decrypted_secrets 
    WHERE name = 'supabase_url' 
    LIMIT 1;
  END IF;
  
  IF service_role_key IS NULL THEN
    SELECT decrypted_secret INTO service_role_key 
    FROM vault.decrypted_secrets 
    WHERE name = 'service_role_key' 
    LIMIT 1;
  END IF;
  
  IF cleanup_secret IS NULL THEN
    SELECT decrypted_secret INTO cleanup_secret 
    FROM vault.decrypted_secrets 
    WHERE name = 'cleanup_secret' 
    LIMIT 1;
  END IF;

  -- Make HTTP request to the cleanup Edge Function
  IF supabase_url IS NOT NULL AND service_role_key IS NOT NULL THEN
    SELECT net.http_post(
      url := supabase_url || '/functions/v1/cleanup-expired-audio',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key,
        'x-cleanup-secret', COALESCE(cleanup_secret, '')
      ),
      body := jsonb_build_object(
        'expirationHours', 24
      )
    ) INTO request_id;
    
    RAISE NOTICE 'Cleanup request sent, request_id: %', request_id;
  ELSE
    RAISE WARNING 'Cleanup skipped: missing configuration (supabase_url or service_role_key)';
  END IF;
END;
$$;

-- Grant execute to postgres (needed for pg_cron)
GRANT EXECUTE ON FUNCTION trigger_audio_cleanup TO postgres;

-- ============================================
-- STEP 6: Schedule the cron job
-- ============================================

-- Remove existing job if exists (for idempotency)
SELECT cron.unschedule('cleanup-expired-audio')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-audio'
);

-- Schedule cleanup to run every day at 3:00 AM UTC
SELECT cron.schedule(
  'cleanup-expired-audio',
  '0 3 * * *',  -- Every day at 3:00 AM UTC
  $$SELECT trigger_audio_cleanup()$$
);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION cleanup_expired_audio_paths IS 
'Cleans up audio paths from jobs table for files older than specified hours. 
Returns the paths that were cleared for storage deletion. 
Default expiration: 24 hours, Default batch: 100 jobs.
Call: SELECT * FROM cleanup_expired_audio_paths(24, 100);';

COMMENT ON FUNCTION trigger_audio_cleanup IS
'Triggers the cleanup-expired-audio Edge Function via HTTP.
This is called by pg_cron daily at 3:00 AM UTC.
Requires secrets in Supabase Vault: supabase_url, service_role_key, cleanup_secret';

-- ============================================
-- SETUP INSTRUCTIONS
-- ============================================
-- 
-- After running this migration, you need to add secrets to Supabase Vault:
--
-- 1. Go to Supabase Dashboard > Project Settings > Vault
-- 2. Add these secrets:
--    - supabase_url: Your project URL (e.g., https://xxx.supabase.co)
--    - service_role_key: Your service role key
--    - cleanup_secret: A random secret for the cleanup endpoint
--
-- Or via SQL:
--   SELECT vault.create_secret('https://xxx.supabase.co', 'supabase_url');
--   SELECT vault.create_secret('your-service-role-key', 'service_role_key');
--   SELECT vault.create_secret('your-cleanup-secret', 'cleanup_secret');
--
-- To verify the cron job is scheduled:
--   SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-audio';
--
-- To view cron job execution history:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
--
-- To manually trigger cleanup:
--   SELECT trigger_audio_cleanup();
--
-- To unschedule the job:
--   SELECT cron.unschedule('cleanup-expired-audio');
