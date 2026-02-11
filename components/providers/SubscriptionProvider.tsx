'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal'
import { createClient } from '@/lib/supabase/auth'

interface SubscriptionData {
    plan_tier: 'free' | 'standard' | 'premium'
    uploads_allowed: number
    exams_allowed: number
    uploads_used: number
    exams_used: number
    sub_end_date?: string
    is_active: boolean
}

interface SubscriptionContextType {
    subscription: SubscriptionData | null
    loading: boolean
    isModalOpen: boolean
    openModal: () => void
    closeModal: () => void
    refetchStatus: () => Promise<void>
    checkLimit: (type: 'upload' | 'exam') => boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const supabase = createClient()

    const fetchStatus = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setSubscription(null)
                setLoading(false)
                return
            }

            const response = await fetch('/api/subscription/status')
            const result = await response.json()

            if (result.success) {
                setSubscription(result.data)

                // Auto-show modal for new users on free plan (first time only)
                const hasSeenModal = localStorage.getItem('subscription_modal_seen')
                const isFreeUser = result.data.plan_tier === 'free'
                const hasExhaustedLimits = result.data.uploads_used >= result.data.uploads_allowed || result.data.exams_used >= result.data.exams_allowed

                // Show modal if:
                // 1. User is on free plan AND hasn't seen the modal before
                // 2. OR user has exhausted their limits
                if (isFreeUser && (!hasSeenModal || hasExhaustedLimits)) {
                    setIsModalOpen(true)
                    if (!hasSeenModal) {
                        localStorage.setItem('subscription_modal_seen', 'true')
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching subscription status:', error)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    const checkLimit = (type: 'upload' | 'exam'): boolean => {
        if (!subscription) return false

        if (type === 'upload') {
            return subscription.uploads_used < subscription.uploads_allowed
        } else {
            return subscription.exams_used < subscription.exams_allowed
        }
    }

    const handleUpgrade = (plan: string) => {
        window.location.href = `/checkout?plan=${plan.toLowerCase()}`
    }

    return (
        <SubscriptionContext.Provider
            value={{
                subscription,
                loading,
                isModalOpen,
                openModal: () => setIsModalOpen(true),
                closeModal: () => setIsModalOpen(false),
                refetchStatus: fetchStatus,
                checkLimit
            }}
        >
            {children}
            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpgrade={handleUpgrade}
            />
        </SubscriptionContext.Provider>
    )
}

export const useSubscription = () => {
    const context = useContext(SubscriptionContext)
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider')
    }
    return context
}
