import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/security/error-handler'

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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Get affiliate profile
        let { data: profile, error: profileError } = await supabase
            .from('affiliate_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // 3. Lazy create profile if missing
        if (!profile) {
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

            if (createError) throw createError
            profile = newProfile
        }

        // 4. Fetch Referrals
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

        // 5. Get user profiles for referred users with resilient handling
        const referredUserIds = referrals?.map(r => r.referred_user_id) || []
        let userProfiles: any[] = []

        if (referredUserIds.length > 0) {
            // We use a safe try-catch for the profile lookup to prevent total failure if the table is missing/locked
            try {
                const { data: profiles, error: profilesError } = await supabase
                    .from('user_profiles')
                    .select('id, full_name, email')
                    .in('id', referredUserIds)

                if (!profilesError) {
                    userProfiles = profiles || []
                }
            } catch (err) {
                console.warn('[AffiliateStats] Profile lookup failed, using fallbacks.')
            }
        }

        // 6. Fetch Commissions
        const { data: commissions, error: commissionsError } = await supabase
            .from('affiliate_commissions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        // 7. Process data for frontend (with PII masking and fallbacks)
        const referralsWithUsers = referrals?.map(referral => {
            const userProfile = userProfiles.find(p => p.id === referral.referred_user_id)

            // Resilient Email Masking
            const email = userProfile?.email || 'student@examfever.com'
            const [local, domain] = email.split('@')
            const maskedEmail = local ? `${local[0]}***${local[local.length - 1]}@${domain}` : 's***t@examfever.com'

            // Resilient Name Masking
            const name = userProfile?.full_name || 'Anonymous Student'
            const maskedName = name.split(' ').map((n: string) => n.length > 0 ? `${n[0]}***` : '***').join(' ')

            return {
                id: referral.id,
                user: {
                    name: maskedName,
                    email: maskedEmail
                },
                status: referral.status,
                created_at: referral.created_at
            }
        }) || []

        const pendingCount = referrals?.filter(r => r.status === 'signed_up').length || 0
        const subscribedCount = referrals?.filter(r => r.status === 'subscribed').length || 0
        const actualCount = referrals?.length || 0

        let siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        if (!siteUrl) {
            const host = request.headers.get('host')
            const protocol = host?.includes('localhost') ? 'http' : 'https'
            siteUrl = host ? `${protocol}://${host}` : 'http://localhost:3001'
        }

        return NextResponse.json({
            success: true,
            data: {
                referralCode: profile.referral_code,
                totalBalance: parseFloat(profile.total_balance?.toString() || '0'),
                referredCount: Math.max(profile.referred_count || 0, actualCount),
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
        return handleApiError(error, 'AffiliateStats')
    }
}
