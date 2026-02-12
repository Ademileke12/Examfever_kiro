-- =====================================================
-- 015_BACKFILL_REFERRALS.SQL
-- Repairs missing referral records for existing users
-- based on their 'referred_by' metadata.
-- =====================================================

DO $$
DECLARE
    u RECORD;
    referrer_uid UUID;
    ref_code TEXT;
BEGIN
    FOR u IN 
        SELECT id, raw_user_meta_data 
        FROM auth.users 
        WHERE raw_user_meta_data->>'referred_by' IS NOT NULL 
          AND raw_user_meta_data->>'referred_by' <> ''
    LOOP
        ref_code := u.raw_user_meta_data->>'referred_by';
        
        -- Find the referrer UUID
        SELECT user_id INTO referrer_uid 
        FROM public.affiliate_profiles 
        WHERE referral_code = ref_code 
        LIMIT 1;
        
        IF referrer_uid IS NOT NULL AND referrer_uid <> u.id THEN
            -- 1. Backfill the referral record if missing
            INSERT INTO public.referrals (referrer_id, referred_user_id, status)
            VALUES (referrer_uid, u.id, 'signed_up')
            ON CONFLICT (referred_user_id) DO NOTHING;
            
            -- 2. Recalculate referred_count for the referrer
            UPDATE public.affiliate_profiles
            SET referred_count = (
                SELECT count(*) 
                FROM public.referrals 
                WHERE referrer_id = referrer_uid
            )
            WHERE user_id = referrer_uid;
            
            -- 3. Check if this user has already paid (success transaction) 
            -- but the referral status is still 'signed_up'
            IF EXISTS (
                SELECT 1 FROM public.payment_transactions 
                WHERE user_id = u.id AND status = 'success'
            ) THEN
                -- If they've paid, we should probably set status to subscribed
                UPDATE public.referrals 
                SET status = 'subscribed', 
                    updated_at = NOW() 
                WHERE referred_user_id = u.id AND status = 'signed_up';
                
                -- Note: This won't automatically award the commission money 
                -- to avoid double-charging or complex balance logic in SQL.
                -- The AffiliateManager will see 'subscribed' and know it's done.
                -- However, for the reported user, we might want to manually award 
                -- or provide a script to do so.
            END IF;
        END IF;
    END LOOP;
END $$;
