import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get Affiliate Stats for Current User
 * 
 * GET /api/affiliate/stats
 * Returns: { referralCode, totalBalance, referredCount, recentReferrals, recentCommissions }
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Authenticate request
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get affiliate profile
        let { data: profile, error: profileError } = await supabase
            .from('affiliate_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // If profile doesn't exist, create one (lazy creation for existing users)
        if (!profile) {
            // Generate a random 8-character referral code
            const generateCode = () => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                let code = ''
                for (let i = 0; i < 8; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length))
                }
                return code
            }

            let referralCode = generateCode()
            let isUnique = false

            // Simple retry logic for uniqueness (collision is rare with 8 chars but possible)
            while (!isUnique) {
                const { data: existing } = await supabase
                    .from('affiliate_profiles')
                    .select('id')
                    .eq('referral_code', referralCode)
                    .single()

                if (!existing) isUnique = true
                else referralCode = generateCode()
            }

            const { data: newProfile, error: createError } = await supabase
                .from('affiliate_profiles')
                .insert({
                    user_id: user.id,
                    referral_code: referralCode,
                    total_balance: 0,
                    referred_count: 0,
                    is_active: true
                })
                .select()
                .single()

            if (createError) {
                console.error('Failed to create affiliate profile:', createError)
                return NextResponse.json({
                    error: 'Failed to create affiliate profile',
                    details: createError.message
                }, { status: 500 })
            }

            profile = newProfile
        }

        // Get referrals with user details
        const { data: referrals, error: referralsError } = await supabase
            .from('referrals')
            .select(`
        id,
        referred_user_id,
        status,
        created_at,
        updated_at
      `)
            .eq('referrer_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        // Get user profiles for referred users
        const referredUserIds = referrals?.map(r => r.referred_user_id) || []
        let userProfiles: any[] = []

        if (referredUserIds.length > 0) {
            const { data: profiles } = await supabase
                .from('user_profiles')
                .select('id, full_name, email')
                .in('id', referredUserIds)

            userProfiles = profiles || []
        }

        // Combine referrals with user info
        const referralsWithUsers = referrals?.map(referral => {
            const userProfile = userProfiles.find(p => p.id === referral.referred_user_id)
            return {
                id: referral.id,
                user: {
                    id: referral.referred_user_id,
                    name: userProfile?.full_name || 'Unknown User',
                    email: userProfile?.email || ''
                },
                status: referral.status,
                created_at: referral.created_at,
                updated_at: referral.updated_at
            }
        }) || []

        // Get commissions
        const { data: commissions, error: commissionsError } = await supabase
            .from('affiliate_commissions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        // Calculate stats
        const pendingReferrals = referrals?.filter(r => r.status === 'signed_up').length || 0
        const subscribedReferrals = referrals?.filter(r => r.status === 'subscribed').length || 0
        const totalEarnings = commissions?.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0

        return NextResponse.json({
            success: true,
            data: {
                referralCode: profile.referral_code,
                totalBalance: parseFloat(profile.total_balance.toString()),
                referredCount: profile.referred_count,
                pendingCount: pendingReferrals,
                subscribedCount: subscribedReferrals,
                totalEarnings,
                isActive: profile.is_active,
                referralLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/register?ref=${profile.referral_code}`,
                recentReferrals: referralsWithUsers.slice(0, 10),
                recentCommissions: (commissions || []).slice(0, 10).map(c => ({
                    id: c.id,
                    amount: parseFloat(c.amount.toString()),
                    currency: c.currency,
                    status: c.status,
                    created_at: c.created_at,
                    transaction_reference: c.transaction_reference
                }))
            }
        })

    } catch (error) {
        console.error('Error fetching affiliate stats:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
