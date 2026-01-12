-- Migration: Create Token System Tables
-- Description: Creates tables for user token balance and transaction history
-- Date: 2026-01-03

-- User Tokens Table
-- Stores the current token balance and lifetime stats for each user
CREATE TABLE IF NOT EXISTS user_tokens (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    lifetime_purchased INTEGER NOT NULL DEFAULT 0,
    lifetime_used INTEGER NOT NULL DEFAULT 0,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT balance_non_negative CHECK (balance >= 0),
    CONSTRAINT lifetime_purchased_non_negative CHECK (lifetime_purchased >= 0),
    CONSTRAINT lifetime_used_non_negative CHECK (lifetime_used >= 0)
);

-- Token Transactions Table
-- Stores all token transactions for audit and history
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Transaction type validation
    CONSTRAINT valid_transaction_type CHECK (
        type IN ('purchase', 'usage', 'bonus', 'refund', 'subscription')
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_tokens_stripe_customer ON user_tokens(stripe_customer_id);

-- Enable Row Level Security
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tokens
-- Users can only read their own token balance
CREATE POLICY "Users can view own tokens"
    ON user_tokens FOR SELECT
    USING (auth.uid() = user_id);

-- Users cannot directly modify their tokens (only via functions)
-- Service role can do everything (for webhook processing)

-- RLS Policies for token_transactions
-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
    ON token_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Function to add tokens to a user (called by webhook)
-- This function runs with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION add_user_tokens(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type TEXT,
    p_description TEXT,
    p_stripe_payment_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validate transaction type
    IF p_transaction_type NOT IN ('purchase', 'usage', 'bonus', 'refund', 'subscription') THEN
        RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
    END IF;

    -- Insert or update user tokens
    INSERT INTO user_tokens (user_id, balance, lifetime_purchased, updated_at)
    VALUES (
        p_user_id,
        GREATEST(0, p_amount),
        CASE WHEN p_amount > 0 THEN p_amount ELSE 0 END,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        balance = GREATEST(0, user_tokens.balance + p_amount),
        lifetime_purchased = CASE 
            WHEN p_amount > 0 THEN user_tokens.lifetime_purchased + p_amount 
            ELSE user_tokens.lifetime_purchased 
        END,
        updated_at = NOW();

    -- Record the transaction
    INSERT INTO token_transactions (
        user_id,
        amount,
        type,
        description,
        stripe_payment_id
    ) VALUES (
        p_user_id,
        p_amount,
        p_transaction_type,
        p_description,
        p_stripe_payment_id
    );
END;
$$;

-- Function to use tokens (deduct from balance)
CREATE OR REPLACE FUNCTION use_token(
    p_user_id UUID,
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
    -- Get current balance with lock
    SELECT balance INTO v_current_balance
    FROM user_tokens
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Check if user has tokens
    IF v_current_balance IS NULL OR v_current_balance < 1 THEN
        RETURN false;
    END IF;

    -- Deduct token
    UPDATE user_tokens
    SET 
        balance = balance - 1,
        lifetime_used = lifetime_used + 1,
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
        -1,
        'usage',
        p_description
    );

    RETURN true;
END;
$$;

-- Function to check if user has enough tokens
CREATE OR REPLACE FUNCTION check_user_tokens(
    p_user_id UUID,
    p_required INTEGER DEFAULT 1
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

    RETURN COALESCE(v_balance, 0) >= p_required;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_tokens_updated_at
    BEFORE UPDATE ON user_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_user_tokens_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON user_tokens TO authenticated;
GRANT SELECT ON token_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_tokens TO service_role;
GRANT EXECUTE ON FUNCTION use_token TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_tokens TO authenticated;

-- Comments for documentation
COMMENT ON TABLE user_tokens IS 'Stores user token balances for the billing system';
COMMENT ON TABLE token_transactions IS 'Audit log of all token transactions';
COMMENT ON FUNCTION add_user_tokens IS 'Adds tokens to user account (called by payment webhook)';
COMMENT ON FUNCTION use_token IS 'Deducts a token for audio generation';
COMMENT ON FUNCTION check_user_tokens IS 'Checks if user has enough tokens';
