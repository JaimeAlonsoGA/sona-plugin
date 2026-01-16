-- Beta Applications Table
-- Stores closed beta registration applications
-- 
-- Phase transitions:
-- CLOSED BETA: requiresApproval = true, autoApprove = false
-- OPEN BETA: requiresApproval = true, autoApprove = true (or requiresApproval = false)
-- PRODUCTION: This table becomes historical data

CREATE TABLE IF NOT EXISTS public.beta_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    country TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('sound_designer', 'music_producer', 'content_creator', 'game_developer', 'film_post', 'other')),
    modes_of_interest TEXT[] NOT NULL DEFAULT '{}',
    referral_source TEXT NOT NULL CHECK (referral_source IN ('friend_referral', 'google_search', 'social_media', 'youtube', 'podcast', 'blog_article', 'direct_recommendation', 'other')),
    referral_detail TEXT,
    referral_code TEXT, -- Valid codes grant instant approval
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('none', 'pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    admin_notes TEXT,
    
    -- Ensure one application per user
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;

-- Users can read their own application
CREATE POLICY "Users can view own application" ON public.beta_applications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own application
CREATE POLICY "Users can create own application" ON public.beta_applications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own application (only certain fields)
CREATE POLICY "Users can update own application" ON public.beta_applications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_beta_applications_user_id ON public.beta_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_applications_status ON public.beta_applications(status);
CREATE INDEX IF NOT EXISTS idx_beta_applications_email ON public.beta_applications(email);

-- Function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_beta_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS beta_applications_updated_at ON public.beta_applications;
CREATE TRIGGER beta_applications_updated_at
    BEFORE UPDATE ON public.beta_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_beta_application_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.beta_applications IS 'Stores user applications for closed beta access';
COMMENT ON COLUMN public.beta_applications.status IS 'Application status: none (no application), pending (awaiting review), approved (has access), rejected (denied access)';
COMMENT ON COLUMN public.beta_applications.modes_of_interest IS 'Array of modes: designer, producer, creator';
COMMENT ON COLUMN public.beta_applications.role IS 'User professional role';
COMMENT ON COLUMN public.beta_applications.referral_source IS 'How the user found SONA';
