-- Migration: Add user_email column to jobs table
-- Purpose: Store user email for Creator mode naming convention (AES format)
-- Date: 2026-01-13

-- Add user_email column (nullable, only used in creator mode)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Add comment for documentation
COMMENT ON COLUMN jobs.user_email IS 'User email for Creator mode naming convention (AES format). Only populated when mode=creator.';
