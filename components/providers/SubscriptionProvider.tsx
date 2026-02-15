'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal'
import { useAuth } from '@/hooks/useAuth'

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
    isPaid: boolean
    error: string | null
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, loading: authLoading } = useAuth()
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchStatus = useCallback(async () => {
        if (authLoading) return // Wait for auth to initialize

        // Reset error on new fetch attempt
        setError(null)
        setLoading(true)

        if (!user) {
            setSubscription(null)
            setLoading(false)
            return
        }

        try {
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
            } else {
                console.error('Failed to fetch subscription:', result.error)
                setError(result.error || 'Failed to load subscription')
            }
        } catch (error) {
            console.error('Error fetching subscription status:', error)
            setError('Connection failed')
        } finally {
            setLoading(false)
        }
    }, [user, authLoading])

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
                checkLimit,
                isPaid: subscription ? subscription.plan_tier !== 'free' : false,
                error
            }}
        >
            {children}
            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpgrade={handleUpgrade}
                currentPlanTier={subscription?.plan_tier}
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
