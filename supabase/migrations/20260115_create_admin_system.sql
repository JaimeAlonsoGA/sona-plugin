-- =====================================================
-- ADMIN SYSTEM MIGRATION (SIMPLIFIED)
-- =====================================================
-- Creates admin_users table and RLS policies for
-- managing administrators in the SONA application.
--
-- Features:
-- - Admin user management (single role: admin)
-- - RLS policies for admin-only access to sensitive data
-- - Helper function for checking admin status
-- =====================================================

-- =====================================================
-- 1. ADMIN USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_admin_user UNIQUE (user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users(is_active);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER trigger_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_users_updated_at();

-- =====================================================
-- 2. HELPER FUNCTION
-- =====================================================

-- Check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = check_user_id
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. RLS POLICIES FOR ADMIN_USERS TABLE
-- =====================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can view all admin users
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
    ON public.admin_users
    FOR SELECT
    USING (public.is_admin(auth.uid()));

-- Admins can manage admin users
DROP POLICY IF EXISTS "Admins can insert admin_users" ON public.admin_users;
CREATE POLICY "Admins can insert admin_users"
    ON public.admin_users
    FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update admin_users" ON public.admin_users;
CREATE POLICY "Admins can update admin_users"
    ON public.admin_users
    FOR UPDATE
    USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete admin_users" ON public.admin_users;
CREATE POLICY "Admins can delete admin_users"
    ON public.admin_users
    FOR DELETE
    USING (public.is_admin(auth.uid()));

-- =====================================================
-- 4. ADMIN STATISTICS VIEW
-- =====================================================

-- Admin statistics view (data aggregated from queries)
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
    (SELECT COUNT(*) FROM public.beta_applications WHERE status = 'pending') AS pending_applications,
    (SELECT COUNT(*) FROM public.beta_applications WHERE status = 'approved') AS approved_applications,
    (SELECT COUNT(*) FROM public.beta_applications WHERE status = 'rejected') AS rejected_applications,
    (SELECT COUNT(*) FROM public.beta_applications) AS total_applications,
    (SELECT COUNT(*) FROM public.jobs) AS total_jobs,
    (SELECT COUNT(*) FROM public.jobs WHERE status = 'completed') AS completed_jobs,
    (SELECT COUNT(*) FROM public.jobs WHERE status = 'failed') AS failed_jobs,
    (SELECT COUNT(*) FROM public.jobs WHERE created_at > NOW() - INTERVAL '24 hours') AS jobs_last_24h,
    (SELECT COUNT(*) FROM public.jobs WHERE created_at > NOW() - INTERVAL '7 days') AS jobs_last_7d,
    (SELECT COUNT(*) FROM public.reports WHERE status = 'new') AS new_reports,
    (SELECT COUNT(*) FROM public.reports) AS total_reports,
    (SELECT COALESCE(SUM(lifetime_purchased), 0) FROM public.user_tokens) AS total_tokens_purchased,
    (SELECT COALESCE(SUM(lifetime_used), 0) FROM public.user_tokens) AS total_tokens_used,
    (SELECT COALESCE(SUM(balance), 0) FROM public.user_tokens) AS total_tokens_balance,
    (SELECT COUNT(*) FROM public.token_transactions WHERE type = 'purchase') AS total_purchases,
    (SELECT COUNT(DISTINCT user_id) FROM public.user_tokens WHERE balance > 0) AS users_with_tokens,
    (SELECT COUNT(*) FROM public.admin_users WHERE is_active = TRUE) AS active_admins;

-- =====================================================
-- 5. RLS POLICIES FOR ADMIN ACCESS TO OTHER TABLES
-- =====================================================

-- Allow admins to view all beta applications
DROP POLICY IF EXISTS "Admins can view all beta_applications" ON public.beta_applications;
CREATE POLICY "Admins can view all beta_applications"
    ON public.beta_applications
    FOR SELECT
    USING (public.is_admin(auth.uid()));

-- Allow admins to update beta applications
DROP POLICY IF EXISTS "Admins can update beta_applications" ON public.beta_applications;
CREATE POLICY "Admins can update beta_applications"
    ON public.beta_applications
    FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- Allow admins to view all reports
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
CREATE POLICY "Admins can view all reports"
    ON public.reports
    FOR SELECT
    USING (public.is_admin(auth.uid()));

-- Allow admins to update reports
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports"
    ON public.reports
    FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- Allow admins to view all jobs
DROP POLICY IF EXISTS "Admins can view all jobs" ON public.jobs;
CREATE POLICY "Admins can view all jobs"
    ON public.jobs
    FOR SELECT
    USING (public.is_admin(auth.uid()));

-- Allow admins to view all token transactions
DROP POLICY IF EXISTS "Admins can view all token_transactions" ON public.token_transactions;
CREATE POLICY "Admins can view all token_transactions"
    ON public.token_transactions
    FOR SELECT
    USING (public.is_admin(auth.uid()));

-- Allow admins to view all user tokens
DROP POLICY IF EXISTS "Admins can view all user_tokens" ON public.user_tokens;
CREATE POLICY "Admins can view all user_tokens"
    ON public.user_tokens
    FOR SELECT
    USING (public.is_admin(auth.uid()));

-- Allow admins to update user tokens (for manual adjustments)
DROP POLICY IF EXISTS "Admins can update user_tokens" ON public.user_tokens;
CREATE POLICY "Admins can update user_tokens"
    ON public.user_tokens
    FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- Allow admins to insert token transactions (for manual credits)
DROP POLICY IF EXISTS "Admins can insert token_transactions" ON public.token_transactions;
CREATE POLICY "Admins can insert token_transactions"
    ON public.token_transactions
    FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

-- =====================================================
-- 6. GRANT ACCESS TO VIEW
-- =====================================================

GRANT SELECT ON public.admin_stats TO authenticated;

-- =====================================================
-- 7. INSERT INITIAL ADMIN (Update with your user_id)
-- =====================================================

-- Uncomment and update with your user_id to create the first admin
-- INSERT INTO public.admin_users (user_id, notes)
-- VALUES ('YOUR-USER-ID-HERE', 'Initial admin')
-- ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.admin_users IS 'Admin users for managing SONA';
COMMENT ON FUNCTION public.is_admin IS 'Check if a user has admin privileges';
COMMENT ON VIEW public.admin_stats IS 'Overview statistics for admin dashboard';
