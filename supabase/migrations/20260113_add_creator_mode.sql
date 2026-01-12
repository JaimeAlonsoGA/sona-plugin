-- Migration: Add 'creator' mode to naming_conventions
-- Purpose: Support Creator mode for song naming conventions (AES standard)
-- Date: 2026-01-13

-- Update the check constraint to include 'creator' mode
ALTER TABLE naming_conventions DROP CONSTRAINT IF EXISTS naming_conventions_mode_check;
ALTER TABLE naming_conventions ADD CONSTRAINT naming_conventions_mode_check 
  CHECK (mode IN ('designer', 'producer', 'creator', 'universal'));

-- Add creator_convention_id to user_naming_settings if not exists
ALTER TABLE user_naming_settings ADD COLUMN IF NOT EXISTS creator_convention_id TEXT NOT NULL DEFAULT 'aes-standard';

-- Add naming_enabled column if not exists
ALTER TABLE user_naming_settings ADD COLUMN IF NOT EXISTS naming_enabled BOOLEAN NOT NULL DEFAULT true;

-- Add comment
COMMENT ON COLUMN naming_conventions.mode IS 'designer, producer, creator, or universal';
