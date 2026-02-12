-- =====================================================
-- 013_CONSOLIDATED_USER_INIT.SQL
-- Consolidates all user initialization logic into one trigger
-- to prevent race conditions and registration errors.
-- =====================================================

-- 1. Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created_affiliate ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create the consolidated initialization function
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
    ON CONFLICT (id) DO NOTHING;
    
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
    -- We generate a unique referral code
    new_affiliate_code := upper(substring(md5(random()::text) from 1 for 8));
    
    INSERT INTO public.affiliate_profiles (user_id, referral_code, total_balance, referred_count, is_active)
    VALUES (NEW.id, new_affiliate_code, 0, 0, TRUE)
    ON CONFLICT (user_id) DO NOTHING;

    -- F. Handle Referral Logic (if user signed up with a ref link)
    ref_code := NEW.raw_user_meta_data->>'referred_by';
    IF ref_code IS NOT NULL AND ref_code <> '' THEN
        -- Find referrer by code
        -- We check affiliate_profiles table
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
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error (Supabase logs will show this)
    RAISE LOG 'Error in handle_new_user_complete for user %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Still return NEW to allow auth record creation even if profile setup fails partially
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the single consolidated trigger
CREATE TRIGGER on_auth_user_created_complete
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_complete();

-- =====================================================
-- MIGRATION PREPARED
-- =====================================================
