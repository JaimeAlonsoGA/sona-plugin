-- Add skip_naming column to jobs table
-- Allows users to skip AI naming for faster generation

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skip_naming BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN jobs.skip_naming IS 'When true, the worker skips AI naming convention generation for faster processing';

-- Add naming_enabled column to user_naming_settings table
-- Allows users to globally enable/disable AI naming

ALTER TABLE user_naming_settings ADD COLUMN IF NOT EXISTS naming_enabled BOOLEAN DEFAULT TRUE;

-- Add creator_convention_id column if not exists
ALTER TABLE user_naming_settings ADD COLUMN IF NOT EXISTS creator_convention_id TEXT NOT NULL DEFAULT 'musical-full';

COMMENT ON COLUMN user_naming_settings.naming_enabled IS 'When false, AI naming is disabled and simple timestamps are used';
COMMENT ON COLUMN user_naming_settings.creator_convention_id IS 'Active naming convention for Creator mode';
