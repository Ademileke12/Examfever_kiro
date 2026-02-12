import { createClient } from '@/lib/supabase/server'

export interface AffiliateProfile {
    user_id: string
    referral_code: string
    total_balance: number
    referred_count: number
    is_active: boolean
}

export interface Referral {
    referrer_id: string
    referred_user_id: string
    status: 'signed_up' | 'subscribed'
}

export class AffiliateManager {
    /**
     * Get a user's affiliate profile
     */
    async getAffiliateProfile(userId: string) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('affiliate_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) {
            console.error('Error fetching affiliate profile:', error)
            return null
        }

        return data as AffiliateProfile
    }

    /**
     * Record a new referral (signed up)
     */
    async recordReferral(referrerCode: string, referredUserId: string, metadata: any = {}) {
        const supabase = await createClient()

        // 1. Find referrer by code
        const { data: referrer, error: referrerError } = await supabase
            .from('affiliate_profiles')
            .select('user_id')
            .eq('referral_code', referrerCode)
            .single()

        if (referrerError || !referrer) {
            console.warn('Invalid referral code used:', referrerCode)
            return null
        }

        // 2. Prevent self-referral
        if (referrer.user_id === referredUserId) {
            console.warn('User attempted to refer themselves')
            return null
        }

        // 3. Check for previous referral record to avoid duplicates
        const { data: existingReferral } = await supabase
            .from('referrals')
            .select('id')
            .eq('referred_user_id', referredUserId)
            .single()

        if (existingReferral) {
            console.warn('User has already been referred')
            return null
        }

        // 4. Create referral record
        const { data, error } = await supabase
            .from('referrals')
            .insert({
                referrer_id: referrer.user_id,
                referred_user_id: referredUserId,
                status: 'signed_up',
                metadata
            })
            .select()
            .single()

        if (error) {
            console.error('Error recording referral:', error)
            throw error
        }

        // 5. Update referrer count
        await supabase.rpc('increment_affiliate_referral_count', { profile_user_id: referrer.user_id })

        return data
    }

    /**
     * Award commission when a referred user pays for their first subscription
     */
    /**
     * Award commission when a referred user pays for their first subscription
     */
    async awardCommissionIfEligible(userId: string, amount: number, transactionRef: string, req?: Request) {
        const supabase = await createClient()

        // 1. Check if user was referred
        const { data: referral, error: referralError } = await supabase
            .from('referrals')
            .select('*, affiliate_profiles!referrer_id(is_active)')
            .eq('referred_user_id', userId)
            .eq('status', 'signed_up')
            .single()

        if (referralError || !referral) {
            // Not a referred user or already processed
            return null
        }

        // 2. Anti-fraud checks (if request context available)
        if (req) {
            const { checkFraudRisk, getClientIP, getDeviceFingerprint, logFraudAttempt } = await import('@/lib/affiliate/fraud-detection')

            const ipAddress = getClientIP(req)
            const deviceId = getDeviceFingerprint(req)

            const fraudCheck = await checkFraudRisk(
                referral.referrer_id,
                userId,
                ipAddress,
                deviceId
            )

            if (fraudCheck.isFraudulent) {
                // Log and block
                await logFraudAttempt(
                    userId,
                    'commission_blocked',
                    ipAddress,
                    deviceId,
                    true,
                    {
                        reason: fraudCheck.reason,
                        referrer_id: referral.referrer_id,
                        transaction_ref: transactionRef
                    }
                )

                console.warn(`Commission blocked due to fraud risk: ${fraudCheck.reason}`)
                return null
            }
        }

        // 3. Calculate 13% commission
        const commissionAmount = amount * 0.13

        // 4. Update referral status to 'subscribed'
        const { error: updateError } = await supabase
            .from('referrals')
            .update({ status: 'subscribed' })
            .eq('id', referral.id)

        if (updateError) {
            console.error('Error updating referral status:', updateError)
            throw updateError
        }

        // 5. Record commission
        const { error: commError } = await supabase
            .from('affiliate_commissions')
            .insert({
                user_id: referral.referrer_id,
                referral_id: referral.id,
                amount: commissionAmount,
                transaction_reference: transactionRef,
                status: 'paid' // Instant payout to balance
            })

        if (commError) {
            console.error('Error recording commission:', commError)
            throw commError
        }

        // 6. Instantly update referrer's balance
        const { error: balanceError } = await supabase.rpc('update_affiliate_balance', {
            profile_user_id: referral.referrer_id,
            amount: commissionAmount
        })

        if (balanceError) {
            console.error('Error updating affiliate balance:', balanceError)
            throw balanceError
        }

        return {
            referrerId: referral.referrer_id,
            commission: commissionAmount
        }
    }

    /**
     * Simple fraud check based on IP similarity (can be expanded)
     */
    async logAndCheckFraud(userId: string, ip: string, deviceId: string, eventType: string) {
        const supabase = await createClient()

        // Log the activity
        await supabase.from('affiliate_fraud_logs').insert({
            user_id: userId,
            ip_address: ip,
            device_id: deviceId,
            event_type: eventType,
            metadata: { ts: new Date().toISOString() }
        })

        // Simple check: Has this IP referred many users recently?
        // Or is this user's IP the same as their referrer's IP?
        // For MVP, we just track it.
    }
}

export const affiliateManager = new AffiliateManager()
