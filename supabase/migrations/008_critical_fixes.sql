-- =====================================================
-- EXAMFEVER SIMPLIFIED DATABASE MIGRATION
-- This version removes complex policies to avoid type issues
-- =====================================================

-- =====================================================
-- 1. CREATE QUESTION_BUNDLES TABLE (CRITICAL FIX)
-- =====================================================

CREATE TABLE IF NOT EXISTS question_bundles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    total_questions INTEGER DEFAULT 0,
    difficulty_distribution JSONB DEFAULT '{"easy": 0, "medium": 0, "hard": 0}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, file_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_question_bundles_user_id ON question_bundles(user_id);
CREATE INDEX IF NOT EXISTS idx_question_bundles_file_id ON question_bundles(file_id);

-- Enable RLS
ALTER TABLE question_bundles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "question_bundles_select" ON question_bundles;
DROP POLICY IF EXISTS "question_bundles_insert" ON question_bundles;
DROP POLICY IF EXISTS "question_bundles_update" ON question_bundles;
DROP POLICY IF EXISTS "question_bundles_delete" ON question_bundles;

-- Create RLS policies with type casting
CREATE POLICY "question_bundles_select" ON question_bundles FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "question_bundles_insert" ON question_bundles FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "question_bundles_update" ON question_bundles FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "question_bundles_delete" ON question_bundles FOR DELETE USING (user_id::text = auth.uid()::text);

-- =====================================================
-- 2. CREATE USER_SUBSCRIPTIONS TABLE (IF MISSING)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'standard', 'premium')),
    uploads_allowed INTEGER DEFAULT 2,
    exams_allowed INTEGER DEFAULT 2,
    uploads_used INTEGER DEFAULT 0,
    exams_used INTEGER DEFAULT 0,
    sub_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sub_end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_subscriptions_select" ON user_subscriptions;
CREATE POLICY "user_subscriptions_select" ON user_subscriptions FOR SELECT USING (user_id::text = auth.uid()::text);

-- =====================================================
-- 3. CREATE PAYMENT_TRANSACTIONS TABLE (IF MISSING)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    status TEXT NOT NULL,
    plan_tier TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(reference);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_transactions_select" ON payment_transactions;
CREATE POLICY "payment_transactions_select" ON payment_transactions FOR SELECT USING (user_id::text = auth.uid()::text);

-- =====================================================
-- 4. UPDATE EXISTING TABLES (IF NEEDED)
-- =====================================================

-- Update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to question_bundles
DROP TRIGGER IF EXISTS update_question_bundles_updated_at ON question_bundles;
CREATE TRIGGER update_question_bundles_updated_at
    BEFORE UPDATE ON question_bundles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to user_subscriptions
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. UPDATE handle_new_user FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile (if table exists)
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Create default preferences (if table exists)
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create default stats (if table exists)
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Initialize subscription to FREE tier
    INSERT INTO public.user_subscriptions (user_id, plan_tier, uploads_allowed, exams_allowed)
    VALUES (NEW.id, 'free', 2, 2)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN undefined_table THEN
        -- If tables don't exist, just return
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds the critical question_bundles table
-- and subscription system tables to fix the "bundle not found" error
-- =====================================================
