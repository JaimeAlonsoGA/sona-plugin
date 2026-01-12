-- Add musical key and producer config columns to jobs table
-- Migration for Designer/Producer mode support

-- Add musical_key column (JSON: { key: string, scale: string })
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS musical_key JSONB;

-- Add producer_config column (JSON: { bpm: number, timeSignature: string, bars: number })
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS producer_config JSONB;

-- Add comment for documentation
COMMENT ON COLUMN jobs.musical_key IS 'Musical key configuration: { key: "C"|"C#"|..., scale: "major"|"minor" }';
COMMENT ON COLUMN jobs.producer_config IS 'Producer mode config: { bpm: number, timeSignature: "4/4"|..., bars: number }';
