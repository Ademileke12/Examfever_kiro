-- =====================================================
-- 012_AFFILIATE_SYSTEM.SQL
-- =====================================================

-- Affiliate Profiles table
-- Stores the high-level affiliate data for each user
CREATE TABLE IF NOT EXISTS affiliate_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    total_balance DECIMAL(12,2) DEFAULT 0,
    referred_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table
-- Tracks who referred whom
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    status TEXT DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'subscribed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate Commissions table
-- Records individual earnings per referral
CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- The person earning the commission
    referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    transaction_reference TEXT, -- Links to payment_transactions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate Fraud Logs
-- Tracks IPs and Device IDs to prevent self-referrals
CREATE TABLE IF NOT EXISTS affiliate_fraud_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ip_address TEXT,
    device_id TEXT,
    event_type TEXT NOT NULL, -- 'signup_attempt', 'commission_attempt'
    is_flagged BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_referral_code ON affiliate_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user_id ON affiliate_commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_fraud_logs_user_id ON affiliate_fraud_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_fraud_logs_ip ON affiliate_fraud_logs(ip_address);

-- RLS Policies
ALTER TABLE affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_fraud_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own affiliate profile" ON affiliate_profiles 
    FOR SELECT USING (auth.uid() = user_id);

-- Referrals: Referrers can view their referrals
CREATE POLICY "Referrers can view own referrals" ON referrals 
    FOR SELECT USING (auth.uid() = referrer_id);

-- Commissions: Users can view their own earnings
CREATE POLICY "Users can view own commissions" ON affiliate_commissions 
    FOR SELECT USING (auth.uid() = user_id);

-- Fraud logs: Only admins (or system) should probably see this, but for now let's allow own view
CREATE POLICY "Users can view own fraud logs" ON affiliate_fraud_logs 
    FOR SELECT USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_affiliate_profiles_updated_at
    BEFORE UPDATE ON affiliate_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create affiliate profile on signup
-- We can extend the existing handle_new_user function or add a new trigger
CREATE OR REPLACE FUNCTION public.handle_new_affiliate()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
BEGIN
    -- Generate a unique referral code
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    INSERT INTO public.affiliate_profiles (user_id, referral_code)
    VALUES (NEW.id, new_code);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user affiliate profile
DROP TRIGGER IF EXISTS on_auth_user_created_affiliate ON auth.users;
CREATE TRIGGER on_auth_user_created_affiliate
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_affiliate();

-- RPC Functions for Affiliate System
CREATE OR REPLACE FUNCTION public.increment_affiliate_referral_count(profile_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.affiliate_profiles
    SET referred_count = referred_count + 1,
        updated_at = NOW()
    WHERE user_id = profile_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_affiliate_balance(profile_user_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE public.affiliate_profiles
    SET total_balance = total_balance + amount,
        updated_at = NOW()
    WHERE user_id = profile_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modified handle_new_user to handle referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    referrer_uid UUID;
    ref_code TEXT;
BEGIN
    -- 1. Create profile
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- 2. Create default preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    -- 3. Create default stats
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id);
    
    -- 4. Initialize subscription to FREE tier
    INSERT INTO public.user_subscriptions (user_id, plan_tier, uploads_allowed, exams_allowed)
    VALUES (NEW.id, 'free', 2, 2);

    -- 5. Handle Referral Logic
    ref_code := NEW.raw_user_meta_data->>'referred_by';
    IF ref_code IS NOT NULL AND ref_code <> '' THEN
        -- Find referrer by code
        SELECT user_id INTO referrer_uid FROM public.affiliate_profiles WHERE referral_code = ref_code LIMIT 1;
        
        IF referrer_uid IS NOT NULL AND referrer_uid <> NEW.id THEN
            -- Record the referral
            INSERT INTO public.referrals (referrer_id, referred_user_id, status)
            VALUES (referrer_uid, NEW.id, 'signed_up');
            
            -- Note: referred_count is already incremented via handle_new_affiliate logic if we use it, 
            -- but let's be explicit and robust here.
            UPDATE public.affiliate_profiles 
            SET referred_count = referred_count + 1 
            WHERE user_id = referrer_uid;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup (already exists, but just in case)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix for Lazy Creation: Allow users to insert their own profile
CREATE POLICY "Users can create own affiliate profile" ON affiliate_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
