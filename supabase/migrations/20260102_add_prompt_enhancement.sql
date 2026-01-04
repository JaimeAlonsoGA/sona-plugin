-- Add enhanced_prompt, filename, and naming_convention columns to jobs table
-- These fields store the OpenAI-refined prompt, UCS-compliant filename, and user's naming config

-- Add enhanced_prompt column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS enhanced_prompt TEXT;

-- Add filename column (UCS format: CatID_FXName_CreatorID_SourceID)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS filename TEXT;

-- Add naming_convention column (JSON string with user's naming config)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS naming_convention JSONB;

-- Add comment for documentation
COMMENT ON COLUMN jobs.enhanced_prompt IS 'AI-refined prompt used for audio generation (standardized English with technical vocabulary)';
COMMENT ON COLUMN jobs.filename IS 'Generated filename based on user naming convention';
COMMENT ON COLUMN jobs.naming_convention IS 'User naming convention configuration (parameters and separator)';
