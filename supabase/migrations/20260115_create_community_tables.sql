-- Community Tables Migration
-- Creates tables for community posts and stats
-- 
-- Features:
-- 1. community_posts: User messages with optional audio attachments
-- 2. community_activity_log: Auto-populated when users join the beta
-- 3. Views for public stats (total users, total generations)

-- ============================================
-- COMMUNITY POSTS TABLE
-- ============================================
-- Users can share tips, prompts, and showcase audio

CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User display info (snapshot at post time)
    author_name TEXT NOT NULL,
    
    -- Post content
    message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 1000),
    
    -- Optional attached audio generation (references jobs table)
    attached_job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_visible BOOLEAN NOT NULL DEFAULT true,
    
    -- Moderation
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    flagged_reason TEXT
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible posts (public page)
CREATE POLICY "Anyone can view visible posts" ON public.community_posts
    FOR SELECT
    USING (is_visible = true AND is_flagged = false);

-- Beta users can create posts
CREATE POLICY "Beta users can create posts" ON public.community_posts
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.beta_applications 
            WHERE user_id = auth.uid() AND status = 'approved'
        )
    );

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON public.community_posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON public.community_posts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_visible ON public.community_posts(is_visible, is_flagged);

-- ============================================
-- COMMUNITY ACTIVITY LOG
-- ============================================
-- Auto-populated log showing when users join beta

CREATE TABLE IF NOT EXISTS public.community_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('beta_join', 'first_generation', 'milestone')),
    display_name TEXT NOT NULL,
    message_template TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_visible BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.community_activity_log ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible activities (public)
CREATE POLICY "Anyone can view visible activities" ON public.community_activity_log
    FOR SELECT
    USING (is_visible = true);

-- Only system can insert (via trigger)
-- No user INSERT policy - this is populated by triggers

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_activity_log_created_at ON public.community_activity_log(created_at DESC);

-- ============================================
-- TRIGGER: Auto-create activity on beta approval
-- ============================================

-- Array of witty join messages
CREATE OR REPLACE FUNCTION get_random_join_message(user_name TEXT)
RETURNS TEXT AS $$
DECLARE
    messages TEXT[] := ARRAY[
        '%s knocked on the door of AI overlords and joined the Beta',
        '%s is facing their generative AI prejudices and joined the Beta today!',
        '%s decided to embrace the future of audio and joined SONA',
        'The sound design gods smiled upon %s - Beta access granted!',
        '%s just unlocked the power of AI-generated audio',
        'Welcome to the future, %s! Your Beta access awaits',
        '%s took the red pill and entered the SONA Beta',
        'Plot twist: %s is now a SONA Beta tester!',
        '%s has joined the audio revolution',
        'Breaking: %s spotted entering the SONA Beta dimension',
        '%s is ready to generate some sick sounds',
        'The prophecy foretold: %s would join the Beta',
        '%s just got their ticket to audio paradise',
        'Alert: %s has entered the generative audio chat',
        '%s decided today was the day to make AI sounds'
    ];
    random_idx INTEGER;
BEGIN
    random_idx := 1 + floor(random() * array_length(messages, 1))::INTEGER;
    RETURN format(messages[random_idx], user_name);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to create activity log on beta approval
CREATE OR REPLACE FUNCTION create_beta_join_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create activity when status changes to 'approved'
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        INSERT INTO public.community_activity_log (
            user_id,
            activity_type,
            display_name,
            message_template
        ) VALUES (
            NEW.user_id,
            'beta_join',
            NEW.first_name,
            get_random_join_message(NEW.first_name)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on beta_applications
DROP TRIGGER IF EXISTS on_beta_approval_create_activity ON public.beta_applications;
CREATE TRIGGER on_beta_approval_create_activity
    AFTER INSERT OR UPDATE ON public.beta_applications
    FOR EACH ROW
    EXECUTE FUNCTION create_beta_join_activity();

-- ============================================
-- VIEWS FOR PUBLIC STATS
-- ============================================

-- View: Total approved beta users count
CREATE OR REPLACE VIEW public.community_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.beta_applications WHERE status = 'approved') AS total_users,
    (SELECT COUNT(*) FROM public.jobs WHERE status = 'completed') AS total_generations;

-- Grant access to the view for anon users
GRANT SELECT ON public.community_stats TO anon;
GRANT SELECT ON public.community_stats TO authenticated;

-- ============================================
-- FUNCTION: Get community posts with audio info
-- ============================================

CREATE OR REPLACE FUNCTION get_community_posts_with_audio(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    author_name TEXT,
    message TEXT,
    created_at TIMESTAMPTZ,
    has_audio BOOLEAN,
    audio_url TEXT,
    audio_prompt TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id,
        cp.user_id,
        cp.author_name,
        cp.message,
        cp.created_at,
        (cp.attached_job_id IS NOT NULL) AS has_audio,
        j.result_url AS audio_url,
        j.prompt AS audio_prompt
    FROM public.community_posts cp
    LEFT JOIN public.jobs j ON cp.attached_job_id = j.id AND j.status = 'completed'
    WHERE cp.is_visible = true AND cp.is_flagged = false
    ORDER BY cp.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION get_community_posts_with_audio TO anon;
GRANT EXECUTE ON FUNCTION get_community_posts_with_audio TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.community_posts IS 'User-submitted community messages and tips';
COMMENT ON TABLE public.community_activity_log IS 'Auto-generated activity feed for beta joins';
COMMENT ON VIEW public.community_stats IS 'Public statistics for community page';
COMMENT ON FUNCTION get_community_posts_with_audio IS 'Fetch community posts with joined audio information';
