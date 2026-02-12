'use client'

import { useState } from 'react'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useAffiliate } from '@/hooks/useAffiliate'
import {
    Users,
    Wallet,
    Link as LinkIcon,
    Copy,
    CheckCircle2,
    TrendingUp,
    History
} from 'lucide-react'

export function AffiliateDashboard() {
    const { user } = useAuthContext()
    const { profile, referrals, loading, error } = useAffiliate(user)
    const [copied, setCopied] = useState(false)

    const referralLink = typeof window !== 'undefined'
        ? `${window.location.origin}/signup?ref=${profile?.referral_code || ''}`
        : ''

    const handleCopyLink = () => {
        if (profile?.referral_code) {
            navigator.clipboard.writeText(referralLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                Error loading affiliate data: {error}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-6 md:mb-10">
                <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                    Affiliate Program
                </h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed font-medium">
                    Invite friends and earn <span className="text-[#7C3AED] dark:text-[#A78BFA] font-bold">13% commission</span> on their first subscription.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1A1A1E] p-5 md:p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                <Wallet className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Current Balance</p>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white font-numeric tracking-tight">
                            ₦{profile?.total_balance?.toLocaleString() || '0'}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1E] p-5 md:p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                                <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Referrals</p>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white font-numeric tracking-tight">
                            {profile?.referred_count || 0}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Referral Link Section */}
            <div className="bg-[#7C3AED] rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-[#7C3AED]/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                <div className="flex items-center gap-2 mb-4 relative z-10">
                    <LinkIcon className="w-5 h-5 text-purple-200" />
                    <h3 className="font-bold text-lg leading-tight tracking-tight">Your Invite Link</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-black/20 p-2 rounded-2xl backdrop-blur-md border border-white/10 relative z-10">
                    <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="bg-transparent border-none focus:ring-0 text-sm flex-grow truncate px-2 text-white placeholder-white/50"
                    />
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#7C3AED] rounded-xl text-sm font-bold hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-black/10"
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
                    </button>
                </div>
                <p className="mt-4 text-sm text-purple-100 relative z-10 font-medium">
                    Share this link with your network and earn commissions instantly on successful subscriptions.
                </p>
            </div>

            {/* Referral History */}
            <div className="bg-white dark:bg-[#111114] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center gap-2 bg-gray-50/50 dark:bg-white/[0.02]">
                    <History className="w-4 h-4 text-gray-400" />
                    <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white tracking-tight">Referral History</h3>
                </div>

                {referrals.length === 0 ? (
                    <div className="p-12 md:p-16 text-center">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No referrals found yet.<br />Start sharing your link!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-[400px] overflow-y-auto">
                        {referrals.map((referral: any) => (
                            <div key={referral.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">
                                        User #{referral.referred_user_id.substring(0, 8)}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                        {new Date(referral.created_at).toLocaleDateString()} • {new Date(referral.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${referral.status === 'subscribed'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {referral.status === 'subscribed' ? 'Subscribed' : 'Signed Up'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
