import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/auth'
import { AffiliateProfile, Referral } from '@/lib/affiliate/affiliate-manager'
import { User } from '@supabase/supabase-js'

export function useAffiliate(user: User | null) {
    const [profile, setProfile] = useState<AffiliateProfile | null>(null)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        const fetchAffiliateData = async () => {
            setLoading(true)
            try {
                // 1. Fetch Affiliate Profile
                const { data: profileData, error: profileError } = await supabase
                    .from('affiliate_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (profileError) {
                    if (profileError.code !== 'PGRST116') { // PGRST116 logic: No rows found
                        console.error('Profile fetch error:', profileError)
                        throw profileError
                    }
                } else {
                    setProfile(profileData)
                }

                // 2. Fetch Referrals
                const { data: referralsData, error: referralsError } = await supabase
                    .from('referrals')
                    .select('*')
                    .eq('referrer_id', user.id)
                    .order('created_at', { ascending: false })

                if (referralsError) {
                    console.error('Referrals fetch error:', referralsError)
                    throw referralsError
                }

                setReferrals(referralsData || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchAffiliateData()

        // 3. Subscribe to real-time changes
        const channel = supabase
            .channel('affiliate_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'affiliate_profiles', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    setProfile(payload.new as AffiliateProfile)
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'referrals', filter: `referrer_id=eq.${user.id}` },
                (payload) => {
                    setReferrals(prev => [payload.new as Referral, ...prev])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, supabase])

    return { profile, referrals, loading, error }
}
