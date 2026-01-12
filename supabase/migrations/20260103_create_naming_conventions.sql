-- Migration: Create naming_conventions table
-- Description: Stores user's custom naming conventions and active selections

-- Create naming_conventions table
CREATE TABLE IF NOT EXISTS naming_conventions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  mode TEXT NOT NULL CHECK (mode IN ('designer', 'producer', 'universal')),
  parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
  separator TEXT NOT NULL DEFAULT '_',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_naming_settings table for storing active convention selections
CREATE TABLE IF NOT EXISTS user_naming_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  designer_convention_id TEXT NOT NULL DEFAULT 'ucs',
  producer_convention_id TEXT NOT NULL DEFAULT 'musical-full',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_naming_conventions_user_id ON naming_conventions(user_id);
CREATE INDEX IF NOT EXISTS idx_naming_conventions_mode ON naming_conventions(mode);
CREATE INDEX IF NOT EXISTS idx_user_naming_settings_user_id ON user_naming_settings(user_id);

-- Enable Row Level Security
ALTER TABLE naming_conventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_naming_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for naming_conventions
CREATE POLICY "Users can view their own naming conventions"
  ON naming_conventions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own naming conventions"
  ON naming_conventions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own naming conventions"
  ON naming_conventions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own naming conventions"
  ON naming_conventions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_naming_settings
CREATE POLICY "Users can view their own naming settings"
  ON user_naming_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own naming settings"
  ON user_naming_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own naming settings"
  ON user_naming_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own naming settings"
  ON user_naming_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_naming_conventions_updated_at ON naming_conventions;
CREATE TRIGGER update_naming_conventions_updated_at
  BEFORE UPDATE ON naming_conventions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_naming_settings_updated_at ON user_naming_settings;
CREATE TRIGGER update_user_naming_settings_updated_at
  BEFORE UPDATE ON user_naming_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE naming_conventions IS 'Stores user-created custom naming conventions for audio files';
COMMENT ON TABLE user_naming_settings IS 'Stores user preferences for active naming conventions per mode';
COMMENT ON COLUMN naming_conventions.parameters IS 'JSONB array of NamingParameter objects with type, label, value, format, enabled';
COMMENT ON COLUMN naming_conventions.mode IS 'designer, producer, or universal';
COMMENT ON COLUMN user_naming_settings.designer_convention_id IS 'Can be builtin ID (ucs, hierarchy, etc.) or custom UUID';
COMMENT ON COLUMN user_naming_settings.producer_convention_id IS 'Can be builtin ID (musical-full, etc.) or custom UUID';
