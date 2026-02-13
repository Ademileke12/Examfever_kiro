-- =====================================================
-- 017_REPAIR_USER_PROFILES.SQL
-- Ensures user_profiles table exists and is populated
-- =====================================================

-- 1. Re-create the user_profiles table if it's missing
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Standard RLS Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 4. Backfill from auth.users
-- This ensures every auth user has a profile record
INSERT INTO public.user_profiles (id, email, full_name)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)) as full_name
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. Restore the consolidated trigger if it was broken
-- We re-create the trigger to ensure future users are always initialized
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS TRIGGER AS $$
DECLARE
    referrer_uid UUID;
    ref_code TEXT;
    new_affiliate_code TEXT;
BEGIN
    -- Profile creation
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Affiliate Profile
    new_affiliate_code := upper(substring(md5(random()::text) from 1 for 8));
    INSERT INTO public.affiliate_profiles (user_id, referral_code, total_balance, referred_count, is_active)
    VALUES (NEW.id, new_affiliate_code, 0, 0, TRUE)
    ON CONFLICT (user_id) DO NOTHING;

    -- Referral Logic
    ref_code := NEW.raw_user_meta_data->>'referred_by';
    IF ref_code IS NOT NULL AND ref_code <> '' THEN
        SELECT user_id INTO referrer_uid FROM public.affiliate_profiles WHERE referral_code = ref_code LIMIT 1;
        IF referrer_uid IS NOT NULL AND referrer_uid <> NEW.id THEN
            INSERT INTO public.referrals (referrer_id, referred_user_id, status)
            VALUES (referrer_uid, NEW.id, 'signed_up')
            ON CONFLICT (referred_user_id) DO NOTHING;
            
            UPDATE public.affiliate_profiles SET referred_count = referred_count + 1 WHERE user_id = referrer_uid;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_complete ON auth.users;
CREATE TRIGGER on_auth_user_created_complete
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_complete();
