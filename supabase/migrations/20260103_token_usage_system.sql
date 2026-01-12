-- Migration: Token Usage System
-- Description: Add variable token consumption function
-- Date: 2026-01-03

-- Drop old single-token function if exists
DROP FUNCTION IF EXISTS use_token(UUID, TEXT);

-- Function to use a variable amount of tokens
-- This is the main function for deducting tokens during generation
CREATE OR REPLACE FUNCTION use_tokens(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT DEFAULT 'Audio generation'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance INTEGER;
BEGIN
    -- Validate amount
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive, got: %', p_amount;
    END IF;

    -- Get current balance with lock to prevent race conditions
    SELECT balance INTO v_current_balance
    FROM user_tokens
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Check if user exists and has enough tokens
    IF v_current_balance IS NULL THEN
        RAISE NOTICE 'User % has no token record', p_user_id;
        RETURN false;
    END IF;

    IF v_current_balance < p_amount THEN
        RAISE NOTICE 'Insufficient tokens: has %, needs %', v_current_balance, p_amount;
        RETURN false;
    END IF;

    -- Deduct tokens
    UPDATE user_tokens
    SET 
        balance = balance - p_amount,
        lifetime_used = lifetime_used + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Record transaction
    INSERT INTO token_transactions (
        user_id,
        amount,
        type,
        description
    ) VALUES (
        p_user_id,
        -p_amount,  -- Negative for usage
        'usage',
        p_description
    );

    RAISE NOTICE 'Deducted % tokens from user %. New balance: %', 
        p_amount, p_user_id, v_current_balance - p_amount;

    RETURN true;
END;
$$;

-- Update check_user_tokens to support variable amounts (default 20 for backward compat)
CREATE OR REPLACE FUNCTION check_user_tokens(
    p_user_id UUID,
    p_required INTEGER DEFAULT 20
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    SELECT balance INTO v_balance
    FROM user_tokens
    WHERE user_id = p_user_id;

    -- Return false if no record or insufficient balance
    RETURN COALESCE(v_balance, 0) >= p_required;
END;
$$;

-- Function to get user's current token balance (convenience function)
CREATE OR REPLACE FUNCTION get_user_token_balance(
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    SELECT balance INTO v_balance
    FROM user_tokens
    WHERE user_id = p_user_id;

    RETURN COALESCE(v_balance, 0);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION use_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION use_tokens TO service_role;
GRANT EXECUTE ON FUNCTION check_user_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_tokens TO service_role;
GRANT EXECUTE ON FUNCTION get_user_token_balance TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_token_balance TO service_role;

-- Comments for documentation
COMMENT ON FUNCTION use_tokens IS 'Deducts a variable amount of tokens for audio generation';
COMMENT ON FUNCTION check_user_tokens IS 'Checks if user has enough tokens for a generation';
COMMENT ON FUNCTION get_user_token_balance IS 'Returns the current token balance for a user';
