-- Add enhanced_prompt and filename columns to jobs table
-- These fields store the OpenAI-refined prompt and UCS-compliant filename

-- Add enhanced_prompt column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS enhanced_prompt TEXT;

-- Add filename column (UCS format: CatID_FXName_CreatorID_SourceID)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS filename TEXT;

-- Add comment for documentation
COMMENT ON COLUMN jobs.enhanced_prompt IS 'AI-refined prompt used for audio generation (standardized English with technical vocabulary)';
COMMENT ON COLUMN jobs.filename IS 'UCS-compliant filename in format: CatID_FXName_CreatorID_SourceID';
