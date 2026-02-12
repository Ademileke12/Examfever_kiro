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

        // 1. Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.log('[AffiliateStats] Unauthorized:', authError)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        console.log('[AffiliateStats] User authenticated:', user.id)

        // 2. Get affiliate profile
        console.log('[AffiliateStats] Fetching profile...')
        let { data: profile, error: profileError } = await supabase
            .from('affiliate_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // 3. Lazy create profile if missing
        if (!profile) {

            // Generate a random 8-character referral code
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            let referralCode = ''
            for (let i = 0; i < 8; i++) {
                referralCode += chars.charAt(Math.floor(Math.random() * chars.length))
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

            profile = newProfile
        }

        // 4. Fetch Referrals
        console.log('[AffiliateStats] Fetching referrals...')
        const { data: referrals, error: referralsError } = await supabase
            .from('referrals')
            .select(`
                id,
                referred_user_id,
                status,
                created_at
            `)
            .eq('referrer_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (referralsError) {
            console.error('[AffiliateStats] Referrals error:', referralsError)
        }

        // 5. Get user profiles for referred users
        const referredUserIds = referrals?.map(r => r.referred_user_id) || []
        let userProfiles: any[] = []

        if (referredUserIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
                .from('user_profiles')
                .select('id, full_name, email')
                .in('id', referredUserIds)

            if (profilesError) {
                console.error('[AffiliateStats] User profiles error:', profilesError)
            } else {
                userProfiles = profiles || []
            }
        }

        // 6. Fetch Commissions
        console.log('[AffiliateStats] Fetching commissions...')
        const { data: commissions, error: commissionsError } = await supabase
            .from('affiliate_commissions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (commissionsError) {
            console.error('[AffiliateStats] Commissions error:', commissionsError)
        }

        // 7. Process data for frontend
        const referralsWithUsers = referrals?.map(referral => {
            const userProfile = userProfiles.find(p => p.id === referral.referred_user_id)
            return {
                id: referral.id,
                user: {
                    name: userProfile?.full_name || 'New User',
                    email: userProfile?.email || 'N/A'
                },
                status: referral.status,
                created_at: referral.created_at
            }
        }) || []

        const pendingCount = referrals?.filter(r => r.status === 'signed_up').length || 0
        const subscribedCount = referrals?.filter(r => r.status === 'subscribed').length || 0
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

        return NextResponse.json({
            success: true,
            data: {
                referralCode: profile.referral_code,
                totalBalance: parseFloat(profile.total_balance?.toString() || '0'),
                referredCount: profile.referred_count || 0,
                pendingCount,
                subscribedCount,
                referralLink: `${siteUrl}/register?ref=${profile.referral_code}`,
                recentReferrals: referralsWithUsers,
                recentCommissions: (commissions || []).map(c => ({
                    id: c.id,
                    amount: parseFloat(c.amount?.toString() || '0'),
                    status: c.status,
                    created_at: c.created_at
                }))
            }
        })

    } catch (error) {
        console.error('[AffiliateStats] Global error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
