-- =====================================================
-- FIX ADMIN STATS REPORTS STATUS
-- =====================================================
-- The reports table uses 'pending' as default status,
-- but the admin_stats view was checking for 'new'.
-- This migration fixes the inconsistency.
-- =====================================================

-- Recreate admin_stats view with correct status value
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
    -- Fixed: changed from 'new' to 'pending' to match reports table constraint
    (SELECT COUNT(*) FROM public.reports WHERE status = 'pending') AS new_reports,
    (SELECT COUNT(*) FROM public.reports) AS total_reports,
    (SELECT COALESCE(SUM(lifetime_purchased), 0) FROM public.user_tokens) AS total_tokens_purchased,
    (SELECT COALESCE(SUM(lifetime_used), 0) FROM public.user_tokens) AS total_tokens_used,
    (SELECT COALESCE(SUM(balance), 0) FROM public.user_tokens) AS total_tokens_balance,
    (SELECT COUNT(*) FROM public.token_transactions WHERE type = 'purchase') AS total_purchases,
    (SELECT COUNT(DISTINCT user_id) FROM public.user_tokens WHERE balance > 0) AS users_with_tokens,
    (SELECT COUNT(*) FROM public.admin_users WHERE is_active = TRUE) AS active_admins;
