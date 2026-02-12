'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
    Copy,
    Users,
    TrendingUp,
    Wallet,
    AlertCircle,
    Share2,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Sparkles,
    ChevronRight,
    Loader2
} from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { motion, AnimatePresence } from 'framer-motion'

interface AffiliateStats {
    referralCode: string
    totalBalance: number
    referredCount: number
    pendingCount: number
    subscribedCount: number
    referralLink: string
    recentReferrals: {
        id: string
        user: {
            name: string
            email: string
        }
        status: 'signed_up' | 'subscribed'
        created_at: string
    }[]
    recentCommissions: {
        id: string
        amount: number
        status: string
        created_at: string
    }[]
}

export default function AffiliatePage() {
    return (
        <ProtectedRoute>
            <AffiliateDashboardContent />
        </ProtectedRoute>
    )
}

function AffiliateDashboardContent() {
    const [stats, setStats] = useState<AffiliateStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Check for mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Fetch stats
    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch('/api/affiliate/stats')
                const contentType = response.headers.get('content-type')

                if (!response.ok) {
                    const text = await response.text()
                    console.error('[AffiliateDashboard] API Error:', response.status, text)
                    setError(`API Error (${response.status}): ${text.substring(0, 50)}...`)
                    setLoading(false)
                    return
                }

                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text()
                    console.error('[AffiliateDashboard] Non-JSON response:', text)
                    setError('Received invalid response from server')
                    setLoading(false)
                    return
                }

                const data = await response.json()

                if (data.success) {
                    setStats(data.data)
                } else {
                    setError(data.error || 'Failed to load affiliate stats')
                }
            } catch (err) {
                console.error('Error loading stats:', err)
                setError('Failed to load affiliate stats')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const copyToClipboard = () => {
        if (stats?.referralLink) {
            navigator.clipboard.writeText(stats.referralLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-8 pt-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#0A0A0C] font-sans">
            {/* Header Section with dynamic background */}
            <div className="relative overflow-hidden bg-white dark:bg-[#111114] border-b border-border/40 pb-16 pt-32">
                <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-slate-800/20 dark:[mask-image:linear-gradient(0deg,rgba(0,0,0,0.8),transparent)] pointer-events-none"></div>
                {/* Glow blobs */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="container relative mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20">
                            <Sparkles className="w-3 h-3" />
                            Affiliate Program
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6">
                            Start Earning with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">ExamsFever</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Share your unique link and earn <span className="text-foreground font-semibold">13% commission</span> instantly for every friend that subscribes.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        {/* Referral Link Card */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <Card className="relative bg-white dark:bg-[#1A1A1E] border-border/50 shadow-xl p-2 rounded-2xl overflow-hidden">
                                <div className="flex flex-col md:flex-row items-center gap-2 p-1.5 md:p-2">
                                    <div className="flex-1 w-full flex items-center gap-3 bg-muted/30 dark:bg-black/20 rounded-xl px-3 md:px-4 py-3 border border-border/50 min-w-0">
                                        <Share2 className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <code className="flex-1 font-mono text-sm truncate text-foreground min-w-0">
                                            {stats?.referralLink || 'Loading...'}
                                        </code>
                                    </div>
                                    <Button
                                        onClick={copyToClipboard}
                                        size="lg"
                                        className={`w-full md:w-auto shrink-0 gap-2 font-semibold shadow-lg shadow-primary/20 transition-all ${copied ? 'bg-green-500 hover:bg-green-600' : ''
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy Link
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 -mt-8 relative z-10 max-w-7xl">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatsCard
                        icon={<Wallet className="w-6 h-6" />}
                        label="Total Earnings"
                        value={formatCurrency(stats?.totalBalance || 0)}
                        color="green"
                        delay={0}
                    />
                    <StatsCard
                        icon={<Users className="w-6 h-6" />}
                        label="Total Referred"
                        value={stats?.referredCount?.toString() || "0"}
                        color="blue"
                        delay={0.1}
                    />
                    <StatsCard
                        icon={<Clock className="w-6 h-6" />}
                        label="Pending Signup"
                        value={stats?.pendingCount?.toString() || "0"}
                        color="orange"
                        delay={0.2}
                    />
                    <StatsCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        label="Subscribed"
                        value={stats?.subscribedCount?.toString() || "0"}
                        color="purple"
                        delay={0.3}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Recent Referrals */}
                    <Card className="bg-white dark:bg-[#111114] border-border/50 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border/50 flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Recent Referrals
                            </h3>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1">
                                View All <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-2">
                            {stats?.recentReferrals?.length === 0 ? (
                                <EmptyState
                                    icon={<Users className="w-10 h-10 text-muted-foreground/30" />}
                                    message="No referrals yet"
                                    description="Share your link to start earning!"
                                />
                            ) : (
                                <div className="space-y-1">
                                    {stats?.recentReferrals.map((referral) => (
                                        <div key={referral.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/10">
                                                    {referral.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{referral.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDate(referral.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${referral.status === 'subscribed'
                                                ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                                                : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                                                }`}>
                                                {referral.status === 'subscribed' ? 'Subscribed' : 'Pending'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Earnings History */}
                    <Card className="bg-white dark:bg-[#111114] border-border/50 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border/50 flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-green-500" />
                                Earnings History
                            </h3>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500 gap-1">
                                View All <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-2">
                            {stats?.recentCommissions?.length === 0 ? (
                                <EmptyState
                                    icon={<Wallet className="w-10 h-10 text-muted-foreground/30" />}
                                    message="No commissions yet"
                                    description="Refer friends to earn your first payout!"
                                />
                            ) : (
                                <div className="space-y-1">
                                    {stats?.recentCommissions.map((commission) => (
                                        <div key={commission.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-foreground">Commission Earned</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{formatDate(commission.created_at)} • {commission.status}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-green-600 text-sm">
                                                +{formatCurrency(commission.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Share2 className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <AlertCircle className="w-6 h-6" />
                            How it works
                        </h4>
                        <div className="space-y-4 text-blue-50">
                            <p className="leading-relaxed">
                                Share your unique referral link with friends and classmates. When they sign up using your link and pay for their first subscription, you'll instantly earn <strong className="text-white">13% commission</strong> on their payment.
                            </p>
                            <ul className="list-disc list-inside space-y-2 opacity-90 pl-2">
                                <li> commissions are credited instantly to your balance.</li>
                                <li>One-time commission per valid user referral.</li>
                                <li>Self-referrals are strictly prohibited and monitored.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper Components

function StatsCard({ icon, label, value, color, delay }: { icon: React.ReactNode, label: string, value: string, color: 'blue' | 'green' | 'orange' | 'purple', delay: number }) {
    const colorStyles = {
        blue: 'bg-blue-500/10 text-blue-600',
        green: 'bg-green-500/10 text-green-600',
        orange: 'bg-orange-500/10 text-orange-600',
        purple: 'bg-purple-500/10 text-purple-600',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Card className="bg-white dark:bg-[#111114] border-border/50 shadow-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${colorStyles[color]} transition-colors`}>
                        {icon}
                    </div>
                    {/* Optional trend indicator could go here */}
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-foreground mb-1 tracking-tight">{value}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{label}</p>
                </div>
            </Card>
        </motion.div>
    )
}

function EmptyState({ icon, message, description }: { icon: React.ReactNode, message: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 bg-muted/30 p-4 rounded-full">
                {icon}
            </div>
            <h4 className="font-semibold text-foreground mb-1">{message}</h4>
            <p className="text-sm text-muted-foreground max-w-[200px]">{description}</p>
        </div>
    )
}
