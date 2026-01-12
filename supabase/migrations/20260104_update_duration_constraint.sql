-- Update duration constraint to support 1-180 seconds (3 minutes)
-- This migration updates the valid_duration check constraint on the jobs table

-- Drop the old constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS valid_duration;

-- Add the new constraint with extended range
ALTER TABLE jobs ADD CONSTRAINT valid_duration CHECK (duration >= 1 AND duration <= 180);

-- Add comment for documentation
COMMENT ON CONSTRAINT valid_duration ON jobs IS 'Duration must be between 1 and 180 seconds (3 minutes)';
