-- =====================================================
-- 016_REPAIR_COMMISSIONS.SQL
-- Awards missing commissions to referrers for users who 
-- are already 'subscribed' but didn't have their balance updated.
-- =====================================================

DO $$
DECLARE
    ref RECORD;
    tx_amount DECIMAL;
    comm_amount DECIMAL;
    tx_ref TEXT;
BEGIN
    -- 1. Scan for all referrals that are in 'subscribed' status
    FOR ref IN 
        SELECT r.id, r.referrer_id, r.referred_user_id 
        FROM public.referrals r
        WHERE r.status = 'subscribed'
    LOOP
        -- 2. Check if a commission record already exists for this specific referral
        IF NOT EXISTS (
            SELECT 1 FROM public.affiliate_commissions 
            WHERE referral_id = ref.id
        ) THEN
            -- 3. Find the successful payment transaction for the referred user
            -- We take the most recent successful payment
            SELECT amount, reference INTO tx_amount, tx_ref
            FROM public.payment_transactions
            WHERE user_id = ref.referred_user_id AND status = 'success'
            ORDER BY created_at DESC
            LIMIT 1;

            -- 4. If a payment was found, award the 13% commission
            IF tx_amount IS NOT NULL THEN
                comm_amount := tx_amount * 0.13;
                
                -- A. Create the commission record
                INSERT INTO public.affiliate_commissions (
                    user_id, 
                    referral_id, 
                    amount, 
                    transaction_reference, 
                    status
                )
                VALUES (
                    ref.referrer_id, 
                    ref.id, 
                    comm_amount, 
                    tx_ref, 
                    'paid'
                );
                
                -- B. Update the referrer's total balance
                UPDATE public.affiliate_profiles
                SET total_balance = total_balance + comm_amount,
                    updated_at = NOW()
                WHERE user_id = ref.referrer_id;
                
                RAISE NOTICE 'Commission of % awarded to referrer % for user %', comm_amount, ref.referrer_id, ref.referred_user_id;
            ELSE
                RAISE WARNING 'No successful transaction found for subscribed user %', ref.referred_user_id;
            END IF;
        END IF;
    LOOP END; -- Fixed syntax below
END $$;

-- Actually, let's use a cleaner LOOP syntax
DO $$
DECLARE
    ref RECORD;
    tx_amount DECIMAL;
    comm_amount DECIMAL;
    tx_ref TEXT;
BEGIN
    FOR ref IN 
        SELECT r.id, r.referrer_id, r.referred_user_id 
        FROM public.referrals r
        WHERE r.status = 'subscribed'
    LOOP
        IF NOT EXISTS (SELECT 1 FROM public.affiliate_commissions WHERE referral_id = ref.id) THEN
            SELECT amount, reference INTO tx_amount, tx_ref
            FROM public.payment_transactions
            WHERE user_id = ref.referred_user_id AND status = 'success'
            ORDER BY created_at DESC
            LIMIT 1;

            IF tx_amount IS NOT NULL THEN
                comm_amount := tx_amount * 0.13;
                
                INSERT INTO public.affiliate_commissions (user_id, referral_id, amount, transaction_reference, status)
                VALUES (ref.referrer_id, ref.id, comm_amount, tx_ref, 'paid');
                
                UPDATE public.affiliate_profiles
                SET total_balance = total_balance + comm_amount, updated_at = NOW()
                WHERE user_id = ref.referrer_id;
                
                RAISE NOTICE 'Repaired commission: % for referrer %', comm_amount, ref.referrer_id;
            END IF;
        END IF;
    END LOOP;
END $$;
