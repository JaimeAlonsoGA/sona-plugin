-- Migration: Beta Bonus Tokens
-- Description: Automatically grants 500 tokens to new users during CLOSED BETA
-- Date: 2026-01-03

-- Configuration: Set to FALSE when beta ends to stop granting free tokens
-- You can update this with: UPDATE app_config SET value = 'false' WHERE key = 'beta_bonus_enabled';
CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert beta configuration
INSERT INTO app_config (key, value, description)
VALUES (
    'beta_bonus_enabled',
    'true',
    'When true, new users receive 500 free tokens on signup'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_config (key, value, description)
VALUES (
    'beta_bonus_amount',
    '500',
    'Number of free tokens granted to new beta users'
)
ON CONFLICT (key) DO NOTHING;

-- Function to grant beta bonus tokens to new users
CREATE OR REPLACE FUNCTION grant_beta_bonus_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_beta_enabled BOOLEAN;
    v_bonus_amount INTEGER;
BEGIN
    -- Check if beta bonus is enabled
    SELECT (value = 'true') INTO v_beta_enabled
    FROM app_config
    WHERE key = 'beta_bonus_enabled';

    -- If not enabled, do nothing
    IF NOT COALESCE(v_beta_enabled, false) THEN
        RETURN NEW;
    END IF;

    -- Get bonus amount
    SELECT COALESCE(value::INTEGER, 500) INTO v_bonus_amount
    FROM app_config
    WHERE key = 'beta_bonus_amount';

    -- Create token record for new user with beta bonus
    INSERT INTO user_tokens (
        user_id,
        balance,
        lifetime_purchased,
        lifetime_used,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        v_bonus_amount,
        0,  -- Not purchased, it's a bonus
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;  -- Don't override if already exists

    -- Record the bonus transaction
    INSERT INTO token_transactions (
        user_id,
        amount,
        type,
        description
    ) VALUES (
        NEW.id,
        v_bonus_amount,
        'bonus',
        'Welcome bonus - Closed Beta 🎉'
    );

    RAISE NOTICE 'Granted % beta bonus tokens to user %', v_bonus_amount, NEW.id;

    RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
-- This fires AFTER a new user is inserted
DROP TRIGGER IF EXISTS trigger_grant_beta_bonus ON auth.users;

CREATE TRIGGER trigger_grant_beta_bonus
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION grant_beta_bonus_tokens();

-- Grant necessary permissions
GRANT SELECT ON app_config TO authenticated;
GRANT SELECT ON app_config TO service_role;

-- Helper function to check/update beta status (for admin use)
CREATE OR REPLACE FUNCTION set_beta_bonus_enabled(p_enabled BOOLEAN)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE app_config
    SET value = CASE WHEN p_enabled THEN 'true' ELSE 'false' END,
        updated_at = NOW()
    WHERE key = 'beta_bonus_enabled';
END;
$$;

-- Helper function to update bonus amount
CREATE OR REPLACE FUNCTION set_beta_bonus_amount(p_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_amount < 0 THEN
        RAISE EXCEPTION 'Bonus amount must be non-negative';
    END IF;
    
    UPDATE app_config
    SET value = p_amount::TEXT,
        updated_at = NOW()
    WHERE key = 'beta_bonus_amount';
END;
$$;

-- Comments
COMMENT ON TABLE app_config IS 'Application configuration key-value store';
COMMENT ON FUNCTION grant_beta_bonus_tokens IS 'Trigger function that grants free tokens to new beta users';
COMMENT ON FUNCTION set_beta_bonus_enabled IS 'Enable/disable beta bonus tokens (admin only)';
COMMENT ON FUNCTION set_beta_bonus_amount IS 'Set the number of bonus tokens for beta users (admin only)';
