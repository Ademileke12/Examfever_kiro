'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function ReferralTracker() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const ref = searchParams.get('ref')
        if (ref) {
            console.log('🎯 Referral code detected:', ref)

            // Store in cookie for 30 days
            const expires = new Date()
            expires.setDate(expires.getDate() + 30)

            document.cookie = `referral_code=${ref}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`

            // Also store in localStorage as backup
            localStorage.setItem('referral_code', ref)
            localStorage.setItem('referral_timestamp', new Date().toISOString())
        }
    }, [searchParams])

    return null
}
