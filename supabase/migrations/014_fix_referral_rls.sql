-- =====================================================
-- 014_FIX_REFERRAL_RLS.SQL
-- Fixes RLS policies and joins for the affiliate system
-- =====================================================

-- 1. Ensure referrals table allows the referred user to see their own record
-- This is critical for the verification API which runs as the referred user
DROP POLICY IF EXISTS "Referrers can view own referrals" ON public.referrals;

CREATE POLICY "Users involved in referral can view it" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- 2. Add a more direct foreign key constraint to help PostgREST joins
-- referrals.referrer_id now explicitly references affiliate_profiles.user_id
-- We first need to ensure the target column has a unique index (which it does: user_id is UNIQUE)
ALTER TABLE public.referrals 
DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey,
ADD CONSTRAINT referrals_referrer_id_fkey 
    FOREIGN KEY (referrer_id) 
    REFERENCES public.affiliate_profiles(user_id) 
    ON DELETE CASCADE;

-- 3. Fix the increment count function to be more resilient
CREATE OR REPLACE FUNCTION public.increment_affiliate_referral_count(profile_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.affiliate_profiles
    SET referred_count = referred_count + 1,
        updated_at = NOW()
    WHERE user_id = profile_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure RLS on affiliate_profiles allows the system to see profiles too
-- (Policies already allow auth.uid() = user_id, which is fine for the owner)

-- 5. Final check on the consolidated trigger:
-- We'll make it even more robust by adding explicit logging if the referrer is not found
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS TRIGGER AS $$
DECLARE
    referrer_uid UUID;
    ref_code TEXT;
    new_affiliate_code TEXT;
BEGIN
    -- A. Create Core User Profile
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.user_profiles.full_name, EXCLUDED.full_name);
    
    -- B. Create Default User Preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- C. Create Default User Stats
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- D. Initialize Subscription (FREE Tier)
    INSERT INTO public.user_subscriptions (user_id, plan_tier, uploads_allowed, exams_allowed)
    VALUES (NEW.id, 'free', 2, 2)
    ON CONFLICT (user_id) DO NOTHING;

    -- E. Create Affiliate Profile
    new_affiliate_code := upper(substring(md5(random()::text) from 1 for 8));
    
    INSERT INTO public.affiliate_profiles (user_id, referral_code, total_balance, referred_count, is_active)
    VALUES (NEW.id, new_affiliate_code, 0, 0, TRUE)
    ON CONFLICT (user_id) DO NOTHING;

    -- F. Handle Referral Logic
    ref_code := NEW.raw_user_meta_data->>'referred_by';
    IF ref_code IS NOT NULL AND ref_code <> '' THEN
        -- Find referrer by code
        SELECT user_id INTO referrer_uid FROM public.affiliate_profiles WHERE referral_code = ref_code LIMIT 1;
        
        IF referrer_uid IS NOT NULL AND referrer_uid <> NEW.id THEN
            -- Record the referral relationship
            INSERT INTO public.referrals (referrer_id, referred_user_id, status)
            VALUES (referrer_uid, NEW.id, 'signed_up')
            ON CONFLICT (referred_user_id) DO NOTHING;
            
            -- Increment the referrer's count
            UPDATE public.affiliate_profiles 
            SET referred_count = referred_count + 1 
            WHERE user_id = referrer_uid;
            
            RAISE NOTICE 'Referral recorded: Referrer % to Referred %', referrer_uid, NEW.id;
        ELSE
            RAISE WARNING 'Referrer code % not found or self-referral', ref_code;
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user_complete for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
