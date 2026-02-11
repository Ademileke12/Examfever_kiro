'use client'

import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/ui/Navbar'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal'
import { AddOnStore } from '@/components/subscription/AddOnStore'
import { UsageTracker } from '@/components/subscription/UsageTracker'
import { useSubscription } from '@/components/providers/SubscriptionProvider'
import { Crown, Zap, Rocket, Check, History, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SubscriptionContent() {
    const { subscription, loading, refetchStatus } = useSubscription()
    const [showModal, setShowModal] = React.useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    React.useEffect(() => {
        if (searchParams.get('success') === 'true') {
            // Refetch to get updated limits
            refetchStatus()
            // Optional: Show success message/toast
            // Clean up URL
            router.replace('/subscription')
        }
    }, [searchParams, refetchStatus, router])

    const handleUpgrade = async (planName: string) => {
        const planKey = planName.toLowerCase()

        if (planKey.includes('free')) {
            // Downgrade logic
            if (confirm('Are you sure you want to downgrade to the Free plan? You will lose access to premium features immediately.')) {
                try {
                    const response = await fetch('/api/subscription/downgrade', { method: 'POST' })
                    const result = await response.json()
                    if (result.success) {
                        window.location.reload()
                    } else {
                        alert('Failed to downgrade. Please try again.')
                    }
                } catch (e) {
                    alert('An error occurred.')
                }
            }
        } else {
            // Upgrade redirect
            router.push(`/checkout?plan=${planKey}`)
        }
    }

    const plans = [
        {
            name: 'Free Mode',
            price: 'Free',
            uploads: 2,
            exams: 2,
            icon: Zap,
            color: 'from-blue-500 to-indigo-600',
            features: ['Basic AI Analysis', 'Standard Support', 'Limited History'],
            current: subscription?.plan_tier === 'free'
        },
        {
            name: 'Standard',
            price: '₦3,500',
            uploads: 10,
            exams: 10,
            icon: Rocket,
            color: 'from-purple-500 to-pink-600',
            recommended: true,
            features: ['Priority Generation', 'Expanded Question Bank', 'Performance Tracking', 'Email Support'],
            current: subscription?.plan_tier === 'standard'
        },
        {
            name: 'Premium',
            price: '₦6,300',
            uploads: 15,
            exams: 15,
            icon: Crown,
            color: 'from-amber-500 to-orange-600',
            features: ['Unlimited History', 'Personalized AI Coach', 'Early Access To Features', 'Priority Support', 'Advanced Analytics'],
            current: subscription?.plan_tier === 'premium'
        }
    ]

    return (
        <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#0A0A0C]">
            <ParticleBackground />
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-4 gradient-text">
                        Your Subscription
                    </h1>
                    <p className="text-readable-muted text-lg max-w-2xl mx-auto">
                        Unlock more power, more exams, and faster results with our premium plans.
                    </p>
                </motion.div>

                {/* Current Usage */}
                {subscription && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-12"
                    >
                        <UsageTracker
                            uploadsRemaining={subscription.uploads_allowed - subscription.uploads_used}
                            uploadsTotal={subscription.uploads_allowed}
                            examsRemaining={subscription.exams_allowed - subscription.exams_used}
                            examsTotal={subscription.exams_allowed}
                            expiryDate={subscription.sub_end_date || ''}
                            loading={loading}
                        />
                    </motion.div>
                )}

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className={`relative p-8 rounded-3xl glass glass-hover border-2 ${plan.recommended ? 'border-primary shadow-glow' : 'border-transparent'
                                } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}

                            {plan.current && (
                                <div className="absolute -top-4 right-4 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                                    Current Plan
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
                                <plan.icon className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-2xl font-bold text-readable mb-2">{plan.name}</h3>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-black text-readable">{plan.price}</span>
                                {plan.price !== 'Free' && <span className="text-readable-muted ml-1">/mo</span>}
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-sm text-readable"><span className="font-bold">{plan.uploads}</span> PDF Uploads</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-sm text-readable"><span className="font-bold">{plan.exams}</span> Exams</span>
                                </div>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-sm text-readable-muted">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => plan.current ? null : handleUpgrade(plan.name)}
                                disabled={plan.current}
                                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${plan.current
                                    ? 'bg-green-500/20 text-green-600 cursor-not-allowed'
                                    : plan.recommended
                                        ? 'bg-primary text-white shadow-glow hover:opacity-90'
                                        : 'bg-readable/5 hover:bg-readable/10 text-readable'
                                    }`}
                            >
                                {plan.current ? 'Current Plan' : plan.price === 'Free' ? 'Downgrade' : 'Upgrade Now'}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <AddOnStore />

                {/* FAQ or Additional Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass rounded-3xl p-8 text-center"
                >
                    <h3 className="text-xl font-bold text-readable mb-4">Need Help Choosing?</h3>
                    <p className="text-readable-muted mb-6 max-w-2xl mx-auto">
                        All plans include access to our AI-powered exam generator. Upgrade anytime to unlock more uploads and exams.
                        Monthly subscriptions can be canceled at any time.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary"
                    >
                        Compare Plans
                    </button>
                </motion.div>
            </div>

            <SubscriptionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onUpgrade={handleUpgrade}
            />
        </div>
    )
}

export default function SubscriptionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F9F9FB] dark:bg-[#0A0A0C]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <SubscriptionContent />
        </Suspense>
    )
}
